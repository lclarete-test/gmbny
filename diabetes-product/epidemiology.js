import {barList,dataTable,matrix,sourcesFooter} from './charts.js';
import {glucoseColors,glucoseOverview,nationalHistory} from './glucose-overview.js';
import {nationalMethods,nationalSources} from './national-glucose.js';
import {links,preProfile} from './evidence.js';
import {stateGeography} from './geography.js';

export const heading=title=>`<div class="pagehead"><h1>${title}</h1></div>`;
export const card=(title,body)=>`<article class="panel"><h2>${title}</h2>${body}</article>`;
export const pair=(a,b)=>`<div class="chapter-pair">${a}${b}</div>`;
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
export function epidemiology(resources,view) {
  const {nhis,conditions,type1Counts}=resources;
  const geoSources=[['CDC · State estimates and subgroup data',links.states],['CDC · BRFSS survey methodology','https://www.cdc.gov/brfss/annual_data/annual_data.htm'],...Object.values(conditions).flatMap(layer=>layer.sources),...type1Counts.sources];
  const geoNotes=[...new Set(Object.values(conditions).flatMap(layer=>layer.notes))];
  const geoText='All diagnosed diabetes uses CDC adult age-adjusted state rates. Rankings include reporting states and Washington, D.C. Ties share a rank. The state average weights reporting states equally and excludes D.C. A CDC state median is shown when the agency publishes one. All-type trends break at the 2011 BRFSS redesign. Demographic breakdowns refer to 2024; age-specific groups use crude rates.';
  const incidence=card('New diabetes diagnoses by age, all types',`<p class="axis-unit">2023 · new diagnoses per 1,000 U.S. adults at risk in each age group</p>${barList([['18–44',3.3],['45–64',10.5],['65+',7.6]],{max:12,format:v=>v.toFixed(1),context:'New diagnoses per 1,000 U.S. adults at risk, 2023'})}<p class="reading">Adults aged 45–64 had the highest rate. The CDC estimated 1.51 million new adult diagnoses across all types in 2023.</p>`);
  const bmi=card('Diabetes prevalence by BMI, all types',`<p class="axis-unit">2021–23 · adults 20+ · diagnosed and undiagnosed</p>${barList([['BMI below 25',6.8],['25 to below 30',12.3],['30 or above',24.2]],{max:30,context:'Diabetes prevalence within this BMI group, U.S. adults 20 and older'})}<p class="reading">Among adults with BMI of 30 or above, 7.9% had diabetes that had gone undiagnosed.</p>`);
  const preDetails=card('Who knows they have prediabetes?',`<p class="reading">Among adults with prediabetes, 21.4% knew their status. Adults 65 and older had the highest prevalence, while ages 18–44 accounted for the most people.</p><div class="matrix-grid">${preProfile.map(([g,rows])=>`<section><h3>${g}</h3>${dataTable(['Group','Had prediabetes','Adults, millions','Knew their status¹'],rows.map(([n,p,m,a])=>[n,p.toFixed(1)+'%',m.toFixed(1),a.toFixed(1)+'%']),g)}</section>`).join('')}</div>`);
  return heading('Epidemiology')+glucoseOverview(view.glucoseStatus)+
    `<div id="epi-history">${nationalHistory(nhis,view.nationalSeries)}</div>`+
    `<section id="epi-geography" aria-label="State prevalence explorer">${stateGeography(resources,view)}</section><div class="sr-text" id="geo-announcement" aria-live="polite"></div>`+
    matrix('Who reports each condition?','United States · NHIS 2025 · % of adults within each group',Object.entries(nhis.comparison),['Type 1 diabetes','Type 2 diabetes','Reported prediabetes'],[glucoseColors.type1,glucoseColors.type2,glucoseColors.prediabetes])+
    pair(incidence,bmi)+preDetails+gestational()+
    sourcesFooter([...nationalSources,...geoSources,['NCHS · Diabetes by BMI, Table 3',links.bmi],['NCHS · U.S. births, 2023','https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-1.pdf'],['NCHS · State gestational diabetes rates (2020)','https://www.cdc.gov/nchs/data/nvsr/nvsr71/nvsr71-03.pdf'],['Virginia · Pregnancy Risk Assessment Monitoring System (PRAMS)','https://www.vdh.virginia.gov/content/uploads/sites/67/2025/01/Gestational-Diabetes-Data.pdf'],['CMS · Primary payer at delivery','https://www.medicaid.gov/medicaid/quality-of-care/downloads/mih-beneficiary-profile.pdf']],[
      ...nationalMethods,geoText,...geoNotes,...type1Counts.notes,
      'National subgroup estimates use NHIS Sample Adult weights. Prediabetes excludes diagnosed diabetes. A dash suppresses small cells. Confidence intervals for the NHIS trend use the annual strata and primary sampling units with a logit transformation.',
      'Virginia PRAMS surveyed people after a live birth. The rows describe rates within each group. The 2018 national payer table also shows the estimated distribution of cases, calculated from payer-specific rates and shares of births. A dash marks a share unavailable from the source.'
    ]);
}
