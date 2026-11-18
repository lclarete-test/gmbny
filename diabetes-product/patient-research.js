import {atlasFigure} from './atlas-figures.js';
import {barList, dataTable, escapeHTML, lineChart, matrix, sourcesFooter} from './charts.js';
import {heading, card, pair} from './epidemiology.js';
import {links} from './evidence.js';
import {monitor, cgmSources, cgmMedicare} from './audience.js';

const scopes=['Type 2','Type 1','Prediabetes only','All diagnosed'];
const conditionLabel=scope=>({'Type 2':'type 2 diabetes','Type 1':'type 1 diabetes','Prediabetes only':'prediabetes without diagnosed diabetes','All diagnosed':'diagnosed diabetes, all types'}[scope]);
function controls(scope,key){
  return `<div class="scope-controls" aria-label="Population">${scopes.map(s=>`<button type="button" data-cohort="${key}" data-value="${s}" aria-pressed="${s===scope}">${s}</button>`).join('')}</div>`;
}
const surveySources=[['NCHS · NHIS annual datasets and questionnaires','https://www.cdc.gov/nchs/nhis/documentation/'],['NCHS · 2025 Sample Adult study and codebook',links.nhis]];
export function populationHistory(nhis,scope,dimension,interactive=false){
  const history=nhis.profileTrends[scope], population=dimension==='Population';
  return {title:population?'How many adults reported this condition?':'How the patient profile changed',unit:`${population?'Millions of U.S. adults':'Share of the selected adult population (%)'} · ${conditionLabel(scope)} · NHIS`,
    controls:interactive?`<label class="picker">Measure <select id="profile-dimension">${Object.keys(history).map(k=>`<option ${k===dimension?'selected':''}>${k}</option>`).join('')}</select></label>`:'',
    format:population?'millions':'percent',digits:1,labels:nhis.trend.map(row=>row[0]),series:history[dimension],source:links.nhis};
}
export function patientProfile(nhis,view){
  const scope=view.patientScope,p=nhis.profiles[scope];
  const d=Object.entries(p.groups).map(([key,list])=>`<section><h3>${escapeHTML(key)}</h3><div class="profile-bars">${list.map(([label,v])=>`<div><span>${escapeHTML(label)}</span><i aria-hidden="true">${v==null?'':`<em style="width:${v}%"></em>`}</i><b>${v==null?'—':v.toFixed(1)+'%'}</b></div>`).join('')}</div></section>`).join('');
  return heading('Patient profile')+atlasFigure('patients')+
    `<article class="panel profile-panel"><div class="section-top"><h2>Who makes up this population?</h2>${controls(scope,'patientScope')}</div>
    <p class="population-summary"><b>${(p.weightedAdults/1e6).toFixed(1)} million</b> U.S. adults reported ${conditionLabel(scope)} in 2025. Percentages show the makeup of this group.</p>
    <div class="profile-grid">${d}</div></article>`+
    lineChart(populationHistory(nhis,scope,view.profileMetric,true))+
    `<nav class="reading-links" aria-label="Related patient research"><a href="#patients/segments">Compare coverage segments →</a><a href="#patients/treatment">Compare treatment and technology use →</a></nav>`+
    sourcesFooter([...surveySources,['NIDDK · Tests and diagnosis','https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis']],[
      'NHIS surveys U.S. civilian, noninstitutionalized adults 18+. Counts use annual Sample Adult weights. Respondents reporting prediabetes only reported a professional diagnosis of prediabetes and no diagnosis of diabetes. They are a subset of all adults with laboratory-defined prediabetes. All diagnosed includes other and unknown types.',
      'Percentages use valid responses within each characteristic and may differ slightly from 100% after rounding. Categories with fewer than ten respondents are suppressed. Family income is relative to the federal poverty threshold and uses the adult file’s first imputed value. Functional disability is the Washington Group indicator of serious difficulty in at least one of six domains. Work refers to the prior week.',
      'Each year is a new national sample. Changes describe populations and do not track individual transitions. Interview procedures changed in 2020. The 2025 annual file excludes the December sample.'
    ]);
}
export function treatmentPage(nhis,scope){
  const p=nhis.profiles[scope];
  const therapyColors=[null,'#495db1','#8d55a0','#b36a31'];
  const primary=matrix('Who uses each treatment?',`% of U.S. adults in each row · ${conditionLabel(scope)} · NHIS 2025`,Object.entries(p.groups).filter(([key])=>!['Work in the past week','Functional disability','Self-rated health'].includes(key)),['Patient share','Insulin','Oral medication','Other injections¹'],therapyColors,controls(scope,'treatmentScope'));
  const provider=pair(card('First CGM prescriptions by insurance',`<p class="axis-unit">Insulin-treated type 2 adults · first primary-care prescription · Bronx, 2020–23</p>${barList([['Commercial',21.5],['Medicare',16.0],['Medicaid',15.4],['Medicare and Medicaid',15.9]],{max:25,color:'#5165a8'})}`),
    card('First CGM prescriptions by race and ethnicity',`<p class="axis-unit">% within each group in the same Bronx health system</p>${barList([['Non-Hispanic Black',18.6],['Hispanic',16.3],['Non-Hispanic White',15.4],['Asian or Pacific Islander',13.8],['Other',15.4]],{max:25,color:'#8c527a'})}`));
  return heading('Treatment and technology')+primary+provider+monitor()+
    sourcesFooter([...surveySources,...cgmSources,['Medicare Advantage · CGM use among adults with type 2 diabetes on insulin',cgmMedicare.source],['Montefiore · First CGM prescription, Table 1','https://doi.org/10.1007/s11606-025-09923-7']],[
      '¹The survey asks about an injection other than insulin to lower blood sugar or lose weight. It does not identify the brand or purpose of an individual prescription. Oral medication and insulin responses are also self-reported. Modalities may overlap. Patient shares use the full selected cohort with valid demographic data. Each therapy percentage uses valid treatment responses in the corresponding row; cells with fewer than 30 valid responses or fewer than ten positive or negative observations are suppressed.',
      'The Montefiore study covered 11,037 insured adults with type 2 diabetes taking insulin and no prior CGM prescription. Rates divide first primary-care prescriptions by each group’s eligible patients. A prescription does not establish whether someone acquired or used the sensor. Race and payer estimates are separate cross-tabulations from one health system.',
      'The industry estimate covers type 1 and type 2 in 2024. Historical BRFSS demographics are the study’s survey-weighted composition of 231 CGM users. They cannot be applied to the 2024 estimated national user count. The annual survey-count series reports users per 10,000 surveyed respondents with diabetes. Public payer shares count claims, not patients.',
      'The period table uses an independent survey-weighted reconstruction with annual weights adjusted for each year’s share of eligible respondents. Its results can differ from the published pooled Table 1. The separate Medicare Advantage series is specific to insulin-treated members with type 2 diabetes.'
    ]);
}
const displaySegment={medicare:'Medicare without Medicaid',medicaid:'Medicaid without Medicare',dual:'Medicare and Medicaid',private:'Private, no public plan',other:'Other or mixed coverage',uninsured:'Uninsured',otherUninsured:'Other coverage or uninsured'};
const segmentColors={medicare:'#5147b5',private:'#556d9c',dual:'#9e5f8b',medicaid:'#3b8393',uninsured:'#aa6c38',other:'#7c8393',otherUninsured:'#7c8393'};
export function segmentHistory(data,scope){
  const s=data.scopes[scope];
  return {title:'Coverage mix over time',unit:`% of U.S. adults with ${conditionLabel(scope)} · mutually exclusive groups`,format:'percent',labels:data.years,series:s.order.map((k,i)=>[displaySegment[k],s.trend.map(r=>r[i])]),source:links.nhis};
}
export function patientSegments(data,scope){
  const s=data.scopes[scope],rows=s.order.map(key=>[key,s.segments[key]]).sort((a,b)=>b[1].share-a[1].share);
  const text=v=>v==null?'—':v.toFixed(1)+'%';
  const composition=`<article class="panel"><div class="section-top"><h2>Patients by insurance coverage</h2>${controls(scope,'segmentScope')}</div><p class="population-summary"><b>${(s.weightedAdults/1e6).toFixed(1)} million</b> U.S. adults with ${conditionLabel(scope)} and classifiable coverage · 2025</p><div class="segment-strip" aria-hidden="true">${rows.map(([k,r])=>`<i style="width:${r.share}%;background:${segmentColors[k]}"></i>`).join('')}</div>
    ${dataTable(['Coverage segment','Share of patients','95% interval','Survey respondents'],rows.map(([k,r])=>[displaySegment[k],text(r.share),r.ci?r.ci.map(v=>v.toFixed(1)+'%').join(' to '):'—',r.n.toLocaleString('en-US')]))}</article>`;
  const characteristics=rows.map(([k,r])=>[displaySegment[k],...['age65','women','belowPoverty','college','white'].map(i=>text(r.traits[i]))]);
  const access=rows.map(([k,r])=>[displaySegment[k],...['insulin','oral','injectables','usualPlace','unfilledRx'].map(i=>text(r.traits[i]))]);
  return heading('Patient segments')+composition+
    card('Who is in each segment?',`<p class="axis-unit">% within each coverage group · 2025</p>${dataTable(['Segment','Age 65+','Women','Below poverty threshold','Bachelor’s degree or higher','Non-Hispanic White'],characteristics)}`)+
    card('Where treatment and access differ',`<p class="axis-unit">% within each coverage group · 2025</p>${dataTable(['Segment','Uses insulin','Takes glucose-lowering pills','Other injections¹','Usual place for care','Went without a prescription due to cost'],access)}`)+
    lineChart(segmentHistory(data,scope))+sourcesFooter(data.sources,[...data.notes,'¹Other injections include medicines for lowering blood sugar or losing weight.']);
}
