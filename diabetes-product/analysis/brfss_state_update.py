"""Append locally weighted 2025 BRFSS estimates to the 2022–24 state file.

Usage: python brfss_state_update.py data/state-conditions.json OUTPUT.json --cache downloads
The original published CDC values and intervals are preserved. This script uses
state_conditions.py's design, reliability and age-standardization functions.
"""
import argparse
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path

from state_conditions import (
    AGE_GROUPS, BRFSS, CODES, MODULE, TYPES_METHOD, TableRows, download,
    query_usdss, split_age, standardized_prevalence,
)

YEAR = 2025
FILE_PAGE = f'{BRFSS}/annual_{YEAR}.html'
WEIGHTS_PAGE = MODULE.format(YEAR)
RULES = ('Dashboard calculations for 2025 use CDC’s public 2025 BRFSS microdata. '
         'For each state, only respondents on an eligible version of the optional module are used, '
         'with that version’s final weight. The denominator for each diabetes type is all adults with a '
         'valid answer to the core diabetes question. A respondent with a diagnosis who could not identify '
         'their type is retained in that denominator and contributes to neither type’s numerator. '
         'Type 1 requires reported type 1 and current insulin use. Type 2 requires reported type 2, '
         'or reported type 1 with an explicit report of no current insulin use. Estimates for 2022–24 '
         'are CDC’s published estimates; the 2025 microdata calculation is a distinct series.')
METHOD = ('Four age-specific rates are directly standardized to the 2000 U.S. adult population. The 95% '
          'interval uses BRFSS strata, primary sampling units and a logit transformation. The dashboard '
          'withholds a cell with fewer than 50 usable responses, fewer than 10 cases, under eight design '
          'degrees of freedom, or a relative standard error above 30%. Age subgroup rates are crude. '
          'Other reported groups are age-adjusted.')
DETAILS = [['CDC · 2025 BRFSS annual data and codebook', FILE_PAGE],
           ['CDC · 2025 BRFSS state questionnaire versions and weights',WEIGHTS_PAGE],
           ['CDC · Diagnosis and subtype definitions',TYPES_METHOD]]

def state_modules(cache):
    table = TableRows()
    table.feed(download(cache, f'modules{YEAR}.html', WEIGHTS_PAGE).read_text('utf-8'))
    lookup = {name:code for code,(_,name) in CODES.items()}
    by_weight = defaultdict(lambda:defaultdict(set))
    selected = set()
    state = ''
    for row in table.rows:
        if len(row) == 1:
            continue
        if len(row) != 5:
            raise ValueError(f'Unexpected module metadata: {row}')
        state = row[0] or state
        if state not in lookup:
            continue
        weight = row[-2]
        modules = {s.lower().replace('-','').strip() for s in row[-1].split(',')}
        for topic in modules & {'prediabetes','diabetes'}:
            key = (state, topic)
            if key in selected:
                raise ValueError(f'Multiple sampling weights for {key}')
            selected.add(key)
            by_weight[weight][lookup[state]].add(topic)
    return by_weight

def records(cache,weight):
    suffix = '' if weight == '_LLCPWT' else '_V'+weight[-1]
    sas = 'SASOUT25_LLCP'+suffix+'.zip'
    filename = 'LLCP2025ASC.ZIP' if not suffix else 'LLCP25'+suffix[1:]+'_ASC.ZIP'
    base = f'{BRFSS}/{YEAR}/files/'
    with zipfile.ZipFile(download(cache,sas,base+sas)) as z:
        name = next(n for n in z.namelist() if n.lower().endswith('.sas'))
        contents = z.read(name).decode('latin1')
    fields = {k:slice(int(a)-1,int(b or a)) for k,a,b in
              re.findall(r'^\s*([_A-Z0-9]+)\s+(\d+)(?:-(\d+))?\b',contents,re.M)}
    with zipfile.ZipFile(download(cache,filename,base+filename)) as z:
        name = next(n for n in z.namelist() if n.strip().lower().endswith('.asc'))
        with z.open(name) as stream:
            for line in stream:
                yield fields, line

