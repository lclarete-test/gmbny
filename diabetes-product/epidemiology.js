import {barList,dataTable,lineChart,matrix,measures,sourcesFooter} from './charts.js';
import {histories,links,preProfile} from './evidence.js';
import {prevalenceMap,stateBreakdown,stateTrend} from './geography.js';

export const heading=title=>`<div class="pagehead"><h1>${title}</h1></div>`;
export const card=(title,body)=>`<article class="panel"><h2>${title}</h2>${body}</article>`;
export const pair=(a,b)=>`<div class="chapter-pair">${a}${b}</div>`;
export function introduction(){
  const organs=[
    ['Eyes','Damage to small vessels in the retina can affect vision.'],
    ['Heart and brain','Blood vessel damage increases the risk of heart attack and stroke.'],
    ['Kidneys','Damage to the kidneys’ filters can reduce their ability to remove waste from the blood.'],
    ['Nerves and feet','Loss of sensation can hide an injury. Poor circulation can slow the healing of a foot wound.']
  ];
  return heading('Understanding diabetes')+`<article class="panel intro-lead"><h2>What happens to blood glucose?</h2><p>Glucose travels in the blood after a meal. Insulin, made by the pancreas, helps it enter cells for energy. When the body makes too little insulin or cells respond poorly to it, more glucose stays in the blood.</p>
    <div class="glucose-flow"><span>Food releases glucose</span><i>→</i><span>The pancreas releases insulin</span><i>→</i><span>Cells take up glucose</span></div></article>`+
    card('Conditions compared in this dashboard',dataTable(['Condition','What changes'],[
      ['Type 1 diabetes','The immune system destroys cells that make insulin. The body produces little or no insulin.'],
      ['Type 2 diabetes','Cells respond less effectively to insulin. Over time, the pancreas may struggle to keep up. Type 2 accounts for about 90–95% of people with diabetes.'],
      ['Prediabetes','Blood glucose is above the normal range and below the diabetes threshold. It raises the chance of developing type 2 diabetes.'],
      ['Gestational diabetes','Diabetes that develops during pregnancy. It can affect the pregnancy and increases future type 2 risk.']
    ]))+
    card('How diabetes affects the body',`<div class="organ-list">${organs.map(([o,what])=>`<section><h3>${o}</h3><p>${what}</p></section>`).join('')}</div>`)+
    card('How people notice it',`<p>Thirst, frequent urination, fatigue or blurred vision can bring someone to care. Type 2 diabetes can also develop for years with few noticeable symptoms. In those cases, screening may be the first time someone learns their blood glucose is high.</p>`)+
    `<a class="chapter-next" href="#epidemiology">See who has diabetes in the United States <span>→</span></a>`+
    sourcesFooter([['CDC · Diabetes basics','https://www.cdc.gov/diabetes/about/'],['CDC · Type 2 diabetes','https://www.cdc.gov/diabetes/about/about-type-2-diabetes.html'],['CDC · Symptoms','https://www.cdc.gov/diabetes/signs-symptoms/'],['CDC · Effects on the body','https://www.cdc.gov/diabetes/communication-resources/how-diabetes-can-affect-your-body.html'],['CDC · Gestational diabetes','https://www.cdc.gov/diabetes/about/gestational-diabetes.html']]);
}
function spectrum(){
  const rows=[['Diagnosed diabetes',10.9,'28.8M','#5147b5'],['Undiagnosed diabetes',4,'11.0M','#928cd0'],['Prediabetes',43.5,'115.2M','#198274'],['Below both thresholds',41.6,'','#dae0e4']];
  return `<article class="panel spectrum"><div class="section-top"><h2>Blood glucose status among U.S. adults</h2><span class="axis-unit">2021–23 · ages 18+</span></div>
   <div class="spectrum-lead"><strong>58.4%</strong><p>had diabetes or prediabetes. About 4 in every 100 adults had diabetes without a diagnosis.</p></div>
   <div class="spectrum-bar" aria-hidden="true">${rows.map(([,v,,c])=>`<i style="width:${v}%;background:${c}"></i>`).join('')}</div><div class="spectrum-list">${rows.map(([label,v,count,c])=>`<div><i style="background:${c}"></i><b>${v.toFixed(1)}%</b><span>${label}</span>${count?`<small>${count} adults</small>`:''}</div>`).join('')}</div></article>`;
}
function gestational(){
  const groups=[
    ['Maternal age · U.S., 2023',[['Under 20',2.47],['20–24',4.63],['25–29',7.11],['30–34',9.19],['35–39',11.91],['40–54',14.97]]],
    ['Highest state rates · U.S., 2020',[['Alaska',12.6],['Washington',10.9],['Oregon',10.1],['New Jersey',9.6],['Arizona',9.5]]],
    ['Education · Virginia PRAMS',[['Less than high school',7],['High school',18.1],['Beyond high school',9.9]]],
    ['Household income · Virginia PRAMS',[['Under $20,000',12.6],['$20,001–57,000',12.7],['Over $57,000',8.8]]],
    ['Insurance · Virginia PRAMS',[['Medicaid',18.9],['Private',9.4],['Other insurance',14.7],['Uninsured',8.2]]],
    ['Primary payer at delivery · U.S., 2018',[['Medicaid',6.5,41.2],['Private',7.0,52.1],['Self-pay',5.0,3.2],['Other',6.0,3.5]]]
  ];
  return card('Gestational diabetes among live births',`<p class="reading">In 2023, 8.3% of U.S. live births involved gestational diabetes. The rate rose from 2.5% under age 20 to 15.0% at ages 40–54.</p><div class="matrix-grid">${groups.map(([title,rows])=>`<section><h3>${title}</h3>${dataTable(['Group','% with gestational diabetes','% of all cases'],rows.map(([label,v,share])=>[label,v.toFixed(1)+'%',share==null?'—':share.toFixed(1)+'%']),title)}</section>`).join('')}</div>`);
}
export function comparisonHistory(nhis){
  return {title:'Type 1, type 2 and prediabetes, 2019–2025',unit:'% of all U.S. adults aged 18+ · self-reported diagnosis · NHIS',format:'percent',digits:2,
    labels:nhis.trend.map(r=>r[0]),series:nhis.labels.map((name,i)=>[name,nhis.trend.map(r=>r[i+1])]),
    note:'Prediabetes here means someone recalled being told they had it. The laboratory-based population estimate also captures people who were unaware.',source:links.nhis};
}
const geoNotes=[
  ['CDC · U.S. Diabetes Surveillance System, state estimates and subgroups',links.states],['CDC · BRFSS methods','https://www.cdc.gov/brfss/annual_data/annual_data.htm']
];
export function epidemiology(resources,view) {
  const {svg,states,profiles,nhis}=resources;
  const geo=prevalenceMap(svg,profiles,states,view.state)+stateTrend(states,view.state,view.period);
  const geoText='The map ranks available jurisdictions (including D.C.) using the unrounded 2024 age-adjusted rates. The state average gives each of the 49 reporting states equal weight and excludes D.C. CDC publishes the state median separately. Tennessee has no 2024 estimate. The time series uses reported values and breaks at missing years and the 2011 BRFSS redesign.';
  if(view.state) return heading('Epidemiology')+geo+stateBreakdown(view.state,profiles)+sourcesFooter(geoNotes,[geoText,'State subgroup rates use age adjustment except for the individual age bands. Reported diagnosed diabetes includes multiple diabetes types. National comparisons return when United States is selected.']);
  const incidence=card('New adult diagnoses by age',`<p class="axis-unit">2023 · new diagnoses per 1,000 adults at risk</p>${barList([['18–44',3.3],['45–64',10.5],['65+',7.6]],{max:12,format:v=>v.toFixed(1)})}<p class="reading">Of 1.51 million new diagnoses, 721,000 occurred at ages 45–64.</p>`);
  const bmi=card('Diabetes prevalence by BMI',`<p class="axis-unit">2021–23 · adults 20+ · diagnosed and undiagnosed</p>${barList([['BMI below 25',6.8],['25 to below 30',12.3],['30 or above',24.2]],{max:30})}<p class="reading">Among adults with BMI of 30 or above, 7.9% had diabetes that had gone undiagnosed.</p>`);
  const preDetails=card('Who knows they have prediabetes?',`<p class="reading">Among adults with prediabetes, 21.4% knew their status. Adults 65 and older had the highest prevalence, while ages 18–44 accounted for the most people.</p><div class="matrix-grid">${preProfile.map(([g,rows])=>`<section><h3>${g}</h3>${dataTable(['Group','Had prediabetes','Adults, millions','Knew their status¹'],rows.map(([n,p,m,a])=>[n,p.toFixed(1)+'%',m.toFixed(1),a.toFixed(1)+'%']),g)}</section>`).join('')}</div>`);
  return heading('Epidemiology')+spectrum()+lineChart(comparisonHistory(nhis))+geo+
    matrix('Who reports each condition?','NHIS 2025 · % of all adults within each group',Object.entries(nhis.comparison),nhis.labels,['#5147b5','#13796f','#985524'])+
    lineChart(histories.diabetes)+pair(incidence,bmi)+preDetails+lineChart(histories.pre)+gestational()+
    sourcesFooter([...geoNotes,['CDC · National Diabetes Statistics Report',links.cdc],['NCHS · Diabetes by BMI, Table 3',links.bmi],['NHIS · Annual public-use files and questionnaires',links.nhis],['NCHS · U.S. births, 2023','https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-1.pdf'],['NCHS · State gestational diabetes rates (2020)','https://www.cdc.gov/nchs/data/nvsr/nvsr71/nvsr71-03.pdf'],['Virginia · Pregnancy Risk Assessment Monitoring System (PRAMS)','https://www.vdh.virginia.gov/content/uploads/sites/67/2025/01/Gestational-Diabetes-Data.pdf'],['CMS · Primary payer at delivery','https://www.medicaid.gov/medicaid/quality-of-care/downloads/mih-beneficiary-profile.pdf']],[
      'Population estimates use CDC’s published crude percentages from August 2021–August 2023. Counts are separately projected to 2023. The remainder and combined percentage use the rounded published rates.',
      geoText,
      'The three-condition comparison uses annual NHIS Sample Adult weights, WTFA_A. All three percentages share the same denominator of adults with valid diabetes status and, when applicable, a valid prediabetes response. Prediabetes only excludes respondents with diagnosed diabetes. Other and unknown diabetes types stay in the denominator. A dash suppresses subgroup cells with fewer than ten reported cases. Estimates are descriptive.',
      'NHANES estimates use household interviews and lab tests. Historical estimates are age-adjusted, and some survey periods overlap. ¹Awareness uses adults with prediabetes in that group as the denominator.',
      'Virginia PRAMS is a survey of people with recent live births. Gestational rates describe each group independently. Only the 2018 U.S. payer series supports estimated shares of all cases here, calculated from payer-specific rates and birth shares. A dash indicates an unavailable share. The Virginia groups cannot be cross-tabulated from the published rates.'
    ]);
}
