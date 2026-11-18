import {fdaTimeline,fdaSources,fdaNotes,fdaExportRows} from './fda-timeline.js';
import {marketAccounts,marketAccountSources,marketAccountNotes,marketAccountRows} from './market-accounts.js';
import {treatmentAccounts,treatmentAccountSources,treatmentAccountNotes,treatmentAccountRows} from './treatment-accounts.js';
import {glucosePrices,glucosePriceSources,glucosePriceNotes,glucosePriceRows} from './glucose-prices.js';
import {barList, dataTable, escapeHTML, lineChart, measures, sourcesFooter} from './charts.js';
import {histories, links, milestones} from './evidence.js';
import {card, heading, pair} from './epidemiology.js';
import {sources} from './data.js';
import {milestoneRows} from './treatment-evolution.js';
import {deviceExportRows} from './device-catalog.js';
export {productEvolution} from './treatment-evolution.js';
export {catalogPage, compareCatalog, catalogProducts} from './device-catalog.js';

const ref = {
  amputation: 'https://aspe.hhs.gov/sites/default/files/documents/b60f396f32e29a2a9469276d9ca80e4b/aspe-insulin-affordibility-rtc.pdf',
  meps: 'https://meps.ahrq.gov/data_files/publications/st568/stat568.shtml',
  first: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12039499/',
  drugSpend: 'https://doi.org/10.2337/dc25-2016',
  partDDrugs: 'https://oig.hhs.gov/documents/audit/10207/A-05-24-00015.pdf',
  treatment: 'https://www.niddk.nih.gov/health-information/diabetes/overview/insulin-medicines-treatments',
  oig: 'https://oig.hhs.gov/documents/evaluation/11277/OEI-04-23-00430.pdf',
  oop: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2766588',
  ada: 'https://professional.diabetes.org/sites/default/files/media/cost_of_diabetes_2022.pdf',
  marketEstimate: 'https://storage.googleapis.com/investably-app-documents/iYqh7TjYLZSij5q7l1Qh/documents/MODD_InvestorPresentation_September2026.pdf',
  meter: 'https://www.accu-chek.com/products/meters/guide-me',
  strips: 'https://www.accu-chek.com/tools/prescription-discount-program',
  steloPrice: 'https://www.stelo.com/buy-stelo-one-time',
  medicareCgm: 'https://www.medicare.gov/coverage/continuous-glucose-monitors',
  medicareInsulin: 'https://www.medicare.gov/coverage/insulin',
  medicareBook: 'https://www.medicare.gov/publications/11022-medicare-coverage-of-diabetes-supplies-services-prevention-programs.pdf',
  prices: 'https://www.cms.gov/files/document/fact-sheet-negotiated-prices-initial-price-applicability-year-2026.pdf',
  bridge: 'https://www.cms.gov/medicare/coverage/prescription-drug-coverage/medicare-glp-1-bridge',
  prevention: 'https://www.medicare.gov/coverage/medicare-diabetes-prevention-program',
  medicaid: 'https://www.medicaid.gov/medicaid/prescription-drugs',
  ks: 'https://www.medicaid.gov/medicaid/spa/downloads/KS-23-0045.pdf',
  nc: 'https://medicaid.ncdhhs.gov/5a-3-nursing-equipment-and-supplies/open'
};

const firstDrugs = [
  ['Metformin', '76%', '64%'], ['GLP-1 therapies', '6%', '18%'],
  ['SGLT2 inhibitors', '4%', '7%'], ['Sulfonylureas', '4%', '2%'], ['DPP-4 inhibitors', '2%', '1%']
];
const drugDollars = [
  ['Newer noninsulin drugs', 63.0], ['Analog insulin', 29.8], ['Older oral drugs', 6.3], ['Human insulin', 0.8]
];
const partDBrands = [
  ['Metformin',31.2,0.6283],['Jardiance · SGLT2',8.154889,8.841],['Ozempic · GLP-1',6.933461,9.200],
  ['Trulicity · GLP-1',5.317944,7.366],['Farxiga · SGLT2',4.299402,4.343],['Mounjaro · GIP/GLP-1',1.822757,2.363]
];
const medicareDevices = [
  ['CGM receiver', '$259.60', '$278.65'], ['Monthly supply allowance', '$244.62', '$274.46']
];
const patientBills = [
  ['No sensor or pump', 79], ['CGM only', 472], ['Pump only', 562], ['Both devices', 1037]
];
const money = v => '$' + v.toLocaleString('en-US');