def collect(cache):
    groups = {k:defaultdict(list) for k in ('type1','type2','prediabetes')}
    for weight,states in state_modules(cache).items():
        seen = set()
        for fields,line in records(cache,weight):
            fips = int(line[fields['_STATE']])
            if fips not in states:
                continue
            state = CODES[fips][0]
            psu = (fips, int(line[fields['_PSU']]))
            if psu in seen:
                raise ValueError('Duplicate PSU')
            seen.add(psu)
            age = split_age(int(line[fields['_AGE80']].strip() or b'0'))
            sex = int(line[fields['_SEX']].strip() or b'0')
            base = (int(line[fields['_STSTR']]),float(line[fields[weight]]),age,sex)
            core = line[fields['DIABETE4']].strip()
            if 'diabetes' in states[fips]:
                t,insulin = line[fields['DIABTYPE']].strip(),line[fields['INSULIN1']].strip()
                yes = core == b'1'
                valid = core in (b'1',b'2',b'3',b'4')
                y1 = int(yes and t == b'1' and insulin == b'1') if valid else None
                y2 = int(yes and (t == b'2' or t == b'1' and insulin == b'2')) if valid else None
                groups['type1'][state].append((*base,y1))
                groups['type2'][state].append((*base,y2))
            if 'prediabetes' in states[fips]:
                pre = line[fields['PREDIAB2']].strip()
                yp = None
                if core == b'4':
                    yp = 1
                elif core == b'1':
                    yp = 0
                elif core in (b'2',b'3') and pre in (b'1',b'2',b'3'):
                    yp = int(pre == b'1')
                groups['prediabetes'][state].append((*base,yp))
    return groups

def earlier_groups(cache,data):
    where = ("indicator in ('Diagnosed Type 1 Diabetes','Diagnosed Type 2 Diabetes') AND "
             "year between 2022 and 2023 AND population='Adults Aged 18+ Years' AND education='All' "
             "AND race='All' AND unit='Percentage' AND ((age='Age-Adjusted' AND sex in ('Female','Male')) "
             "OR (age not in ('Age-Adjusted','Crude') AND sex='All'))")
    rows = query_usdss(cache,'usdss-type-groups-2022-23.json',where)
    if len(rows) >= 5000:
        raise ValueError('Unexpected truncation of CDC subgroup response')
    for r in rows:
        key = 'type1' if r['indicator']=='Diagnosed Type 1 Diabetes' else 'type2'
        state = r['state']
        if state not in data[key]['states'] or 'estimate' not in r:
            continue
        groups = data[key]['states'][state].setdefault('groupsByYear',{}).setdefault(r['year'],{'Age':{},'Sex':{}})
        if r['sex'] == 'All':
            groups['Age'][r['age'].replace('-','–')] = float(r['estimate'])
        else:
            groups['Sex'][r['sex']] = float(r['estimate'])

def extend(data, estimates):
    for key,layer in data.items():
        layer['sourceByYear'] = {str(y):(layer['source'] if y<=2024 else 'CDC BRFSS microdata · dashboard analysis')
                                 for y in range(2022,YEAR+1)}
        if key != 'prediabetes':
            if RULES not in layer['notes']:
                layer['notes'].append(RULES)
            layer['breakYears'] = [YEAR]
        else:
            layer['breakYears'] = []
        if METHOD not in layer['notes']:
            layer['notes'].append(METHOD)
        for s in DETAILS:
            if s not in layer['sources']:
                layer['sources'].append(s)
        for state,r in layer['states'].items():
            by_year = r.setdefault('groupsByYear',{})
            if layer['period']=='2024' and r.get('groups') and any(r['groups'].values()):
                by_year['2024'] = r['groups']
            rows = estimates[key].get(state)
            est = standardized_prevalence(rows) if rows else None
            r.pop('n',None)
            r.pop('base',None)
            r['value'] = est['value'] if est else None
            r['ci'] = est['ci'] if est else None
            r['status'] = 'Available' if est else ('Suppressed' if rows else 'No data')
            r['annual'][str(YEAR)] = r['value']
            r['annualCI'][str(YEAR)] = r['ci']
            r['groups'] = {'Age':{},'Sex':{}}
            by_year.pop(str(YEAR),None)
            if not est:
                continue
            r['n'],r['base'] = est['n'],est['base']
            assert 0 < r['ci'][0] <= r['value'] <= r['ci'][1] < 100
            for i,label in enumerate(AGE_GROUPS):
                group = standardized_prevalence(rows,by_age=i)
                if group:
                    r['groups']['Age'][label] = group['value']
            for sex,label in [(1,'Male'),(2,'Female')]:
                group = standardized_prevalence(rows,by_sex=sex)
                if group:
                    r['groups']['Sex'][label] = group['value']
            by_year[str(YEAR)] = r['groups']
        layer['period'] = str(YEAR)
        layer['years'] = [2022,2023,2024,YEAR]
        layer['medianAnnual'][str(YEAR)] = None
        layer['reporting'][str(YEAR)] = sum(r['value'] is not None for r in layer['states'].values())
    return data

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('base',type=Path)
    parser.add_argument('output',type=Path)
    parser.add_argument('--cache',type=Path,default=Path('downloads'))
    args = parser.parse_args()
    args.cache.mkdir(parents=True,exist_ok=True)
    data = json.loads(args.base.read_bytes())
    estimates = collect(args.cache)
    earlier_groups(args.cache,data)
    extend(data,estimates)
    args.output.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
if __name__ == '__main__':
    main()
