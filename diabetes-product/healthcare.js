import {barList, chartMark, dataTable, lineChart, matrix, sourcesFooter} from './charts.js';
import {complications, histories, links} from './evidence.js';
import {card, heading, pair} from './epidemiology.js';
import {spendingMap} from './spending-map.js';
import {treatmentServiceProfile} from './treatment-accounts.js';

const cmsMedicare = 'https://www.cms.gov/about-cms/agency-information/omh/downloads/data-snapshots-diabetes.pdf';
const cmsMedicaid = 'https://www.medicaid.gov/medicaid/quality-of-care/downloads/2023-child-and-adult-core-sets-trending-summary-chart-pack.pdf';
const physicianSource = 'https://doi.org/10.2337/dc26-2070';
const mepsBrief = 'https://meps.ahrq.gov/data_files/publications/st568/stat568.pdf';
const stateToolkit = 'https://www.cdc.gov/diabetes/burden-toolkit/state-burden-toolkit-economic-burden.html?cove-tab=1';
const stateDataset = 'https://data.cdc.gov/d/58s6-s24x';
const stateMethods = 'https://www.cdc.gov/diabetes/burden-toolkit/docs/technical_documentation.pdf';
const billions = value => '$' + value.toFixed(1) + 'B';
const dollars = value => '$' + value.toLocaleString('en-US');

export const medicaidTrend = {
  title: 'A1C outcomes in Medicaid',
  unit: 'Median percentage in 27 states · Medicaid adults ages 18–64 with diabetes',
  format: 'percent',
  labels: [2020, 2021, 2022],
  series: [['Poor control or missing result', [43.4, 39.1, 37.2]]],
  source: cmsMedicaid,
  note: 'The measure includes an A1C above 9%, a missing result or no recorded test.'
};

const treatmentBillions = 153.2;
const payerShares = [
  ['Medicare', 41.0],
  ['Private insurance', 32.0],
  ['Medicaid', 17.2],
  ['Patients and families', 6.2],
  ['Other sources', 3.5]
];

export function healthcarePaymentRows() {
  return payerShares.flatMap(([name, share]) => {
    const scope = 'Annual average, 2021–22 · U.S. community-dwelling adults treated for diabetes';
    const amount = treatmentBillions * share / 100;
    return [
      ['Healthcare · Treatment payments', name, scope, share, '% of all national diabetes treatment payments', mepsBrief],
      ['Healthcare · Treatment payments', name, scope, +amount.toFixed(1), 'approximate billions of 2022 USD, calculated from rounded share', mepsBrief]
    ];
  });
}

function nationalAccounts() {
  const direct = [
    ['Outpatient medicines and supplies', 137.0],
    ['Hospitals, nursing facilities and hospice', 105.8],
    ['Outpatient care', 63.7]
  ];
  const lost = [
    ['Lower productivity while working', 35.8],
    ['Premature death', 32.4],
    ['Lower employment due to disability', 28.3],
    ['Missed work', 5.4],
    ['Lost productivity outside paid work', 4.4]
  ];
  return `<article class="panel cc-national">
    <h2>What diabetes costs the United States</h2>
    <div class="cc-accounts">
      <section class="cc-burden"><h3>Economic burden of diagnosed diabetes</h3>
        <strong class="cc-number">$412.9B</strong><span class="cc-period">ADA · 2022</span>
        <div class="cc-burden-bar" role="group" aria-label="Economic burden in 2022">
          <button type="button" ${chartMark('Excess medical costs','$306.6B · 74.3%','2022 economic burden')}></button>
          <button type="button" ${chartMark('Lost productivity','$106.3B · 25.7%','2022 economic burden')}></button>
        </div>
        <div class="cc-key"><span><i></i><b>$306.6B</b> excess medical costs</span><span><i></i><b>$106.3B</b> lost productivity</span></div>
      </section>
      <section class="cc-treatment"><h3>Payments for diabetes treatment</h3>
        <strong class="cc-number">${billions(treatmentBillions)}</strong><span class="cc-period">AHRQ · annual average, 2021–22</span>
        <p>The survey linked payments to prescriptions and care for <b>26.3 million adults</b> in an average year. Medicare was the largest payer.</p>
      </section>
    </div>
    <p class="cc-overlap"><strong>Treatment is part of the medical burden. The exact dollar overlap between these studies is unknown.</strong> An insulin refill can appear in both estimates. The ADA also counts excess care for heart or kidney disease and the value of work people miss.</p>
    <div class="cc-breakdown">
      <section><h3>Medical costs by service</h3>${barList(direct, {max:140,format:billions,context:'Additional U.S. medical spending attributable to diagnosed diabetes, 2022'})}</section>
      <section><h3>Sources of lost productivity</h3>${barList(lost, {max:140,format:billions,color:'#216f68',context:'U.S. productivity losses attributable to diagnosed diabetes, 2022'})}</section>
    </div>
  </article>`;
}

