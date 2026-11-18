"""Rebuild the state diabetes map from CDC public data. Python 3, standard library.

Usage: python state_conditions.py state-conditions.json --cache brfss_downloads
The cache holds the original BRFSS ASCII archives, SAS layouts and module tables.
"""
import argparse
import json
import math
import re
import shutil
import time
import zipfile
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

YEARS = (2022, 2023, 2024)
LATEST = YEARS[-1]
CODES = {
    1: ('AL','Alabama'), 2: ('AK','Alaska'), 4: ('AZ','Arizona'), 5: ('AR','Arkansas'),
    6: ('CA','California'), 8: ('CO','Colorado'), 9: ('CT','Connecticut'), 10: ('DE','Delaware'),
    11: ('DC','District of Columbia'), 12: ('FL','Florida'), 13: ('GA','Georgia'), 15: ('HI','Hawaii'),
    16: ('ID','Idaho'), 17: ('IL','Illinois'), 18: ('IN','Indiana'), 19: ('IA','Iowa'),
    20: ('KS','Kansas'), 21: ('KY','Kentucky'), 22: ('LA','Louisiana'), 23: ('ME','Maine'),
    24: ('MD','Maryland'), 25: ('MA','Massachusetts'), 26: ('MI','Michigan'), 27: ('MN','Minnesota'),
    28: ('MS','Mississippi'), 29: ('MO','Missouri'), 30: ('MT','Montana'), 31: ('NE','Nebraska'),
    32: ('NV','Nevada'), 33: ('NH','New Hampshire'), 34: ('NJ','New Jersey'), 35: ('NM','New Mexico'),
    36: ('NY','New York'), 37: ('NC','North Carolina'), 38: ('ND','North Dakota'), 39: ('OH','Ohio'),
    40: ('OK','Oklahoma'), 41: ('OR','Oregon'), 42: ('PA','Pennsylvania'), 44: ('RI','Rhode Island'),
    45: ('SC','South Carolina'), 46: ('SD','South Dakota'), 47: ('TN','Tennessee'), 48: ('TX','Texas'),
    49: ('UT','Utah'), 50: ('VT','Vermont'), 51: ('VA','Virginia'), 53: ('WA','Washington'),
    54: ('WV','West Virginia'), 55: ('WI','Wisconsin'), 56: ('WY','Wyoming')
}
STATES = [abbr for abbr, _ in CODES.values()]
SAMPLE = 'Adults Aged 18+ Years'
AGE_GROUPS = ('18–44','45–64','65–74','75+')
# CDC/NCHS 2000 U.S. standard population, ages 18+.
AGE_WEIGHTS = [n / 203852188 for n in (108151050, 60991658, 18135514, 16573966)]
assert abs(sum(AGE_WEIGHTS)-1) < 1e-10
DATASET = 'https://data.cdc.gov/d/b559-sbez'
TYPES_METHOD = 'https://usdss.cdc.gov/diabetes/data/socrata/State_Burden_Magnitude_methods.html'
LAB_METHOD = 'https://www.cdc.gov/diabetes-state-local/php/state-profiles/data-sources-methods.html'
AGE_METHOD = 'https://www.cdc.gov/nchs/hus/sources-definitions/age-adjustment.htm'
BRFSS = 'https://www.cdc.gov/brfss/annual_data'
MODULE = 'https://www.cdc.gov/brfss/questionnaires/modules/state{}.htm'

def download(cache, name, url):
    path = cache / name
    if path.is_file():
        return path
    for attempt in range(3):
        try:
            temp = path.with_name(path.name + '.part')
            with urlopen(Request(url,headers={'User-Agent':'diabetes-research-dashboard'}),timeout=75) as response, temp.open('wb') as output:
                shutil.copyfileobj(response, output)
            temp.replace(path)
            return path
        except OSError:
            if attempt == 2:
                raise
            time.sleep(1)

def query_usdss(cache, name, where):
    query = urlencode({'$where':where, '$order':'indicator,year,state,age,sex', '$limit':5000})
    path = download(cache, name, 'https://data.cdc.gov/resource/b559-sbez.json?' + query)
    return json.loads(path.read_bytes())

