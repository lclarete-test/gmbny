import {barList,lineChart,matrix,dataTable,sourcesFooter} from './charts.js';
import {histories,links,complications} from './evidence.js';
import {heading,card,pair} from './epidemiology.js';
import {spendingMap} from './geography.js';

const billions=v=>'$'+v.toFixed(1)+'B';
function costAccounts(){
  const direct=[['Outpatient medicines and supplies',137.0],['Institutional care',105.8],['Outpatient care',63.7]];
  const lost=[['Reduced performance at work',35.8],['Premature mortality',32.4],['Disability-related loss of employment',28.3],['Work absences',5.4],['Productivity lost outside paid work',4.4]];
  return `<article class="panel cost-accounts"><div class="section-top"><h2>The economic cost of diagnosed diabetes</h2><span class="axis-unit">United States · 2022</span></div><div class="cost-total"><strong>$412.9B</strong><span>medical costs and lost productivity</span></div>
    <div class="cost-split" aria-hidden="true"><i></i><i></i></div>
    <div class="account-grid"><section><h3><b>$306.6B</b> Direct medical costs</h3>${barList(direct,{max:140,format:billions})}</section>
    <section><h3><b>$106.3B</b> Lost productivity</h3>${barList(lost,{max:140,format:billions,color:'#13796f'})}</section></div>
    <p class="reading">Hospital stays and treatment for complications count toward medical costs. Disability, time away from work and early deaths account for the productivity loss.</p></article>`;
}
function treatmentSpending(){
  return card('Who paid for diabetes treatment?',`<div class="measure-call"><b>$153.2B</b><p>in average annual payments for diabetes-linked care and prescriptions in 2021–22. AHRQ surveyed community-dwelling adults. This separate estimate cannot be subtracted from the ADA economic total.</p></div>
    ${barList([['Medicare',41],['Private insurance',32],['Medicaid',17.2],['Out of pocket',6.2],['Other payers',3.5]],{max:50})}`);
}
export function healthcare(resources,view){
  const services=card('Where adults used care',`<p class="axis-unit">Adults with diagnosed diabetes · past 12 months · 2023</p>${barList([['Saw a doctor',97.2],['Emergency department',31.4],['Urgent care',30.1],['Overnight hospital stay',18.3]])}`);
  const barriers=card('Barriers to care',`<p class="axis-unit">Adults with diagnosed diabetes · 2023</p>${barList([['Could not afford a needed prescription',11.4],['Delayed care due to cost',7.6],['No usual place for care',2.8]])}`);
  const hospitals=card('Hospital care by complication',`<p class="reading">In 2021, diabetes appeared on 8.1 million adult hospital discharges and 16.5 million emergency visits. Cardiovascular disease accounted for 1.78 million hospitalizations among adults with diabetes.</p>${dataTable(['Condition or procedure','2020 stays','2021 stays','Change'],complications.map(([l,a,b])=>[l,(a*1000).toLocaleString('en-US'),(b*1000).toLocaleString('en-US'),(b>a?'+':'')+((b/a-1)*100).toFixed(1)+'%']))}
    <p class="reading">Among emergency visits in 2021, 253,000 involved a hyperglycemic crisis and 192,000 involved hypoglycemia.</p>`);
  const exams=matrix('Preventive care by insurance status','Adults 20+ with diagnosed type 2 diabetes · care in the prior year · 2015–March 2020',
    [['Service',[['A1C checked',90.1,60.2],['Professional foot exam',75.1,47.4],['Dilated eye exam',67.7,37.2],['Saw a health professional for diabetes',78.4,46.7]]]],['Insured','Uninsured'],['#5147b5','#13796f']);
  const physicians=card('Physicians seen by Medicare patients',`<p class="axis-unit">Beneficiaries with at least one visit · 2018–21</p>${dataTable(['Specialty','Type 1','Type 2'],[['Primary care','79.6%','77.3%'],['Endocrinology','71.3%','16.7%']])}`);
  const unitCost=card('Attributable medical cost per person',`<p class="axis-unit">Selected services · annual dollars · 2022</p>${barList([['Hospital inpatient care',3772],['Office visits',1319],['Hospital outpatient visits',475],['Emergency visits',464],['Home health',219]],{max:4000,format:v=>'$'+v.toLocaleString('en-US')})}`);
  return heading('Healthcare system')+pair(services,barriers)+lineChart(histories.emergency)+hospitals+
    pair(exams,physicians)+lineChart(histories.control)+costAccounts()+pair(lineChart(histories.cost),unitCost)+
    treatmentSpending()+spendingMap(resources.svg,view.costState,view.costMode)+
    matrix('Health coverage among adults with diabetes','% of diagnosed adults in each group with each coverage type · NHIS 2023',Object.entries(resources.coverage),['Medicaid','Medicare','Private','Uninsured'],['#5147b5','#13796f','#985524','#475a78'])+
    sourcesFooter([['CDC · Hospital discharges and emergency visits',links.cdc],['NCHS · Emergency department visit rates by age',links.ed],['NIDDK · Preventive care in type 2 diabetes, Table 10',links.preventive],['Fang et al. · Trends in diabetes treatment and control',links.control],['Medicare physician encounters · conference abstract','https://diabetesjournals.org/diabetes/article/75/Supplement_1/1984-P/168307/'],['ADA · 2022 economic costs, Tables 3 and 7 and Figure 2',links.costs],['AHRQ MEPS · Treatment payments',links.meps],['CDC · State Burden Toolkit','https://www.cdc.gov/diabetes/burden-toolkit/state-burden-toolkit-economic-burden.html'],['NHIS 2023 · Sample Adult public-use file',links.adult23]],[
      'ED trends divide visits by the resident population within each age band, including people without diabetes. Counts in the hospitalization table are discharges, and some categories overlap. NCHS and hospital discharge systems use different collection methods.',
      'Preventive care is self-reported. The control study uses national NHANES data for nonpregnant adults 20+ with diagnosed diabetes. Its thresholds are study outcomes. Physician-visit estimates come from a Medicare study and describe beneficiaries in its cohort.',
      'The ADA attributes excess medical costs to diabetes and estimates lost productivity. Cost history is in constant 2022 dollars. Breakdown totals can differ slightly because of rounding. AHRQ MEPS separately measures condition-linked treatment payments and excludes downstream complications and lost productivity.',
      'State spending is for 2021 across all payers. Survey coverage and service use are weighted 2023 NHIS estimates among diagnosed adults with valid answers for each item. Multiple plans may cover one person. Out-of-pocket payments occur with or without a plan and appear in the spending breakdown.'
    ]);
}