function treatmentPayers() {
  const rows = payerShares.map(([name, share]) => {
    const pct = share.toFixed(1) + '%';
    const amount = billions(treatmentBillions * share / 100);
    return `<tr><th scope="row">${name}</th><td><button type="button" class="cc-share" ${chartMark(name, pct, amount+' in estimated annual treatment payments')}>
      <i aria-hidden="true"><i style="width:${share}%"></i></i><b>${pct}</b></button></td><td>${amount}</td></tr>`;
  }).join('');
  return `<article class="panel cc-payers"><h2>Who paid for diabetes treatment?</h2>
    <p class="cc-intro">Medicare and private insurers paid 73 cents of each dollar. Patients and families paid about 6 cents directly.</p>
    <div class="value-table"><table aria-label="Annual U.S. diabetes treatment payments by payer, 2021–22">
      <thead><tr><th scope="col">Source of payment</th><th scope="col">Share of dollars</th><th scope="col">Approx. per year</th></tr></thead>
      <tbody>${rows}</tbody></table></div></article>`;
}

function treatmentServices() {
  const rows = treatmentServiceProfile.map(service => [
    service.name, service.share.toFixed(1) + '%', service.use.toFixed(1) + '%', dollars(service.mean)
  ]);
  return `<article class="panel cc-services"><h2>What the treatment payments bought</h2>
    <p class="cc-intro">Prescriptions accounted for 80.3% of treatment spending. Hospital stays reached 0.9% of treated adults and averaged $15,380 per hospitalized adult.</p>
    ${dataTable(['Diabetes service','Share of dollars','Adults using it','Mean per user¹'],rows,'U.S. adults treated for diabetes, average year 2021–22')}
    <p class="reading">Annual treatment payments averaged <strong>$5,810</strong> per treated adult across all services. The median was <strong>$1,770</strong>.</p>
    <a class="chapter-next" href="#industry/market/treatment">See payments by medicine and provider →</a></article>`;
}

function medicalCostDetail() {
  const costs = [
    ['Hospital inpatient care',3772], ['Office visits',1319], ['Hospital outpatient visits',475],
    ['Emergency visits',464], ['Home health',219]
  ];
  const perPerson = card('Where the added medical cost falls',
    '<p class="cc-intro">A person with diagnosed diabetes incurred an average of $19,736 in medical spending in 2022. The ADA model attributed $12,022 of that amount to diabetes.</p>' +
    barList(costs,{max:4000,format:dollars,context:'Average excess 2022 spending for this service per person with diagnosed diabetes'}));
  const ages = card('How medical costs vary by age',
    '<p class="cc-intro">People 65 and older accounted for two-thirds of the U.S. medical costs attributable to diagnosed diabetes in 2022.</p>' +
    dataTable(['Age','Excess medical cost','Per person with diabetes'],[
      ['Under 65','$101.5B','$7,482'],['65 and older','$205.1B','$17,180']
    ],'U.S. medical costs attributable to diabetes by age in 2022'));
  return pair(perPerson,ages);
}