def blank_state():
    return {'value':None, 'ci':None, 'status':'No data', 'annual':{y:None for y in YEARS},
            'annualCI':{y:None for y in YEARS}, 'groups':{'Age':{}, 'Sex':{}}}

def metric(label, source, source_url, notes):
    return {'label':label, 'unit':'Age-adjusted prevalence (%)', 'period':str(LATEST),
            'years':list(YEARS), 'denominator':'Adults age 18 and older', 'source':source, 'sourceUrl':source_url,
            'notes':notes, 'medianAnnual':{y:None for y in YEARS}, 'states':{s:blank_state() for s in STATES}}

def published_types(cache):
    common = "indicator in ('Diagnosed Type 1 Diabetes','Diagnosed Type 2 Diabetes') AND population='Adults Aged 18+ Years' AND race='All' AND education='All'"
    totals = query_usdss(cache, 'usdss-state-types.json', common + " AND age='Age-Adjusted' AND sex='All' AND unit in ('Percentage','Median of States') AND year between 2022 and 2024")
    groups = query_usdss(cache, 'usdss-type-groups.json', common + " AND year=2024 AND unit='Percentage' AND ((age='Age-Adjusted' AND sex in ('Female','Male')) OR (age not in ('Age-Adjusted','Crude') AND sex='All'))")
    result = {}
    for key, name in [('type1','Type 1'),('type2','Type 2')]:
        indicator = 'Diagnosed ' + name + ' Diabetes'
        diagnosis = ('CDC classifies respondents who report type 1 and current insulin use as having type 1 diabetes.'
            if key == 'type1' else 'CDC includes respondents reporting type 2 and those reporting type 1 without current insulin use in its type 2 estimate.')
        info = metric('Diagnosed '+name.lower()+' diabetes', 'CDC U.S. Diabetes Surveillance System · BRFSS', DATASET, [
            diagnosis,
            'The optional module limits geographic coverage. CDC age-adjusted percentages to the 2000 U.S. adult population. The denominator is all adults in the state. Age-specific subgroup percentages are crude within the named age band.',
            'Published 95% confidence intervals and CDC suppressions are retained. The state median is shown only if CDC publishes one.'
        ])
        info['sources'] = [['CDC · State diabetes indicators',DATASET],['CDC · State surveillance methods',TYPES_METHOD]]
        for row in totals:
            if row['indicator'] != indicator:
                continue
            state, year = row['state'], int(row['year'])
            val = float(row['estimate']) if 'estimate' in row else None
            bounds = [float(row['lowerlimit']),float(row['upperlimit'])] if 'lowerlimit' in row else None
            if state == 'State Median':
                info['medianAnnual'][year] = val
            if state not in info['states']:
                continue
            rec = info['states'][state]
            rec['annual'][year], rec['annualCI'][year] = val, bounds
            if year == LATEST:
                rec.update(value=val, ci=bounds, status='Available' if val is not None else row.get('estimatefootnote','No data'))
        for row in groups:
            if row['indicator'] != indicator or 'estimate' not in row or row['state'] not in info['states']:
                continue
            sex = row['sex'] != 'All'
            group = row['sex'] if sex else row['age'].replace('-','–')
            info['states'][row['state']]['groups']['Sex' if sex else 'Age'][group] = float(row['estimate'])
        result[key] = info
    return result