function explanatoryTable(headers, rows, label) {
  return `<div class="industry-prose-table"><table aria-label="${escapeHTML(label)}"><thead><tr>${headers.map(h=>`<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(([k,...cells])=>`<tr><th scope="row">${escapeHTML(k)}</th>${cells.map((c,i)=>`<td data-column="${escapeHTML(headers[i+1])}">${escapeHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function marketOverview() {
  const prescribing = card('Which medicines people started',
    '<p class="industry-caption">Share of first glucose-lowering prescriptions in a U.S. claims study of adults with type 2 diabetes.</p>'+
    dataTable(['Drug family','Jan 2022','May 2023'],firstDrugs,'First-line use in adults with type 2 diabetes')+
    '<p class="reading">Metformin remained the most common first medicine. In just 16 months, the share starting a GLP-1 therapy tripled.</p>');
  const drugSpending = card('Which medicines captured spending',
    '<p class="industry-caption">Share of U.S. glucose-lowering medication spending among adults with diabetes, 2022.</p>'+barList(drugDollars)+
    '<p class="reading">Newer noninsulin drugs include GLP-1, SGLT2 and DPP-4 therapies. Average annual drug spending per adult rose from $856 in 2000 to $3,725 in 2022, in constant 2022 dollars.</p>');
  const brands = card('Selected Medicare prescriptions in 2023',
    '<p class="industry-caption">Medicare Part D fills and gross payments before rebates.</p>'+
    dataTable(['Drug','Prescription fills','Gross spending'],partDBrands.map(([name,fills,gross])=>[name,fills.toFixed(2)+'M','$'+gross.toFixed(2)+'B']))+
    '<p class="reading">Metformin filled about 31.2 million prescriptions for $628 million. Ozempic filled 6.93 million for $9.20 billion. People can fill more than one prescription in a year.</p>');
  const allowance = card('What Medicare allowed for CGM',
    '<p class="industry-caption">Average allowed amount per claim, July 2022–June 2023. The total includes Medicare and beneficiary contributions.</p>'+
    dataTable(['Billed item','FDA class II','FDA class III'],medicareDevices,'Medicare CGM claim payments by item and device class')+
    '<p class="reading">The receiver is a separate item. The monthly allowance bundles supplies such as sensors. These are historical Medicare prices.</p>');
  const outOfPocket = card('What people with type 1 paid',
    '<p class="industry-caption">Mean annual out-of-pocket spending on diabetes supplies and equipment. U.S. employer-insured people ages 1–64, 2018.</p>'+
    barList(patientBills,{max:1100,format:money})+
    '<p class="reading">People using both a pump and CGM spent an average of $1,037 on supplies over the year. The measure covers all their diabetes supplies, including testing supplies.</p>');
  const delivery = card('How insulin reaches the patient',
    explanatoryTable(['Delivery method','What delivers the dose','Recurring items'],[
      ['Injections','A syringe draws insulin from a vial. A pen lets the user dial a dose.','Insulin, syringes or pen needles and any replacement pen or cartridge.'],
      ['Conventional pump','A user-programmed pump delivers background insulin and mealtime doses.','Insulin and infusion sets with reservoirs, or disposable pods.'],
      ['Automated insulin delivery','A compatible sensor sends readings to a dosing algorithm that adjusts pump delivery.','Insulin, pump supplies and CGM sensors.']
    ],'Insulin delivery methods and recurring supplies')+
    '<p class="reading">The ADA estimated $22.4 billion for insulin and $4.2 billion for diabetes supplies in 2022. Its supply category includes meters, syringes and pumps. It does not isolate pump spending.</p>');
  const adoption = card('Who uses a sensor or pump',
    measures([['3.70M','U.S. CGM users'],['891,000','insulin pump users'],['740,000','people using both']])+
    '<p class="reading">These 2024 industry estimates count people using both technologies in each product total.</p>');
  const revenue = lineChart({...histories.devices, annual:true, title:'U.S. device sales at Dexcom and Insulet',
    note:'Dexcom then reported $969.8 million in U.S. revenue in Q3 2026, up from $851.9 million in Q3 2025.'});
  return heading('U.S. diabetes market')+marketAccounts()+treatmentAccounts()+pair(prescribing,drugSpending)+brands+glucosePrices()+
    pair(allowance,outOfPocket)+delivery+adoption+revenue+
    sourcesFooter([...marketAccountSources, ...treatmentAccountSources, ...glucosePriceSources,
      ['HHS · Hospital costs for lower-extremity amputation, table 6-3',ref.amputation],
      ['First-line glucose-lowering prescriptions in type 2 diabetes · Komodo claims, 2019–23',ref.first],
      ['Diabetes Care · U.S. glucose-lowering medication expenditure, 2000–22',ref.drugSpend],
      ['HHS Office of Inspector General · Part D prescriptions and gross spending, tables 2 and 4',ref.partDDrugs],
      ['Roche · Guide Me meter price',ref.meter],['Roche · Guide strip discount terms',ref.strips],
      ['Dexcom · Stelo one-time purchase price',ref.steloPrice],
      ['HHS Office of Inspector General · Medicare allowed amounts, exhibit 5',ref.oig],
      ['JAMA Internal Medicine · Household spending by device use, 2018',ref.oop],
      ['NIDDK · Insulin delivery methods',ref.treatment],['ADA · U.S. costs of diagnosed diabetes, table 4',ref.ada],
      ['Seagrove estimates cited by Modular Medical · U.S. device users, 2024',ref.marketEstimate],
      ['Dexcom · 2022 annual filing',links.dex22],['Dexcom · 2025 annual filing',links.dex25],
      ['Insulet · 2022 annual filing',links.omni22],['Insulet · 2024 annual filing',links.omni24],['Insulet · 2025 annual filing',links.omni25],
      ['Dexcom · U.S. Q3 2026 results',sources.dexrev.url]
    ],[...marketAccountNotes, ...treatmentAccountNotes, ...glucosePriceNotes,
      'The first-prescription study followed 964,914 adults with type 2 diabetes across the full study period. Its GLP-1 category includes dual GIP/GLP-1 agonist tirzepatide. The five displayed classes are selected examples. The separate national spending study includes all diabetes types. Its newer group includes amylin analogs and certain combinations, and its older group includes metformin and sulfonylureas. Spending shares round to 99.9%.',
      'The Medicare Part D audit counted dispensing by selected drug, across covered indications. Gross spending includes ingredient cost and dispensing fees before rebates and other price concessions. These figures quantify Medicare Part D rather than the full U.S. drug market.',
      'Manufacturer prices were checked November 17, 2026. The Roche coupon has eligibility exclusions. Medicare figures cover fee-for-service claims for two FDA device classes. Household figures are actual patient payments for supplies in a separate commercially insured type 1 cohort in 2018. The three price sources cover different products, populations and periods.',
      'The ADA cost model and the AHRQ survey use different populations and attribution methods. Company sales are U.S. geographic or product-line revenues. The user counts are third-party market estimates quoted in an investor presentation. These sources cannot establish total U.S. device revenue or manufacturer market share.'
    ]);
}

const accessRules = [
  ['Fingerstick monitoring','Part B may cover a prescribed home meter, test strips and lancets. Quantity limits depend on the patient’s circumstances.','A recurring strip supply can follow a different payment route from insulin.'],
  ['Continuous glucose monitoring','Part B may cover a prescribed CGM for a person with diabetes who uses insulin or has documented problematic hypoglycemia. The patient or caregiver needs training.','Under Original Medicare, the usual share is 20% of the approved amount after the Part B deductible. Supplemental coverage can change the patient’s bill.'],
  ['Insulin and pumps','Part B may cover a qualifying durable external pump and the insulin used with it. Part D plans cover formulary insulin for injections and may cover certain disposable pumps.','Each covered insulin product costs the beneficiary up to $35 per month with no insulin deductible. Pump hardware and sensors have their own payment rules.'],
  ['GLP-1 medicines','For type 2 diabetes, prescribers submit GLP-1 coverage requests to the patient’s Part D plan. The separate GLP-1 Bridge began July 1, 2026 for eligible weight-management use.','A medicine’s indication and the plan’s formulary determine the route. The Bridge has separate clinical and enrollment criteria.'],
  ['Prediabetes prevention','Part B covers the Medicare Diabetes Prevention Program when the patient meets glucose, BMI and medical-history criteria.','People who qualify pay $0 for coaching through an approved program.']
];

export function policyPage() {
  return heading('Public policy and access')+
    fdaTimeline()+
    '<nav class="coverage-paths" aria-label="Insurance coverage"><a href="#healthcare/public">Medicare and Medicaid coverage →</a><a href="#healthcare/private">Private coverage and prior approval →</a></nav>'+
    card('Which Medicare benefit pays',explanatoryTable(['Care or product','Coverage rule','What this means'],accessRules,'Medicare benefits for diabetes and prediabetes'))+
    pair(card('Medicare’s first negotiated prices',
      '<p class="industry-caption">Selected Part D products, effective January 1, 2026. CMS negotiated these prices for a 30-day equivalent supply.</p>'+
      dataTable(['Drug','Negotiated price'],[['Januvia (sitagliptin)','$113.00'],['Selected Fiasp / NovoLog insulin aspart products','$119.00'],['Farxiga (dapagliflozin)','$178.50'],['Jardiance (empagliflozin)','$197.00']])+
      '<p class="reading">The plan price and the amount charged to the beneficiary are separate figures.</p>'),
      card('How Medicaid coverage varies',
        '<p>All states cover outpatient prescription drugs for categorically eligible enrollees and most other enrollees. For devices, the state’s benefit and authorization rules shape access.</p>'+
        '<dl class="industry-defs"><dt>Kansas</dt><dd>Its approved plan added subcutaneous CGMs to the durable medical equipment benefit in January 2024. A treating practitioner must prescribe the device.</dd><dt>North Carolina</dt><dd>Its May 2025 policy routes therapeutic CGMs through the pharmacy benefit and refers providers to the state’s prior-approval criteria.</dd></dl>'))+
    sourcesFooter([...fdaSources,
      ['FDA · Dexcom G6 De Novo decision',milestones[3][4]],['FDA · Automated insulin dosing for type 2',milestones[8][4]],
      ['FDA · Original over-the-counter Stelo clearance','https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm?ID=K234070'],
      ['FDA · Stelo pediatric expansion',sources.stelo.url],['Medicare · CGM eligibility and coinsurance',ref.medicareCgm],
      ['Medicare · Insulin coverage and cost sharing',ref.medicareInsulin],['Medicare · Diabetes supplies and services',ref.medicareBook],
      ['CMS · Selected medicines and negotiated prices for 2026',ref.prices],['CMS · GLP-1 Bridge',ref.bridge],
      ['CMS · GLP-1 Bridge guidance for prescribers','https://www.cms.gov/files/document/glp-1-prescribers-c-1.pdf'],
      ['Medicare · Diabetes Prevention Program',ref.prevention],['Medicaid.gov · State outpatient drug programs',ref.medicaid],
      ['Kansas · Approved Medicaid state plan amendment 23-0045',ref.ks],['North Carolina · Coverage policy 5A-3',ref.nc]
    ],[...fdaNotes,
      'U.S. rules and sources checked November 17, 2026. Medicare cost sharing shown for Original Medicare assumes a participating provider or supplier who accepts assignment. A specific prescription, plan, supplier, clinical history and approved device combination may change coverage and a household’s payment.',
      'The two Medicaid examples illustrate different benefit routes. The 2026 CMS negotiated price is the maximum fair price for the selected product. The statutory monthly insulin limit is a beneficiary cost-sharing provision.'
    ]);
}

export function industryExportRows() {
  const rows = [
    ...marketAccountRows(), ...treatmentAccountRows(), ...glucosePriceRows(), ...fdaExportRows(),
    ...firstDrugs.flatMap(([drug,first,last])=>[['Jan 2022',first],['May 2023',last]].map(([date,v])=>
      ['Industry','First glucose-lowering medicine, type 2',drug+' / '+date,parseFloat(v),'% of first prescriptions in claims cohort',ref.first])),
    ...drugDollars.map(([name,v])=>['Industry','Glucose-lowering expenditure',name,v,'% of medication spending, U.S. adults with diabetes, 2022',ref.drugSpend]),
    ...partDBrands.flatMap(([name,fills,gross])=>[
      ['Industry','Part D prescription fills',name,fills,'millions of prescriptions, 2023',ref.partDDrugs],
      ['Industry','Part D gross spending',name,gross,'USD billions, 2023',ref.partDDrugs]]),
    ...medicareDevices.flatMap(([name,lower,upper])=>[['FDA class II',lower],['FDA class III',upper]].map(([group,amount])=>
      ['Industry',name,group,Number(amount.slice(1)),'average Medicare allowed USD per claim, Jul 2022–Jun 2023',ref.oig])),
    ...patientBills.map(([name,v])=>['Industry','Household out-of-pocket spending on diabetes supplies',name,v,'mean annual USD, commercially insured type 1, 2018',ref.oop]),
    ['Hospital care','Lower-limb amputation','Mean cost per eligible stay',30032,'hospital cost in USD, U.S. adults with diabetes, 2019',ref.amputation],
    ['Hospital care','Lower-limb amputation','Mean length of eligible stay',11.4,'days per stay, U.S. adults with diabetes, 2019',ref.amputation],
    ['Industry','ADA attributed supply spending','Diabetes supplies',4.232,'USD billions, 2022',ref.ada],
    ['Industry','ADA attributed insulin spending','Insulin',22.389,'USD billions, 2022',ref.ada],
    ...[['CGM',3700000],['Insulin pump',891000],['Both',740000]].map(([group,v])=>['Industry','U.S. device users',group,v,'industry estimate of people, 2024',ref.marketEstimate]),
    ...[['Januvia',113],['Selected Fiasp / NovoLog',119],['Farxiga',178.50],['Jardiance',197]].map(([name,v])=>
      ['Public policy','Part D negotiated price',name,v,'USD per 30-day equivalent, effective Jan 2026',ref.prices]),
    ...milestoneRows(), ...deviceExportRows()
  ];
  return rows;
}
