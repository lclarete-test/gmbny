"""Rebuild national diabetes type composition and pre-2019 NHIS trend estimates.

Run: python nhis_early_and_mix.py output.json --cache nhis_downloads
Requires Python 3, pandas, NumPy and SciPy. --check-nhis path/to/nhis.json
also checks the analytic denominator against the dashboard's 2019–2025 series.
"""
import argparse
import concurrent.futures
import json
import math
import re
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile

import numpy as np
import pandas as pd
from scipy.special import expit, logit
from scipy.stats import t

CDC = 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS'
NHIS = 'https://www.cdc.gov/nchs/nhis'
LEGACY_TYPE_YEARS = (2016, 2017)
MIX_YEARS = (2021, 2022, 2023)
IDS = ('type1','type2','other')
LABELS = ('Type 1 diabetes','Type 2 diabetes','Other or unreported type')
SOURCES = [
    ['CDC · 2006 self-reported prediabetes estimate, Table 1', 'https://www.cdc.gov/Mmwr/preview/mmwrhtml/mm5744a3.htm'],
    ['NCHS · NHIS Sample Adult public files by year', CDC+'/Datasets/NHIS/'],
    ['NCHS · 2015 diabetes questions and response options', CDC+'/Dataset_Documentation/NHIS/2015/samadult_layout.pdf#page=89'],
    ['NCHS · 2016 diabetes questions and response options', CDC+'/Dataset_Documentation/NHIS/2016/samadult_layout.pdf'],
    ['NCHS · The 2016 sampling design', CDC+'/Dataset_Documentation/NHIS/2016/srvydesc.pdf#page=6'],
    ['CDC · National diabetes surveillance methods and NHIS type coverage', 'https://usdss.cdc.gov/diabetes/data/socrata/National_Burden_Magnitude_methods.html'],
    ['NCHS · NHIS 2019 questionnaire redesign', NHIS+'/about/2019-questionnaire-redesign.html'],
    ['NCHS · Pooling NHIS years and survey design, pp. 47–49', CDC+'/Dataset_Documentation/NHIS/2023/srvydesc-508.pdf#page=47'],
    ['NCHS · NHANES diabetes questionnaire, August 2021 to August 2023', 'https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/DIQ_L.htm'],
]

def fetch(url, path):
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix+'.part')
        with urlopen(url, timeout=90) as response:
            temporary.write_bytes(response.read())
        temporary.replace(path)
    return path

def read_year(year, cache):
    legacy = year < 2019
    fixed = year < 2016
    filename = 'samadult.zip' if fixed else 'samadultcsv.zip' if legacy else f'adult{year%100:02}csv.zip'
    path = fetch(f'{CDC}/Datasets/NHIS/{year}/{filename}', cache/f'{year}.zip')
    layout = (('STRAT_P','PSU_P','WTFA_SA','DIBEV','DIBPRE1') if fixed
              else ('PSTRAT','PPSU','WTFA_SA','DIBEV1','DIBPRE2') if legacy
              else ('PSTRAT','PPSU','WTFA_A','DIBEV_A','PREDIB_A'))
    keys = list(layout)
    if year in LEGACY_TYPE_YEARS or not legacy:
        keys.append('DIBTYPE' if legacy else 'DIBTYPE_A')
    with ZipFile(path) as archive:
        if fixed:
            sas = fetch(f'{CDC}/Program_Code/NHIS/{year}/samadult.sas',cache/f'{year}.sas').read_text(encoding='latin1')
            offsets = {k:(int(a)-1,int(b)) for k,a,b in re.findall(r'\b([A-Z][A-Z0-9_]+)\s+(\d+)\s*-\s*(\d+)\b',sas)}
            assert all(k in offsets and offsets[k][0]<offsets[k][1] for k in keys),year
            cols = [slice(*offsets[k]) for k in keys]
            member = next(n for n in archive.namelist() if n.lower().endswith('.dat'))
            with archive.open(member) as stream:
                rows = [[int(record[col].strip() or -1) for col in cols] for record in stream]
            frame = pd.DataFrame(rows, columns=keys)
        else:
            member = next(n for n in archive.namelist() if n.lower().endswith('.csv'))
            with archive.open(member) as stream:
                frame = pd.read_csv(stream,usecols=keys)
            frame = frame[keys]
    new_names=['stratum','psu','weight','diagnosis','prediabetes']
    if len(keys)==6:
        new_names.append('reported_type')
    frame.columns=new_names
    assert len(frame)>15000 and frame['weight'].notna().all() and frame[['stratum','psu']].notna().all().all(), year
    frame = frame.loc[frame.weight>0].copy()
    if 'reported_type' not in frame:
        frame['reported_type'] = np.nan
    assert frame.loc[frame.diagnosis.eq(1),'reported_type'].dropna().isin([1,2,3,7,8,9]).all()
    return frame

def ratio(data, domain, event):
    """Survey ratio with zero contributions for all PSUs outside the domain."""
    weighted_domain = data.weight * domain
    weighted_event = data.weight * (domain & event)
    total = weighted_domain.sum()
    p = weighted_event.sum()/total
    assert 0 < p < 1
    scores = (weighted_event - p*weighted_domain)/total
    psus = scores.groupby([data.stratum, data.psu]).sum()
    strata = psus.groupby(level=0)
    m = strata.size()
    assert m.min() >= 2
    df = int((m-1).sum())
    centered = psus - strata.transform('mean')
    var = float((centered.pow(2).groupby(level=0).sum() * m/(m-1)).sum())
    crit = t.ppf(.975, df)
    radius = crit*math.sqrt(var)/(p*(1-p))
    bounds = np.round(100*expit(logit(p)+np.array([-radius,radius])),2).tolist()
    return {'pct':round(100*p,2),'ci':bounds,'millions':round(weighted_event.sum()/1e6,3),
            'sampleCases':int((domain & event).sum())}