class TableRows(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.row = None
        self.cell = None
    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = []
        elif tag in ('td','th') and self.row is not None:
            self.cell = []
    def handle_data(self, text):
        if self.cell is not None:
            self.cell.append(text)
    def handle_endtag(self, tag):
        if tag in ('td','th') and self.cell is not None:
            self.row.append(' '.join(' '.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            self.rows.append(self.row)
            self.row = None

def module_routes(cache, year):
    html = TableRows()
    html.feed(download(cache, f'modules{year}.html', MODULE.format(year)).read_text('utf-8'))
    lookup = {name:fips for fips,(_,name) in CODES.items()}
    routes = {}
    state = None
    for cells in html.rows:
        if len(cells) == 1:
            continue  # One-cell table title.
        if len(cells) != 5:
            raise ValueError(f'Unexpected CDC module table row: {cells}')
        loc, _, _, weight, modules = cells
        state = loc or state
        if state not in lookup:
            continue
        if not any(v.lower().replace('-','').strip() == 'prediabetes' for v in modules.split(',')):
            continue
        fips = lookup[state]
        if fips in routes:
            raise ValueError('State received module in more than one file: '+state)
        routes[fips] = weight
    return routes

def data_files(cache, year, weight):
    short = str(year)[-2:]
    suffix = '' if weight == '_LLCPWT' else '_V'+weight[-1]
    sas = f'SASOUT{short}_LLCP{suffix}'+('.SAS' if year == 2022 else '.zip')
    archive = f'LLCP{year}ASC.zip' if weight == '_LLCPWT' else f'LLCP{short}V{weight[-1]}_ASC.ZIP'
    base = f'{BRFSS}/{year}/files/'
    saspath = download(cache, sas, base+sas)
    if sas.lower().endswith('.zip'):
        with zipfile.ZipFile(saspath) as z:
            contents = z.read(next(n for n in z.namelist() if n.lower().endswith('.sas'))).decode('latin1')
    else:
        contents = saspath.read_text('latin1')
    columns = {key:slice(int(a)-1,int(b or a)) for key,a,b in re.findall(r'^\s*([_A-Z0-9]+)\s+(\d+)(?:-(\d+))?\b',contents,re.M)}
    return download(cache, archive, base+archive), columns

def split_age(age):
    if 18 <= age <= 80:
        return int(age>=45)+int(age>=65)+int(age>=75)
    return -1

def survey_data(cache, year):
    routes = module_routes(cache, year)
    by_state = defaultdict(list)
    for weight in sorted(set(routes.values())):
        wanted = {code for code,w in routes.items() if w == weight}
        path, fields = data_files(cache, year, weight)
        seen = set()
        with zipfile.ZipFile(path) as archive, archive.open(next(n for n in archive.namelist() if n.strip().lower().endswith('.asc'))) as records:
            for row in records:
                fips = int(row[fields['_STATE']])
                if fips not in wanted:
                    continue
                state = CODES[fips][0]
                psu = int(row[fields['_PSU']])
                if (state,psu) in seen:
                    raise ValueError(f'Duplicate PSU in {state}')
                seen.add((state,psu))
                core = row[fields['DIABETE4']].strip()
                module = row[fields['PREDIAB2']].strip()
                y = None
                if core == b'4':  # Volunteered prediabetes on the core diabetes question.
                    y = 1
                elif core == b'1':  # Established diabetes, absent from the prediabetes numerator.
                    y = 0
                elif core in (b'2',b'3') and module in (b'1',b'2',b'3'):
                    y = int(module == b'1')  # Pregnancy-only prediabetes is not a case.
                age = split_age(int(row[fields['_AGE80']].strip() or b'0'))
                by_state[state].append((int(row[fields['_STSTR']]), float(row[fields[weight]]),
                                        age, int(row[fields['_SEX']].strip() or b'0'), y))
    if len(by_state) != len(routes):
        raise ValueError(f'Incomplete state/module routing in {year}')
    return by_state

def standardized_prevalence(records, by_age=None, by_sex=None):
    # Taylor-linearized direct standardization; zero-contribution PSUs remain in every domain.
    design = Counter(row[0] for row in records)
    design_df = len(records) - len(design)
    denominator, numerator = [0.]*4, [0.]*4
    groups = range(4) if by_age is None else (by_age,)
    std = AGE_WEIGHTS if by_age is None else [1.]*4
    valid = [(s,w,a,y) for s,w,a,sex,y in records if y is not None and a>=0
             and (by_age is None or a == by_age) and (by_sex is None or sex == by_sex)]
    for _,w,a,y in valid:
        denominator[a] += w
        numerator[a] += w*y
    cases = sum(y for _,_,_,y in valid)
    if not all(denominator[a] for a in groups):
        return None
    rate = {a:numerator[a]/denominator[a] for a in groups}
    p = sum(std[a]*rate[a] for a in groups)
    if not 0 < p < 1:
        return None
    totals = defaultdict(lambda:[0.,0.])
    for s,w,a,y in valid:
        u = std[a]*w*(y-rate[a])/denominator[a]
        totals[s][0] += u
        totals[s][1] += u*u
    variance = 0.
    for s,(total,squares) in totals.items():
        m = design[s]
        variance += (m/(m-1)*(squares-total**2/m)) if m>1 else squares
    se = math.sqrt(max(variance,0.))
    if len(valid)<50 or cases<10 or design_df<8 or se/p > 0.30:
        return None
    lgt = math.log(p/(1-p))
    d = 1.95996398454*se/(p*(1-p))
    bounds = [round(100/(1+math.exp(-x)),2) for x in (lgt-d,lgt+d)]
    return {'value':round(100*p,2), 'ci':bounds, 'n':cases, 'base':len(valid), 'status':'Available'}

def fill_prediabetes(cache):
    info = metric('Reported prediabetes','CDC BRFSS · dashboard analysis', f'{BRFSS}/annual_2024.html', [
        'Percent of all adults who report that a clinician told them they had prediabetes, outside pregnancy, with no reported diabetes diagnosis. The survey includes no blood test for this measure. This is known prediabetes and misses people who have never been told.',
        'The BRFSS optional module and volunteered core responses are combined only for jurisdictions that used the full prediabetes module. The analysis uses each state’s official questionnaire version and final sampling weight, then directly standardizes the four age-specific estimates to the 2000 U.S. adult population. Age-specific subgroup estimates are crude within the named band.',
        'Confidence intervals use stratified, PSU-based Taylor linearization and a logit transformation. Estimates are withheld for a base below 50, fewer than 10 observed cases, fewer than eight design degrees of freedom or a relative standard error over 30%.'
    ])
    info['sources'] = [['CDC · BRFSS '+str(y)+ ' public file',f'{BRFSS}/annual_{y}.html'] for y in YEARS]
    info['sources'] += [['CDC · '+str(y)+' state questionnaire versions and weights',MODULE.format(y)] for y in YEARS]
    info['sources'] += [['CDC · State prediabetes case definition',LAB_METHOD],['NCHS · 2000 standard population',AGE_METHOD]]
    for year in YEARS:
        by_state = survey_data(cache,year)
        for state,records in by_state.items():
            rec = info['states'][state]
            est = standardized_prevalence(records)
            if est is None:
                if year == LATEST:
                    rec['status'] = 'Suppressed'
                continue
            rec['annual'][year], rec['annualCI'][year] = est['value'], est['ci']
            if year == LATEST:
                rec.update(est)
                for j,group in enumerate(AGE_GROUPS):
                    sub = standardized_prevalence(records,by_age=j)
                    if sub:
                        rec['groups']['Age'][group] = sub['value']
                for k,group in ((1,'Male'),(2,'Female')):
                    sub = standardized_prevalence(records,by_sex=k)
                    if sub:
                        rec['groups']['Sex'][group] = sub['value']
    return info

def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('output',type=Path)
    args.add_argument('--cache',type=Path,default=Path('brfss_cache'))
    opts = args.parse_args()
    opts.cache.mkdir(parents=True,exist_ok=True)
    data = published_types(opts.cache)
    data['prediabetes'] = fill_prediabetes(opts.cache)
    for name, info in data.items():
        info['reporting'] = {year:sum(s['annual'][year] is not None for s in info['states'].values()) for year in YEARS}
        assert set(info['states']) == set(STATES)
        assert 5 < info['reporting'][LATEST] <= 51
        for s in info['states'].values():
            if s['value'] is not None:
                assert 0 <= s['ci'][0] <= s['value'] <= s['ci'][1] <= 100
        print(name,info['reporting'], 'example, Texas:',info['states']['TX'],flush=True)
    opts.output.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
if __name__ == '__main__':
    main()
