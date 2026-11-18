import {barList, dataTable, lineChart, measures, sourcesFooter} from './charts.js';
import {card, heading, pair} from './epidemiology.js';

const sources = {
  medicareSensor: ['Medicare.gov · Coverage and cost of a continuous glucose monitor', 'https://www.medicare.gov/coverage/continuous-glucose-monitors'],
  maSensor: ['Journal of Managed Care & Specialty Pharmacy · Glucose monitor use in Humana Medicare Advantage, 2021–23', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12948752/'],
  stateSensor: ['Center for Health Care Strategies · Medicaid glucose monitor policies by state, July 2026', 'https://www.chcs.org/media/CGM-Access-for-Medicaid-Beneficiaries-with-Diabetes-State-By-State-Coverage_2026.pdf'],
  publicFormulary: ['Annals of Internal Medicine · Medicaid formularies for type 2 diabetes medicines, March 2024', 'https://escholarship.org/content/qt71p11529/qt71p11529.pdf'],
  medicareAppeal: ['Diabetes, Obesity and Metabolism · Independent Medicare Part D appeals through June 2025', 'https://doi.org/10.1111/dom.71201'],
  commercialFormulary: ['JAMA Health Forum · Coverage and restrictions on SGLT2 inhibitors, April 2021', 'https://jamanetwork.com/journals/jama-health-forum/fullarticle/2787278'],
  firstClaim: ['Health Affairs Scholar · First GLP-1 claims and paid fills following denial, 2018–24', 'https://doi.org/10.1093/haschl/qxag284'],
  automated: ['Prime Therapeutics · Commercial GLP-1 authorization program, methods and Figure 2', 'https://www.primetherapeutics.com/documents/d/primetherapeutics/evt_ext_261001-b_amcppstr_impactofmedclaims_r3-2'],
  employerSensor: ['Clinical Diabetes · Glucose monitor claims in employer plans, 2010–13 and 2016–19', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11247039/'],
  insulinCost: ['Peterson–KFF Health System Tracker · Patient insulin spending by private insurance market, 2018', 'https://www.healthsystemtracker.org/brief/out-of-pocket-spending-on-insulin-among-people-with-private-insurance/']
};

const medicareCgm = [[2021, 4.8, 222236], [2022, 10.2, 229093], [2023, 13.7, 286951]];
const medicaidPolicies = [
  ['Published coverage', 49],
  ['Includes gestational diabetes', 40],
  ['Pharmacy benefit only', 31],
  ['Pharmacy and equipment benefits', 9]
];
const formularyRows = [
  ['GLP-1 medicines', 60, 30, 48, 131],
  ['SGLT2 inhibitors', 80, 40, 67, 182],
  ['DPP-4 inhibitors', 84, 42, 75, 204]
];
const appeals = [['Ozempic · injection', 15], ['Rybelsus · tablet', 19], ['Mounjaro · injection', 11]];
const firstDenials = [['Commercial insurance', 5.6], ['Managed Medicaid', 12.6], ['Medicare Advantage', 3]];
const subsequentFill = [['2018', 45.9], ['2024', 24.8]];
const approvalDates = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025'];
const autoApprovals = [44.2, 45.1, 46.6, 53.2, 55.1, 56.4, 59.1, 60.2, 61.1, 61.7];
const employerCgm = [['2010–13', 20.12, 42302, 210275], ['2016–19', 49.78, 65411, 131406]];
const insulinCosts = [['Small employer', 31], ['Individual market', 26], ['Large employer', 19]];
const number = value => value.toLocaleString('en-US');
const integerPercent = value => value + '%';

export function publicCoverage() {
  const use = lineChart({
    title: 'Glucose sensor use in Medicare Advantage',
    unit: 'Sensor use in a Humana Medicare Advantage cohort with insulin-treated type 2 diabetes · annual average',
    labels: medicareCgm.map(row => row[0]),
    series: [['Sensor use', medicareCgm.map(row => row[1])]],
    format: 'percent', source: sources.maSensor[1],
    note: 'During 2023, 49,395 of 286,951 members had evidence of sensor use at some point.'
  });
  const eligibility = card('Who qualifies for a Medicare sensor?',
    '<p>Medicare covers a prescribed sensor and supplies when someone with diabetes takes insulin or has a documented history of problematic low blood sugar. The clinician evaluates eligibility and confirms that the person or caregiver has been trained to use the device.</p>' +
    '<div class="measure-call"><b>20%</b><p>Usual share of the approved amount under Original Medicare, after the Part B deductible, when the supplier accepts assignment.</p></div>');
  const medicaid = card('Where Medicaid covers a glucose sensor',
    '<p class="axis-unit">Published fee-for-service policies across 50 states and Washington, DC · July 2026</p>' +
    barList(medicaidPolicies, {max: 51, format: value => value + '/51'}) +
    '<p class="reading">In May 2023, 46 jurisdictions published coverage. By July 2026, Alabama, Florida and Georgia had extended coverage from children to adults. All seven states that previously restricted eligibility to type 1 had added type 2.</p>');
  const process = card('How state rules change the pharmacy visit',
    measures([['11 states', 'Waived prior authorization for a preferred sensor when the person met the clinical criteria.'],
      ['16 states + DC', 'Used claims records to check eligibility automatically. A request that missed the automated criteria went to manual review.']]) +
    '<p class="reading">Ohio and Washington waived prior authorization under those conditions. California, Florida and New York used automated approval. Arizona and Virginia allowed access through both pharmacy and equipment suppliers.</p>');
  const drugs = card('Medicaid coverage for type 2 medicines',
    '<p class="axis-unit">Plans listing at least one medicine in the class without prior authorization or step therapy · March 2024</p>' +
    dataTable(['Drug family', 'Fee-for-service', 'Managed care'], formularyRows.map(([name, fee, nFee, managed, nManaged]) =>
      [name, fee + '% · ' + nFee + '/50', managed + '% · ' + nManaged + '/273'])) +
    '<p class="reading">Depending on the state, an estimated 0% to 99% of managed-care enrollees had unrestricted GLP-1 coverage.</p>');
  const appeal = card('Which Medicare drug appeals succeeded?',
    '<p class="axis-unit">Share of independent Part D appeals decided in the enrollee’s favor · January–June 2025</p>' +
    barList(appeals, {max: 100, format: integerPercent}) +
    '<p class="reading">These were denials that had already reached a second-level review. By 2025, an initial prior-authorization request had led to 90% of the Ozempic appeals.</p>');
  return heading('Public coverage') +
    '<p class="population-summary">Medicare sets a national benefit. Medicaid access can change with the state and the plan. Follow a glucose sensor from eligibility to use, then see what happens when a prescription needs approval.</p>' +
    pair(eligibility, use) + pair(medicaid, process) + pair(drugs, appeal) +
    sourcesFooter([sources.medicareSensor, sources.maSensor, sources.stateSensor, sources.publicFormulary, sources.medicareAppeal], [
      'Medicare Advantage is the public Medicare benefit delivered by a private plan. The sensor study used Humana claims in three annual cohorts of insulin-treated people with type 2 diabetes. Annual cohort sizes were 222,236 in 2021, 229,093 in 2022 and 286,951 in 2023. The line shows the study’s annual average use across months. The count of people using a sensor at any point in 2023 uses the full year.',
      'The Center for Health Care Strategies reviewed published Medicaid fee-for-service policies for 50 states and DC. Each item measures a different policy feature. Hawaii and New Mexico had no published fee-for-service policy in the July 2026 scan. Both could still provide individual medical-necessity coverage or access through a managed-care plan.',
      'Fee-for-service pays providers directly for each service. Managed care contracts with plans. The March 2024 formulary study compared 50 fee-for-service formularies, including DC, with 273 comprehensive adult Medicaid managed-care plans in 39 states. Each plan counts once in the table. The state range uses enrollment weights.',
      'The Medicare appeals study included 8,821 independent, second-level reviews of three diabetes-labeled brands between January 2020 and June 2025. Percentages shown are for January–June 2025. Some claims involved use outside the approved indication. A favorable appeal measures the review decision. Actual dispensing was outside its scope.'
    ]);
}

export function privateCoverage() {
  const formulary = card('Access to SGLT2 medicines',
    '<p class="axis-unit">Oral medicines used to treat type 2 diabetes · commercial or employer drug benefits · April 2021</p>' +
    measures([['61%', 'Of covered members had at least one SGLT2 inhibitor available without prior authorization or a requirement to try another drug first.'],
      ['40%', 'Of covered members faced a requirement to try another medicine before dapagliflozin (Farxiga).']]));
  const decision = card('Who had a first GLP-1 claim denied?',
    '<p class="axis-unit">First observed pharmacy claims for GLP-1 drugs labeled for diabetes or obesity · adults 21 and older · 2018–24</p>' +
    barList(firstDenials, {max: 100}) +
    '<p class="reading">Across all three payers, the denial rate was 6.3% for diabetes-labeled brands and 16.8% for obesity-labeled brands.</p>');
  const after = card('Did people obtain a GLP-1 after a denial?',
    '<p class="axis-unit">Share of people with an initial denial who had a paid GLP-1 fill within 90 days · all three payer groups</p>' +
    barList(subsequentFill, {max: 100}) +
    '<p class="reading">Across the seven study years, 34.1% obtained a paid fill within 90 days. The fill could be for a different GLP-1.</p>');
  const automation = lineChart({
    title: 'When a diabetes GLP-1 cleared authorization automatically',
    unit: 'Share of commercial members with a paid, reviewed diabetes GLP-1 claim that cleared through automated review',
    labels: approvalDates, series: [['Automated review', autoApprovals]], format: 'percent', source: sources.automated[1],
    note: 'In July 2025, 215,178 of 348,624 members with a paid claim cleared the automated check. The program checked diagnosis and prior claims before sending remaining requests for standard review.'
  });
  const cost = card('Who paid over $35 a month for insulin?',
    '<p class="axis-unit">Share of insulin users paying more than $420 out of pocket per year for an insulin product · private insurance · 2018</p>' +
    barList(insulinCosts, {max: 100, format: integerPercent}) +
    '<p class="reading">The individual market includes people who bought coverage on or off an insurance marketplace. The study’s large employers had more than 1,000 workers.</p>');
  const tech = card('Glucose sensors in employer plans',
    '<p class="axis-unit">People ages 0–64 with type 1 diabetes and at least one sensor claim during each four-year study period</p>' +
    dataTable(['Period', 'People using a sensor', 'Share of cohort'], employerCgm.map(([period, share, users, size]) => [period, number(users) + ' of ' + number(size), share + '%'])) +
    '<p class="reading">In 2016–19, 90.63% of sensor claims went through the equipment benefit and 9.37% through the pharmacy benefit.</p>');
  return heading('Private insurance') +
    '<p class="population-summary">In employer and individual plans, access depends on the drug list, the pharmacy decision and what a person owes. Medicare Advantage and managed Medicaid appear as public-program comparisons.</p>' +
    formulary + pair(decision, after) + automation + pair(cost, tech) +
    sourcesFooter([sources.commercialFormulary, sources.firstClaim, sources.automated, sources.insulinCost, sources.employerSensor], [
      'The April 2021 formulary analysis included 1,842 commercial or employer plans. Percentages weight plan rules by the number of people covered. A listed drug and a paid prescription measure different steps.',
      'Inovalon pharmacy claims covered 2,520,208 people ages 21 and older in commercial insurance, managed Medicaid or Medicare Advantage. Each person contributed one first observed claim from 2018–24. A denial can have several causes, including administrative or coverage restrictions. Claims data do not identify the exact reason. Follow-up required continuous pharmacy coverage for 90 days. Brand classifications use FDA indications and cannot establish the individual reason for treatment.',
      'Prime Therapeutics reported its own commercial pharmacy-benefit program in a conference poster. The feature was available to 15.3 million members. The denominator for each point is members with a paid diabetes-labeled GLP-1 claim cleared through standard or automated review. Denied requests are outside that denominator. In October 2024, 138,355 of 312,762 such members cleared the automated check.',
      'The insulin comparison is a historical measure from 2018. KFF used CMS EDGE claims for ACA-compliant individual and small-group plans and weighted MarketScan large-employer claims. The threshold is an annual average per insulin product. The measure describes spending under the plans studied in 2018.',
      'The employer sensor study identified people with type 1 diabetes in two separate MarketScan cohorts. A device or supply claim indicates sensor use during the period. Some people were enrolled for only part of a four-year period. The distribution by equipment or pharmacy benefit describes claims, while the use percentages describe people.'
    ]);
}

export function payerRows() {
  const pub = 'Public coverage';
  const priv = 'Private insurance';
  const records = [
    ...medicareCgm.flatMap(([year, share, total]) => [
      [pub, 'Annual average sensor use', year, share, '% of study Medicare Advantage members with insulin-treated type 2 diabetes', sources.maSensor[1]],
      [pub, 'Insulin-treated type 2 diabetes cohort', year, total, 'people in Medicare Advantage study', sources.maSensor[1]]
    ]),
    [pub, 'Any sensor use during calendar year', 2023, 49395, 'people of 286,951 in the Medicare Advantage cohort', sources.maSensor[1]],
    [pub, 'Original Medicare sensor coinsurance', 'After Part B deductible', 20, '% of approved amount when supplier accepts assignment', sources.medicareSensor[1]],
    [pub, 'Medicaid fee-for-service sensor policies', 'Published coverage · May 2023', 46, 'jurisdictions out of 50 states and DC', sources.stateSensor[1]],
    ...medicaidPolicies.map(([label, value]) => [pub, 'Medicaid fee-for-service sensor policies', label + ' · July 2026', value, 'jurisdictions out of 50 states and DC', sources.stateSensor[1]]),
    [pub, 'Medicaid sensor prior authorization', 'Waived under preferred product and clinical criteria · July 2026', 11, 'states', sources.stateSensor[1]],
    [pub, 'Medicaid sensor prior authorization', 'Automated · July 2026', 17, '16 states and DC', sources.stateSensor[1]],
    ...formularyRows.flatMap(([name, fee, nFee, managed, nManaged]) => [
      [pub, 'Unrestricted drug class in Medicaid fee-for-service', name + ' · Mar 2024', fee, '% of 50 plans (' + nFee + ' plans)', sources.publicFormulary[1]],
      [pub, 'Unrestricted drug class in Medicaid managed care', name + ' · Mar 2024', managed, '% of 273 plans (' + nManaged + ' plans)', sources.publicFormulary[1]]
    ]),
    ...appeals.map(([label, value]) => [pub, 'Medicare Part D level 2 appeals favorable to enrollee', label + ' · Jan–Jun 2025', value, '% of second-level reviews for brand', sources.medicareAppeal[1]]),
    [pub, 'Ozempic level 2 appeals originating in prior authorization', 'Jan–Jun 2025', 90, '% of independent Ozempic appeals', sources.medicareAppeal[1]],
    [priv, 'Unrestricted SGLT2 inhibitor available', 'Commercial/employer · Apr 2021', 61, '% of covered members', sources.commercialFormulary[1]],
    [priv, 'Dapagliflozin step therapy', 'Commercial/employer · Apr 2021', 40, '% of covered members', sources.commercialFormulary[1]],
    ...firstDenials.map(([label, value]) => [priv, 'First observed GLP-1 claim denied', label + ' · 2018–24', value, '% of adults with first observed claim, diabetes and obesity brands', sources.firstClaim[1]]),
    ...[['Diabetes-labeled brands', 6.3], ['Obesity-labeled brands', 16.8]].map(([label, value]) => [priv, 'First observed GLP-1 claim denied', label + ' · 2018–24', value, '% of first observed claims for brand group across all three payers', sources.firstClaim[1]]),
    ...[...subsequentFill, ['2018–24 pooled', 34.1]].map(([period, value]) => [priv, 'Paid GLP-1 fill within 90 days after initial denial', period, value, '% of continuously covered adults with an initial denial across all three payers', sources.firstClaim[1]]),
    ...autoApprovals.map((value, index) => [priv, 'Automated diabetes GLP-1 approval', approvalDates[index], value, '% of commercial members with a paid reviewed claim, Prime program', sources.automated[1]]),
    ...insulinCosts.map(([label, value]) => [priv, 'Annual insulin out-of-pocket spending above $420 per product', label + ' · 2018', value, '% of insulin users', sources.insulinCost[1]]),
    ...employerCgm.map(([period, share, users, size]) => [priv, 'People with a CGM claim in employer coverage', period, share, '% of people ages 0–64 with type 1 diabetes (' + users + ' of ' + size + ')', sources.employerSensor[1]]),
    [priv, 'Sensor claims processed through equipment benefit', 'Employer plans · 2016–19', 90.63, '% of CGM claims', sources.employerSensor[1]],
    [priv, 'Sensor claims processed through pharmacy benefit', 'Employer plans · 2016–19', 9.37, '% of CGM claims', sources.employerSensor[1]]
  ];
  return records;
}