def annual(year, data):
    diagnosed = data.diagnosis.eq(1)
    # Earlier files accept volunteered “borderline” as a valid diagnosis response.
    no_diabetes = data.diagnosis.isin([2,3]) if year < 2019 else data.diagnosis.eq(2)
    prediabetes = no_diabetes & (data.prediabetes.eq(1) | data.diagnosis.eq(3))
    valid = diagnosed | prediabetes | (no_diabetes & data.prediabetes.eq(2))
    events = [diagnosed & data.reported_type.eq(1), diagnosed & data.reported_type.eq(2), prediabetes]
    cells = [ratio(data,valid,yes) if yes.any() else None for yes in events]
    if year in LEGACY_TYPE_YEARS or year >= 2019:
        assert all(cells), year
    else:
        assert cells[:2] == [None,None] and cells[2], year
    return {'year':year,'values':[c['pct'] if c else None for c in cells],
            'intervals':[c['ci'] if c else None for c in cells]}

def composition(frames):
    # NCHS uses the original masked variance units in files pooled within this design period.
    data = pd.concat([frames[y] for y in MIX_YEARS],ignore_index=True)
    data['weight'] = data.weight/len(MIX_YEARS)
    diagnosed = data.diagnosis.eq(1)
    events = (data.reported_type.eq(1),data.reported_type.eq(2),~data.reported_type.isin([1,2]))
    rows = [dict(id=key, label=label, **ratio(data,diagnosed,c))
            for key,label,c in zip(IDS,LABELS,events)]
    known_status = data.diagnosis.isin([1,2])
    for row, event in zip(rows,events):
        all_adults = ratio(data,known_status,diagnosed & event)
        row['adultPct'] = all_adults['pct']
        row['adultCI'] = all_adults['ci']
    millions = data.loc[diagnosed,'weight'].sum()/1e6
    assert abs(sum(r['pct'] for r in rows)-100)<=0.011
    assert abs(sum(r['millions'] for r in rows)-millions)<.002
    assert sum(r['sampleCases'] for r in rows)==diagnosed.sum()
    other_detail = []
    for key, label, event in [
        ('specifiedOther','Another specified type',data.reported_type.eq(3)),
        ('unknown','Unknown, refused or unreported type',~data.reported_type.isin([1,2,3]))
    ]:
        other_detail.append(dict(id=key,label=label,**ratio(data,diagnosed,event)))
    assert sum(row['sampleCases'] for row in other_detail) == rows[2]['sampleCases']
    return {'period':'2021–2023','denominator':'U.S. adults aged 18+ who reported a diabetes diagnosis',
            'millions':round(millions,3),'sampleCases':int(diagnosed.sum()),'rows':rows,'otherDetail':other_detail}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    parser.add_argument('--cache',type=Path,default=Path('nhis_downloads'))
    parser.add_argument('--check-nhis',type=Path)
    args=parser.parse_args()
    years=sorted(set(range(2007,2019)) | set(MIX_YEARS) | (set(range(2019,2026)) if args.check_nhis else set()))
    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        frames=dict(zip(years,pool.map(lambda year:read_year(year,args.cache),years)))
    if args.check_nhis:
        comparison = json.loads(args.check_nhis.read_text())['trend']
        for y,*expected in comparison:
            assert annual(y,frames[y])['values']==expected, y
    # CDC published 4.0% and its interval directly from 2006, with a five-item questionnaire.
    early=[{'year':2006,'values':[None,None,4.0],'intervals':[None,None,[3.7,4.4]]}]
    early += [annual(year,frames[year]) for year in range(2007,2019)]
    result = {
        'mix': composition(frames), 'early':early, 'breakBeforeYears':[2007,2016,2019],
        'sources':SOURCES,
        'notes':[
            'NHANES interviewed adults about diagnosed diabetes, measured glucose and A1C, and did not ask the reported diabetes type. The by-type composition uses a separate sample, the 2021–2023 NHIS Sample Adult interviews. Counts are annual average noninstitutionalized civilian adults estimated directly from NHIS weights. The survey populations, methods and dates differ.',
            'The composition denominator includes every adult who reported being diagnosed with diabetes outside pregnancy. Type 1 and type 2 are the types respondents reported. Other or unreported type includes another type and missing, refused or unknown responses. Shares among all adults use NHIS adults with a known diagnosis status. This series does not apply a medication-based classification rule.',
            'NHIS first collected the respondent-reported diabetes type in 2016, omitted the item in 2018, and resumed it in the 2019 redesign. Gaps indicate unavailable estimates. Before 2019 the prediabetes item also counted being told of impaired glucose tolerance, impaired fasting glucose or high blood sugar. In 2006, CDC asked about these conditions separately and published a combined estimate. Starting in 2019 NHIS asked specifically about a diagnosis of prediabetes or borderline diabetes. Year-to-year changes across questionnaire revisions may reflect the change in wording.',
            'The 2016 survey introduced a new sampling design and added prediabetes to the initial response option previously labeled borderline. The follow-up question continued to name the same five conditions. The change from 2015 to 2016 includes increases in both the initial response and the follow-up and cannot be attributed to a single cause.',
            'Annual rates use NHIS Sample Adult weights and the denominator of adults with ascertainable diabetes or prediabetes status. Pooled 2021–2023 counts divide annual weights by three. Survey-design confidence intervals use NHIS public strata and primary sampling units with Taylor linearization and a logit transformation. The 2006 estimate and interval are as published by CDC.'
        ]
    }
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')

if __name__=='__main__':
    main()