function careUse() {
  const services = card('Where adults received care for any reason',
    '<p class="axis-unit">Adults in each group with at least one encounter in the past year · U.S., 2023</p>' +
    dataTable(['Service','Any diagnosed diabetes','Type 1','Type 2','Prediabetes only'],[
      ['In-person visit with a doctor or other health professional','97.2%','95.6%','97.6%','93.0%'],
      ['Emergency department','31.4%','31.4%','31.1%','24.7%'],
      ['Urgent care or retail clinic','30.1%','33.0%','29.5%','32.6%'],
      ['Overnight hospital stay','18.3%','18.9%','18.1%','11.6%']
    ],'Annual use of care for any reason by reported diabetes diagnosis'));
  const physicians = card('Which doctors saw older adults with diabetes?',
    '<p class="axis-unit">Traditional Medicare beneficiaries age 65+ with diabetes · annual encounter rate, 2018–21</p>' +
    dataTable(['Specialty','Type 1','Type 2'],[
      ['Primary care','75.2%','73.7%'],['Endocrinology','60.3%','9.5%'],['Both specialties','46.3%','7.7%'],['At least one of the two','89.2%','75.5%']
    ],'Annual physician encounters among Medicare beneficiaries with diabetes'));
  return pair(services,physicians);
}

function hospitalCare() {
  const rows = complications.map(([label,earlier,later]) => [
    label,(earlier*1000).toLocaleString('en-US'),(later*1000).toLocaleString('en-US'),
    (later>earlier?'+':'') + ((later/earlier-1)*100).toFixed(1) + '%'
  ]);
  return card('When diabetes appears in hospital care',
    '<p class="cc-intro">U.S. hospitals listed diabetes on 8.1 million adult discharges in 2021. Major cardiovascular disease was the reason for 1.78 million of those stays.</p>' +
    dataTable(['Condition or procedure','2020 stays','2021 stays','Change'],rows,'U.S. adult discharges with diabetes and selected causes') +
    '<p class="reading">Emergency departments recorded 16.5 million adult visits with diabetes in 2021. Of 253,000 visits involving a hyperglycemic crisis, 84.6% led to admission. Of 192,000 visits involving hypoglycemia, 25.0% led to admission.</p>');
}

function coverageAndAccess(coverage) {
  const covered = matrix('Which coverage did adults with diabetes have?',
    'Share of adults with diagnosed diabetes in each group, 2023. A person can hold more than one type of coverage.',
    Object.entries(coverage), ['Medicaid','Medicare','Private insurance','Uninsured'], ['#5147b5','#13796f','#985524','#475a78']);
  const medicare = card('Diabetes among traditional Medicare enrollees',
    '<p class="axis-unit">Diabetes prevalence within each coverage group · 2022</p>' +
    barList([['All enrollees',26],['Medicare only',24],['Medicare and Medicaid',37]],{max:45,color:'#66529e',context:'Diabetes prevalence in this traditional Medicare group, 2022'}) +
    '<p class="reading">Diabetes prevalence was 13 percentage points higher among people eligible for both programs than among Medicare-only enrollees, after age adjustment.</p>');
  const exams = matrix('Preventive care by insurance status',
    'Adults 20+ with diagnosed type 2 diabetes · care in the preceding year · 2015 to March 2020',
    [['Service',[['A1C checked',90.1,60.2],['Professional foot exam',75.1,47.4],['Dilated eye exam',67.7,37.2],['Saw a health professional for diabetes',78.4,46.7]]]],
    ['Insured','Uninsured'],['#5147b5','#13796f']);
  const barriers = card('When cost got in the way of care',
    '<p class="axis-unit">U.S. adults with diagnosed diabetes, all types · 2023</p>' +
    barList([['Could not afford a needed prescription',11.4],['Delayed medical care due to cost',7.6],['Had no usual place for care',2.8]],{max:15,context:'U.S. adults with diagnosed diabetes, 2023'}));
  return covered + pair(medicare,lineChart(medicaidTrend)) + pair(exams,barriers);
}

