"""Calculate the 2025 BRFSS profile of survey respondents caring for someone whose main condition is diabetes.

Place the CDC's 2025 national, V1 and V2 ASCII ZIPs and their supplied SAS input
programs in the input directory passed on the command line. The program uses the CDC's module-by-state routing.
Each state's sample appears in exactly one of the three inputs; Puerto Rico is
outside this 31-state estimate. Run with Python 3, using the standard library.
"""
import argparse
from pathlib import Path
from collections import Counter,defaultdict
import re,zipfile,math,json
arguments = argparse.ArgumentParser(description=__doc__)
arguments.add_argument('inputs', type=Path)
arguments.add_argument('output', type=Path)
args = arguments.parse_args()
root = args.inputs
files=[
 ('2025.asc.zip','SASOUT25_LLCP.SAS','_LLCPWT',{1,2,4,10,12,15,16,18,19,20,22,27,29,30,33,35,38,41,42,44,45,47,48,50,53,54}),
 ('LLCP25V1_ASC.ZIP','SASOUT25_LLCP_V1.SAS','_LCPWTV1',{23}),
 ('LLCP25V2_ASC.ZIP','SASOUT25_LLCP_V2.SAS','_LCPWTV2',{24,25,31,36})]
def groups(variable,rows):
 return variable,[(name,set(codes)) for name,codes in rows]
definitions={
  'sex':groups('_SEX',[('Female',[2]),('Male',[1])]),
  'age':groups('_AGEG5YR',[('18–34 years',range(1,4)),('35–49 years',range(4,7)),('50–64 years',range(7,10)),('65 and older',range(10,14))]),
  'education':groups('_EDUCAG',[('Less than high school',[1]),('High school graduate',[2]),('Some college or technical school',[3]),('College or technical graduate',[4])]),
  'income':groups('_INCOMG1',[('Under $25,000',[1,2]),('$25,000–49,999',[3,4]),('$50,000–99,999',[5]),('$100,000 or more',[6,7])]),
  'race':groups('_RACEGR3',[('White, non-Hispanic',[1]),('Black, non-Hispanic',[2]),('Hispanic, any race',[5]),('Other or multiracial, non-Hispanic',[3,4])]),
  'employment':groups('EMPLOY1',[('Employee',[1]),('Self-employed',[2]),('Retired',[7]),('Unable to work',[8]),('Out of work, student or homemaker',[3,4,5,6])]),
  'relationship':groups('CRGVREL5',[('Parent or parent-in-law',[1]),('Grandparent',[2]),('Spouse or partner',[3]),('Child or grandchild',[4,5]),('Sibling or other relative',[6,7]),('Friend or nonrelative',[8])]),
  'hours':groups('CRGVHRS2',[('Under 20 hours',[1]),('20–39 hours',[2]),('40 hours or more',[3])]),
  'duration':groups('CRGVLNG2',[('Under 2 years',[1,2]),('2 to under 5 years',[3]),('5 years or more',[4])]),
  'household':groups('CRGVHOU2',[('Yes',[1]),('No',[2])]),
  'personal':groups('CRGVPER2',[('Yes',[1]),('No',[2])]),
  'nursing':groups('CRGVNURS',[('Yes',[1]),('No',[2])]),
  'mental':groups('MENTHLTH',[('At least 14 days',range(14,31)),('Fewer than 14 days',[88,*range(1,14)])]),
  'health':groups('GENHLTH',[('Fair or poor',[4,5]),('Good, very good or excellent',[1,2,3])])
}
# One observation per sampled respondent. Count all PSUs in each stratum for
# Taylor standard errors, allowing for the zero contribution outside the domain.
design=Counter()
cases=[]
statecases=Counter()
states=set(); keys=set()
variables={v for v,_ in definitions.values()}
for zipname,sas,wn,include in files:
 assert not (include & states)
 states|=include
 s=(root/sas).read_text('latin1')
 slices={k:slice(int(x)-1,int(y or x)) for k,x,y in re.findall(r'^\s*([_A-Z0-9]+)\s+(\d+)(?:-(\d+))?\b',s,re.M)}
 assert variables <= slices.keys()
 with zipfile.ZipFile(root/zipname) as archive, archive.open(archive.namelist()[0]) as records:
  for record in records:
   state=int(record[slices['_STATE']])
   if state not in include:continue
   stratum=int(record[slices['_STSTR']]); psu=int(record[slices['_PSU']]); weight=float(record[slices[wn]])
   key=(state,psu); assert key not in keys
   keys.add(key); design[stratum]+=1
   if record[slices['CAREGIV1']].strip()!=b'1' or record[slices['CRGVPRB4']].strip() not in (b'4',b'04'): continue
   values={k:int(record[slices[k]].strip() or b'0') for k in variables}
   cases.append((stratum,weight,values));statecases[state]+=1
assert states==set(statecases)
output={'states':len(states),'n':len(cases),'inScopeWeight':sum(w for _,w,_ in cases),'rows':{}}
for name,(v,categories) in definitions.items():
 valid=set.union(*(codes for _,codes in categories))
 rows=[(s,w,a[v]) for s,w,a in cases if a[v] in valid]; total=sum(w for s,w,a in rows)
 values=[]
 for label,codes in categories:
  n=sum(x in codes for _,_,x in rows); p=sum(w for _,w,x in rows if x in codes)/total
  moments=defaultdict(lambda:[0.0,0.0])
  for s,w,x in rows:
   u=w*((x in codes)-p)/total; moments[s][0]+=u;moments[s][1]+=u*u
  variance=sum(design[s]/(design[s]-1)*(sq-sum_u**2/design[s]) for s,(sum_u,sq) in moments.items() if design[s]>1)
  se=math.sqrt(max(0,variance))
  values.append({'label':label,'n':n,'pct':round(100*p,1),'se':round(100*se,2),'rse':round(100*se/p,1) if p else None,'ci':[round(100*max(0,p-1.96*se),1),round(100*min(1,p+1.96*se),1)]})
 output['rows'][name]={'valid':len(rows),'estimates':values}
outfile = args.output
print('states',len(states),'respondents',len(cases),'weighted estimate in states',round(output['inScopeWeight']))
for k,v in output['rows'].items():print(k,v['valid'],[(i['label'],i['pct'],i['n'],i['rse'])for i in v['estimates']])
crossmetrics={
    'Nursing or medical tasks':('CRGVNURS',{1,2},{1}),'Personal care':('CRGVPER2',{1,2},{1}),
    'In paid employment':('EMPLOY1',set(range(1,9)),{1,2}),
    'Frequent mental distress':('MENTHLTH',{88,*range(1,31)},set(range(14,31)))
}
cross=[]
for h in (1,2,3):
 est={}
 for label,(v,valid,positive) in crossmetrics.items():
  respondents=[(s,w,a[v] in positive) for s,w,a in cases if a['CRGVHRS2']==h and a[v] in valid]
  denominator=sum(w for _,w,x in respondents); p=sum(w*x for _,w,x in respondents)/denominator
  m=defaultdict(lambda:[0.,0.])
  for s,w,x in respondents:
   u=w*(x-p)/denominator;m[s][0]+=u;m[s][1]+=u*u
  se=math.sqrt(sum(design[s]/(design[s]-1)*(sq-su**2/design[s]) for s,(su,sq) in m.items() if design[s]>1))
  est[label]={'p':round(100*p,1),'rse':round(100*se/p,1),'n':sum(i[2] for i in respondents),'base':len(respondents)}
 cross.append(est)
output['hoursSubgroups']=cross;outfile.write_text(json.dumps(output,ensure_ascii=False,indent=2))
print('hours cross',cross)
