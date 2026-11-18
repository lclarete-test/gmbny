import {barList,lineChart,matrix,dataTable,sourcesFooter} from './charts.js';
import {histories,links,complications} from './evidence.js';
import {heading,card,pair} from './epidemiology.js';
import {spendingMap} from './geography.js';

const cmsMedicare='https://www.cms.gov/about-cms/agency-information/omh/downloads/data-snapshots-diabetes.pdf';
const cmsMedicaid='https://www.medicaid.gov/medicaid/quality-of-care/downloads/2023-child-and-adult-core-sets-trending-summary-chart-pack.pdf';
const physicianSource='https://doi.org/10.2337/dc26-2070';
export const medicaidTrend={title:'A1C outcomes in Medicaid',unit:'Median state percentage flagged for poor A1C control · Medicaid adults ages 18–64 with diabetes',format:'percent',labels:[2020,2021,2022],series:[['Poor control or missing result',[43.4,39.1,37.2]]],source:cmsMedicaid,note:'CMS followed the same 27 reporting states across three care years. The measure includes A1C above 9%, a missing result or no recorded test.'};
const billions=v=>'$'+v.toFixed(1)+'B';
function costAccounts(){
  const direct=[['Outpatient medicines and supplies',137.0],['Institutional care',105.8],['Outpatient care',63.7]];
  const lost=[['Reduced performance at work',35.8],['Premature mortality',32.4],['Disability-related loss of employment',28.3],['Work absences',5.4],['Productivity lost outside paid work',4.4]];
  return `<article class="panel cost-accounts"><div class="section-top"><h2>The economic cost of living with diagnosed diabetes</h2><span class="axis-unit">United States · 2022</span></div><div class="cost-total"><strong>$412.9B</strong><span>medical costs and lost productivity</span></div>
    <div class="cost-split" aria-hidden="true"><i></i><i></i></div>
    <div class="account-grid"><section><h3><b>$306.6B</b> Direct medical costs</h3>${barList(direct,{max:140,format:billions})}</section>
    <section><h3><b>$106.3B</b> Lost productivity</h3>${barList(lost,{max:140,format:billions,color:'#13796f'})}</section></div>
    <p class="reading">Hospital stays and treatment for complications count toward medical costs. Disability, time away from work and early deaths account for the productivity loss.</p></article>`;
}
const servicesPaid=[
  ['Prescribed medicines',95.9,4870],['Office-based visits',59.5,1010],['Hospital outpatient visits',10.8,890],['Home health',3.1,9500],['Emergency visits',1.9,970],['Inpatient stays',0.9,15380]
];
function treatmentSpending(){
  const payers=[['Medicare',41],['Private insurance',32],['Medicaid',17.2],['Out of pocket',6.2],['Other payers',3.5]];
  return card('Who paid for diabetes treatment?',`<div class="measure-call"><b>$153.2B</b><p>in average annual U.S. payments for care and prescriptions tied to treating diabetes in 2021–22. AHRQ followed 26.3 million community-dwelling adults treated per year. Pharmacy payments include some diabetes supplies. Spending on complications and purchases recorded solely as medical equipment fall outside this estimate.</p></div>
    ${dataTable(['Source of payment','Share of treatment payments','Approx. paid per year'],payers.map(([k,v])=>[k,v.toFixed(1)+'%',billions(153.2*v/100)]))}<a class="chapter-next" href="#industry/market/treatment">Explore the six treatment services and their costs →</a>`);
}
function servicePayments(){
  return card('What people used specifically to treat diabetes',`<p class="axis-unit">U.S. adults treated for diabetes, all types · average year, 2021–22</p>${dataTable(['Service','Share of treated adults using it','Mean paid per service user in a year'],servicesPaid.map(([k,v,c])=>[k,v.toFixed(1)+'%','$'+c.toLocaleString('en-US')]))}<p class="reading">Across all treated adults, annual payments averaged $5,810. The median was $1,770.</p>`);
}
export function healthcare(resources,view){
  const services=card('Healthcare use for any reason by diagnosis',`<p class="axis-unit">U.S. adults reporting each diagnosis · at least once in the prior 12 months · NHIS 2023</p>
    ${dataTable(['Service','All diagnosed diabetes','Type 1','Type 2','Prediabetes only'],[['In-person visit with a doctor or other health professional','97.2%','95.6%','97.6%','93.0%'],['Emergency department','31.4%','31.4%','31.1%','24.7%'],['Urgent care','30.1%','33.0%','29.5%','32.6%'],['Overnight hospital stay','18.3%','18.9%','18.1%','11.6%']])}
    <p class="reading">The interview records whether a person saw a health professional. Visit reasons and the professional’s specialty were not collected in this question.</p>`);
  const barriers=card('Barriers to care',`<p class="axis-unit">Adults with diagnosed diabetes · 2023</p>${barList([['Could not afford a needed prescription',11.4],['Delayed care due to cost',7.6],['No usual place for care',2.8]])}`);
  const hospitals=card('Hospital care by complication',`<p class="reading">In 2021, diabetes appeared on 8.1 million adult hospital discharges and 16.5 million emergency visits. Cardiovascular disease accounted for 1.78 million hospitalizations among adults with diabetes.</p>${dataTable(['Condition or procedure','2020 stays','2021 stays','Change'],complications.map(([l,a,b])=>[l,(a*1000).toLocaleString('en-US'),(b*1000).toLocaleString('en-US'),(b>a?'+':'')+((b/a-1)*100).toFixed(1)+'%']))}
    <p class="reading">Among emergency visits in 2021, 253,000 involved a hyperglycemic crisis and 192,000 involved hypoglycemia.</p>`);
  const exams=matrix('Preventive care by insurance status','Adults 20+ with diagnosed type 2 diabetes · care in the prior year · 2015–March 2020',
    [['Service',[['A1C checked',90.1,60.2],['Professional foot exam',75.1,47.4],['Dilated eye exam',67.7,37.2],['Saw a health professional for diabetes',78.4,46.7]]]],['Insured','Uninsured'],['#5147b5','#13796f']);
  const physicians=card('Who provided care in traditional Medicare?',`<p class="axis-unit">Annual share with an encounter · beneficiaries 65+ with diagnosed diabetes · 2018–21</p>${dataTable(['Specialty','Type 1','Type 2'],[['Primary care','75.2%','73.7%'],['Endocrinology','60.3%','9.5%'],['Both specialties','46.3%','7.7%'],['At least one of the two','89.2%','75.5%']])}`);
  const medicare=card('Diabetes in traditional Medicare',`<p class="axis-unit">Prevalence within each Medicare fee-for-service group · 2022</p>${barList([['All enrollees',26],['Medicare only',24],['Medicare and Medicaid',37]],{max:45,color:'#66529e'})}<p class="reading">Dual enrollees qualified for both programs. Their age-standardized prevalence was 13 percentage points higher than among Medicare-only enrollees.</p>`);
  const unitCost=card('Attributable medical cost per person',`<p class="axis-unit">Selected services · annual dollars · 2022</p>${barList([['Hospital inpatient care',3772],['Office visits',1319],['Hospital outpatient visits',475],['Emergency visits',464],['Home health',219]],{max:4000,format:v=>'$'+v.toLocaleString('en-US')})}`);
  return heading('Healthcare system')+costAccounts()+
    '<nav class="coverage-paths" aria-label="Coverage and regulation"><a href="#healthcare/public">Medicare and Medicaid →</a><a href="#healthcare/private">Private insurance and approvals →</a><a href="#healthcare/policy">FDA decisions and public policy →</a></nav>'+lineChart(histories.cost)+spendingMap(resources.svg,view.costState,view.costMode)+
    pair(unitCost,card('Attributable medical costs by age',`<p class="axis-unit">ADA economic model · 2022</p>${dataTable(['Age','Annual direct medical cost','Per person with diabetes'],[['Under 65','$101.5B','$7,482'],['65 and older','$205.1B','$17,180'],['All ages','$306.6B','$12,022']])}<p class="reading">People 65 and older accounted for about two-thirds of attributable medical costs, across all payers.</p>`))+
    treatmentSpending()+servicePayments()+pair(medicare,physicians)+lineChart(medicaidTrend)+
    matrix('Health coverage among adults with diagnosed diabetes','All types · % within each group with each type of coverage · NHIS 2023',Object.entries(resources.coverage),['Medicaid','Medicare','Private','Uninsured'],['#5147b5','#13796f','#985524','#475a78'])+
    services+pair(exams,barriers)+hospitals+lineChart(histories.emergency)+lineChart(histories.control)+
    sourcesFooter([['CDC · Hospital discharges and emergency visits',links.cdc],['NCHS · Emergency department visit rates by age',links.ed],['NIDDK · Preventive care in type 2 diabetes, Table 10',links.preventive],['Fang et al. · Trends in diabetes treatment and control',links.control],['Medicare physician encounters · peer-reviewed claims study',physicianSource],['CMS · Traditional Medicare diabetes prevalence',cmsMedicare],['CMS · Medicaid Adult Core Set, matched-state trends',cmsMedicaid],['CMS · A1C measure technical definition','https://www.medicaid.gov/sites/default/files/2023-06/medicaid-adult-core-set-manual-jun2023.pdf'],['NHIS · 2023 Sample Adult codebook',links.nhisBook],['ADA · 2022 economic costs, Tables 3 and 7 and Figure 2',links.costs],['AHRQ MEPS · Treatment payments',links.meps],['CDC · State Burden Toolkit','https://www.cdc.gov/diabetes/burden-toolkit/state-burden-toolkit-economic-burden.html'],['NHIS 2023 · Sample Adult public-use file',links.adult23]],[
      'ED trends divide visits by the resident population within each age band, including people without diabetes. Counts in the hospitalization table are discharges, and some categories overlap. NCHS and hospital discharge systems use different collection methods.',
      'Preventive care is self-reported. The control study uses national NHANES data for nonpregnant adults 20+ with diagnosed diabetes. Its thresholds are study outcomes. Physician-visit estimates come from a Medicare study and describe beneficiaries in its cohort.',
      'The ADA attributes excess medical costs to diabetes and estimates lost productivity. Cost history is in constant 2022 dollars. Breakdown totals can differ slightly because of rounding. AHRQ MEPS measures payments for treatment of diabetes in community-dwelling adults. AHRQ excludes care for complications, institutionalized populations, separate equipment purchases and productivity loss. Subtracting $153.2B from $412.9B would mix two different studies. Payer amounts multiply published shares by $153.2B and are approximate.',
      'State spending is for 2021 across all payers. Survey coverage and service use are weighted 2023 NHIS estimates among diagnosed adults with valid answers for each item. LASTDR_A asks about an in-person visit with a doctor or other health professional about any health concern and excludes dental care. Specialty and the reason for the visit cannot be inferred. Coverage groups can overlap. The Medicare claims analysis includes 1,840,259 distinct fee-for-service beneficiaries aged 65+ continuously enrolled in Parts A and B. CMS Medicaid state medians use Core Set reporting cycles 2021–23 for care years 2020–22. Multiple plans may cover one person. Out-of-pocket payments occur with or without a plan and appear in the spending breakdown.'
    ]);
}
