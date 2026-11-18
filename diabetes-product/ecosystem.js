import {escapeHTML,sourcesFooter} from './charts.js';
import {heading} from './epidemiology.js';
import {links} from './evidence.js';

const references={
  patients:['CDC · People living with diabetes, 2023','https://www.cdc.gov/diabetes/communication-resources/diabetes-statistics.html'],
  caregivers:['AARP and National Alliance for Caregiving · Caregiving in the US 2025, figures 1 and 6','https://www.caregivingintheus.org/wp-content/uploads/2026/03/caregiving-in-us-2025.doi_.10.26419-2fppi.00373.001.pdf'],
  clinicians:['ABMS · 2025–2026 Board Certification Report, table 2C, U.S. total','https://www.abms.org/wp-content/uploads/2026/09/2025_26_ABMSCertReport_FNL_20260908.pdf#page=41'],
  organizations:['ADA · 2025 annual report, Education Recognition Program','https://diabetes.org/sites/default/files/2026-07/ADA_2025_AnnualReport_Final_Digital.pdf'],
  media:['CDC · Do I Have Prediabetes? Ten-year campaign report',links.campaign],
  payers:['AHRQ · Diabetes treatment payments and service use in 2021–22','https://meps.ahrq.gov/data_files/publications/st568/stat568.shtml'],
  fda:['FDA · Device clearance records','https://www.fda.gov/medical-devices/510k-clearances/downloadable-510k-files'],
  industry:['Dexcom · U.S. company revenue, 2024 Form 10-K','https://www.sec.gov/Archives/edgar/data/1093557/000109355725000036/dxcm-20241231.htm'],
  retail:['Medicare · Continuous glucose monitors','https://www.medicare.gov/coverage/therapeutic-continuous-glucose-monitors']
};
// Every position is expressed in the units of its own drawing. The same bounds
// align the accessible page links with the people and organizations in the drawing.
export const mapSizes={wide:[1200,680],mobile:[390,713]};
export const stakeholders=[
  {id:'patients',name:'People living with diabetes',path:'patients/profile',color:'patient',wide:[493,221,214,214],mobile:[17,12,356,99],
    stat:'40.1M',unit:'U.S. people of all ages · 2023',alt:'40.1 million U.S. people living with diagnosed or undiagnosed diabetes in 2023.'},
  {id:'caregivers',name:'Family caregivers',path:'caregivers/profile',color:'community',wide:[15,246,292,172],mobile:[19,161,163,125],
    stat:'≈2.4M',unit:'Diabetes was the main reason for adult care',alt:'About 2.4 million U.S. family caregivers of adults named diabetes as the main reason for care in the 2025 report.'},
  {id:'clinicians',name:'Clinicians & educators',path:'hcp/profile',color:'care',wide:[886,6,298,178],mobile:[206,161,166,125],
    stat:'8,706',unit:'U.S. endocrine subspecialists · 2026',alt:'8,706 U.S. physicians held active board certification in endocrinology, diabetes and metabolism in June 2026.'},
  {id:'organizations',name:'Patient organizations',path:'organizations',color:'community',wide:[449,6,302,178],mobile:[19,296,163,125],
    stat:'3,700+',unit:'ADA-recognized education sites · 2025',alt:'The American Diabetes Association reported more than 3,700 recognized diabetes education sites nationwide in 2025.'},
  {id:'media',name:'Media & peer voices',path:'discussion/voices',color:'community',wide:[15,6,292,178],mobile:[19,433,163,125],
    stat:'33.7M+',unit:'Campaign risk tests completed by Mar 2026',alt:'Public messages and peer accounts reach households. By March 2026, one national prediabetes campaign had recorded over 33.7 million risk-test completions.'},
  {id:'payers',name:'Public & private payers',path:'healthcare',color:'care',wide:[888,246,296,172],mobile:[206,296,166,125],
    stat:'41% / 32%',unit:'Medicare / private share of treatment dollars',alt:'Medicare paid 41% and private insurers 32% of annual diabetes treatment spending in the 2021–22 MEPS survey.'},
  {id:'fda',name:'FDA',path:'healthcare/policy',color:'supply',wide:[15,479,292,184],mobile:[19,574,163,127],
    stat:'96 decisions',unit:'Selected connected devices · 2018–Oct 2026',alt:'The FDA issued 96 marketing authorizations in the selected connected glucose-monitoring, pump and dosing-controller families from January 2018 through October 2026.'},
  {id:'industry',name:'Drug & device makers',path:'industry/market',color:'supply',wide:[447,479,306,184],mobile:[206,574,166,127],
    stat:'$2.89B',unit:'Dexcom U.S. revenue · 2024',alt:'Drug and device makers supply medicines, insulin delivery systems and glucose monitors. Dexcom alone reported $2.89 billion in U.S. revenue in 2024.'},
  {id:'retail',name:'Pharmacies & suppliers',path:'industry/products',color:'supply',wide:[886,479,299,184],mobile:[206,433,166,125],
    stat:'95.9%',unit:'Treated adults used prescription drugs',alt:'Pharmacies dispense prescriptions and suppliers provide equipment. In 2021–22, 95.9% of U.S. community-dwelling adults treated for diabetes used outpatient prescribed medicines for diabetes.'}
];
function percentBounds(bounds,size,prefix){
  return bounds.map((v,i)=>'--'+prefix+['x','y','w','h'][i]+':'+(100*v/size[i%2]).toFixed(4)+'%').join(';');
}
export function ecosystemPage(){
  const areas=stakeholders.map(node=>{
    const position=percentBounds(node.wide,mapSizes.wide,'d')+';'+percentBounds(node.mobile,mapSizes.mobile,'m');
    return `<a class="eco-area" href="#${node.path}" style="${position}" aria-label="${escapeHTML(node.name+'. '+node.alt+' Open chapter.')}"><span class="sr-text">${escapeHTML(node.name)}</span></a>`;
  }).join('');
  return heading('Diabetes care ecosystem')+
    `<figure class="atlas-figure ecosystem"><div class="ecosystem-canvas"><picture><source media="(max-width: 900px)" srcset="media/atlas/ecosystem-mobile.svg" width="390" height="713"><img src="media/atlas/ecosystem-wide.svg" width="1200" height="680" alt="People with diabetes are at the center. Families help at home, clinicians diagnose and treat, and patient organizations connect both to education. Media carry public and peer messages. FDA decisions, manufacturers, payers and suppliers shape access to treatment."></picture>${areas}</div></figure>`+
    `<div class="eco-stories"><section><h2>From a diagnosis to support</h2><p>A clinician can refer someone to a diabetes education program. Families can join the learning and help with meals, medicines or glucose checks at home.</p><a href="#hcp/relationship">Patient and clinician relationship →</a></section><section><h2>From a prescription to a sensor</h2><p>The FDA defines the device’s authorized use. A health plan sets coverage terms. A pharmacy or equipment supplier fills the order, and the person starts using it at home.</p><a href="#healthcare/private">Private coverage and approvals →</a></section></div>`+
    sourcesFooter(Object.values(references),[
      'Each figure measures a different part of the ecosystem. People, professional credentials, education sites, completed risk tests and regulatory decisions use different populations or units. A person may have more than one role.',
      'The caregiver estimate multiplies 59.0 million caregivers of adults by the 4% who named diabetes as the primary reason for care in the national 2025 report. ABMS counts U.S. diplomates in Endocrinology, Diabetes and Metabolism as of June 30, 2026. Primary care physicians, pediatric endocrinologists, nurses and educators also provide diabetes care.',
      'The ADA count is education sites within one national recognition program. The CDC campaign counts completed online and video risk tests, including possible repeats. MEPS reports payment shares and prescription use among people treated for diabetes in 2021–22. Dexcom revenue illustrates one company’s U.S. sales. The FDA figure counts individual decisions in the ten product codes documented in Public policy.'
    ]);
}