const sources = [
  ['ADA · Economic costs of diagnosed diabetes, including care for complications and lost productivity', links.costs],
  ['AHRQ · Adult treatment spending, services and sources of payment, Figures 3–6',mepsBrief],
  ['CDC · State medical costs by payer',stateToolkit],
  ['CDC · State Burden Toolkit data download',stateDataset],
  ['CDC · State cost model, definitions and methods',stateMethods],
  ['NCHS · 2023 Sample Adult codebook',links.nhisBook],
  ['NCHS · 2023 Sample Adult public-use file',links.adult23],
  ['Diabetes Care · Primary care and endocrinology visits in traditional Medicare',physicianSource],
  ['CDC · Hospital discharges and emergency visits',links.cdc],
  ['NCHS · Emergency department visit rates by age',links.ed],
  ['CMS · Diabetes among traditional Medicare enrollees',cmsMedicare],
  ['CMS · Medicaid quality measures in the same reporting states',cmsMedicaid],
  ['CMS · A1C measure definition','https://www.medicaid.gov/sites/default/files/2023-06/medicaid-adult-core-set-manual-jun2023.pdf'],
  ['NIDDK · Preventive care in type 2 diabetes, Table 10',links.preventive],
  ['Fang et al. · Trends in diabetes treatment and control',links.control]
];
const methods = [
  'The ADA estimated additional resources used because of diagnosed diabetes across all ages and settings in 2022. For a stay related to heart or kidney disease, the model attributes the excess use associated with diabetes. Medical costs also include institutional care. Its productivity account values missed work, reduced performance, disability-related employment loss and premature death. Inflation-adjusted history uses 2022 dollars. Category totals are rounded independently.',
  'AHRQ linked payments to an adult’s diabetes treatment in the 2021 and 2022 Medical Expenditure Panel Survey. The national average covers civilian, noninstitutionalized adults 18 and older and is expressed in 2022 dollars. A diabetes-related visit enters at its full payment even when multiple conditions were addressed. Care solely for complications, nursing home residents, separately purchased medical equipment and lost productivity fall outside this estimate. The $153.2B estimate can neither be added to nor deducted from the ADA total.',
  'Payer amounts multiply rounded AHRQ shares by the annual $153.2B. The published shares sum to 99.9% after rounding. Patients and families means payments made directly at the point of care or for prescriptions. Other sources include the VA, state and local programs and workers’ compensation. A person can use several services. ¹ Mean per user is the total paid during the year for that service among adults who used it. The payer and service tables describe the same treatment dollars from different angles.',
  'The CDC state map uses a separate 2021 model of medical spending attributable to diabetes in adults aged 19 and older. Its main payer breakdown combines private insurance, household payments and other sources under Other payers. Per-person estimates have payer-specific denominators. The separate private insurer estimates use a different accounting perspective. Combining these estimates with the main payer categories would double count spending.',
  'NHIS estimates use 2023 Sample Adult weights and valid responses for each question. The doctor question includes any in-person encounter about health, including during a hospital stay, and excludes dental visits. Visit reasons and specialty are unavailable for that question. Prescription affordability and delayed care refer to any needed medication or medical care in the preceding 12 months. The usual source of care and insurance questions describe current circumstances.',
  'The physician study followed a sample of 1,840,259 fee-for-service Medicare beneficiaries aged 65 and older with continuous Parts A and B enrollment. The CMS prevalence snapshot age-standardized the dual-eligibility comparison. Medicaid state medians use reporting cycles 2021–23 for care years 2020–22. The A1C quality indicator includes missing results and absent testing.',
  'Hospital data count discharges or visits. One person can have several encounters and some conditions overlap. NCHS emergency visit trends use the full resident population of each age band as the denominator. The preventive care survey relies on self-report. The control study used NHANES for nonpregnant adults aged 20 or older with diagnosed diabetes.'
];

export function healthcare(resources,view) {
  const stateMap = spendingMap(resources.svg,view.costState,view.costMode,resources.stateCosts,view.costPayer);
  return heading('Costs and care use') +
    nationalAccounts() +
    '<div class="cc-treatment-tables">' + treatmentPayers() + treatmentServices() + '</div>' +
    '<section id="cost-geography" aria-label="State medical spending">' + stateMap + '</section>' +
    medicalCostDetail() + lineChart({...histories.cost,annotate:true}) +
    careUse() + hospitalCare() + lineChart(histories.emergency) +
    coverageAndAccess(resources.coverage) + lineChart(histories.control) +
    '<nav class="coverage-paths" aria-label="Coverage and regulation"><a href="#healthcare/public">Medicare and Medicaid →</a><a href="#healthcare/private">Private insurance and approvals →</a><a href="#healthcare/policy">FDA decisions and public policy →</a></nav>' +
    sourcesFooter(sources,methods);
}
