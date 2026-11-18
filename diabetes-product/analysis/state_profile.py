"""Download the 2024 BRFSS diagnosed-diabetes state profiles from CDC's USDSS API."""
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

where = ("indicator='Diagnosed Diabetes' AND year='2024' AND "
         "((unit='Percentage' AND (age='Age-Adjusted' OR (race='All' AND sex='All' AND education='All'))) "
         "OR (unit='Number' AND age='Crude' AND race='All' AND sex='All' AND education='All'))")
url = 'https://data.cdc.gov/resource/b559-sbez.json?' + urlencode({'$where':where,'$limit':10000})
records = json.load(urlopen(url,timeout=45))
result = {}
for row in records:
    state = row['state']
    if len(state) != 2 or state in ('GU','PR','VI'): continue
    data = result.setdefault(state,{'groups':{}})
    value = float(row['estimate']) if row.get('estimate') else None
    age,sex,race,edu = (row.get(k,'All') for k in ('age','sex','race','education'))
    if row['unit']=='Number':
        data['count']=value
    elif age=='Crude':
        data['crude']=value
    elif age=='Age-Adjusted' and (sex,race,edu)==('All','All','All'):
        data['adjusted']=value
    else:
        dim,label=next(((k,v) for k,v in [('Age',age),('Sex',sex),('Race and ethnicity',race),('Education',edu)]
                        if v not in ('All','Age-Adjusted')), (None,None))
        if dim and value is not None:
            data['groups'].setdefault(dim,{})[label]=round(value,1)
assert len(result)>=49 and result['TX']['count']>3_000_000, result.get('TX')
target=Path(__file__).resolve().parents[1]/'data'/'state-profile.json'
target.write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
