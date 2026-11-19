"""Build paired estimated counts and crude percentages for the state map."""
import openpyxl
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from state_conditions import query_usdss,survey_data,download,CODES
from brfss_state_update import collect

def build(cache,root):
    published="population='Adults Aged 18+ Years' AND age='Crude' AND sex='All' AND education='All' AND race='All'"
    valid=json.loads((root/'state-conditions.json').read_text())
    model=json.loads((root/'type1-cases-2024.json').read_text())
    data={k:{} for k in ('all','type1','type2','prediabetes')}
    jobs=[('all','Diagnosed Diabetes'),('type2','Diagnosed Type 2 Diabetes')]
    def official(job):
        k,indicator=job
        for r in query_usdss(cache,k+'.json',published+" AND indicator='"+indicator+"' AND year>=2000"):
            if r['state'] not in model['states'] or not r.get('estimate'):continue
            record=data[k].setdefault(r['year'],{}).setdefault(r['state'],[None,None])
            if r['unit'] in ('Number','Percentage'):record[int(r['unit']=='Percentage')]=float(r['estimate'])
    with ThreadPoolExecutor(2) as pool:list(pool.map(official,jobs))
    data['type1']['2024']={k:[r['value'],r['percent']] for k,r in model['states'].items()}
    def survey(y):
        folder=cache/str(y);folder.mkdir(exist_ok=True)
        sets=collect(folder) if y==2025 else {'prediabetes':survey_data(folder,y)}
        for k,records in sets.items():
            if k=='type1':continue
            dest=data[k].setdefault(str(y),{})
            for state,rows in records.items():
                if valid[k]['states'][state]['annual'].get(str(y)) is None:continue
                usable=[r for r in rows if r[-1] is not None]
                total=sum(r[1] for r in usable)
                positive=sum(r[1] for r in usable if r[-1]==1)
                dest[state]=[None,round(100*positive/total,3)]
    with ThreadPoolExecutor(4) as pool:list(pool.map(survey,range(2022,2026)))
    for y in range(2022,2026):
        url=f'https://www2.census.gov/programs-surveys/popest/tables/2020-{y}/state/detail/SCPRC-EST{y}-18+POP.xlsx'
        book=openpyxl.load_workbook(download(cache,f'{y}.xlsx',url),read_only=True,data_only=True)
        adults={str(row[0]).lstrip('.'):row[2] for row in book.active.values}
        for k in ('type2','prediabetes'):
            for abbr,name in CODES.values():
                r=data[k].get(str(y),{}).get(abbr)
                if r and r[1] is not None:r[0]=round(adults[name]*r[1]/100,-2)
        book.close()
    (root/'state-case-map.json').write_text(json.dumps(data,separators=(',',':'),sort_keys=True))
if __name__=='__main__':
    import sys
    build(Path(sys.argv[1]),Path(sys.argv[2]))
