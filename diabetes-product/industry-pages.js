import {barList, dataTable, escapeHTML, lineChart, measures, sourcesFooter} from './charts.js';
import {histories, links, milestones} from './evidence.js';
import {card, heading, pair} from './epidemiology.js';
import {products, sources} from './data.js';

const ref = {
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
  fdaMeter: 'https://www.fda.gov/medical-devices/in-vitro-diagnostics/blood-glucose-monitoring-devices',
  dash: 'https://www.omnipod.com/hcp/products/omnipod-dash-system',
  earlyInsulin: 'https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin',
  injection: 'https://americanhistory.si.edu/collections/object-groups/insulin-and-diabetes-management/insulin-injection',
  oral: 'https://www.si.edu/spotlight/insulin-and-diabetes-management/oral-diabetes-medications',
  glucose: 'https://www.si.edu/spotlight/insulin-and-diabetes-management/glucose-sugar-monitoring',
  firstCgm: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?ID=P980022',
  byetta: 'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2009/021919s000MedR.pdf',
  sglt2: 'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2014/202293Orig1s000MedR.pdf',
  pumpHistory: 'https://www.acponline.org/sites/default/files/documents/about_acp/chapters/sc/22mtg/diabetes_technology_-_handout_1.pdf',
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

const services = [
  ['Prescribed medicines', 80.3], ['Office visits', 10.3], ['Home health', 5.0],
  ['Inpatient stays', 2.4], ['Hospital outpatient visits', 1.7], ['Emergency visits', 0.3]
];
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

function productLinks(value) {
  const names = {'FreeStyle Libre 3 Plus':'libre','G7 15 Day':'g7','Omnipod 5':'omni','Control-IQ+':'tandem','MiniMed 780G':'med','Stelo':'stelo'};
  return escapeHTML(value).replace(/FreeStyle Libre 3 Plus|G7 15 Day|Omnipod 5|Control-IQ\+|MiniMed 780G|Stelo/g,
    name=>`<a href="#industry/products" data-catalog-item="${names[name]}">${name}</a>`);
}
function explanatoryTable(headers, rows, label, format=escapeHTML) {
  return `<div class="industry-prose-table"><table aria-label="${escapeHTML(label)}"><thead><tr>${headers.map(h=>`<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(([k,...cells])=>`<tr><th scope="row">${format(k)}</th>${cells.map((c,i)=>`<td data-column="${escapeHTML(headers[i+1])}">${format(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function marketOverview() {
  const spending = card('Where the treatment dollar goes',
    `<div class="measure-call"><b>$153.2B</b><p>U.S. annual payments for care linked to diabetes, averaged across 2021–22. Of this, about <strong>$123.0 billion</strong> paid for prescribed medicines.</p></div>${barList(services)}<p class="reading">The survey links visits and prescriptions to diabetes, including recorded complications. Separate equipment purchases fall outside this total. It cannot tell us the size of the device market.</p>`);
  const prescribing = card('Which medicines people started',
    '<p class="industry-caption">Share of first glucose-lowering prescriptions in a U.S. claims study of adults with type 2 diabetes.</p>'+
    dataTable(['Drug family','Jan 2022','May 2023'],firstDrugs,'First-line use in adults with type 2 diabetes')+
    '<p class="reading">Metformin remained the most common first medicine. In just 16 months, the share starting a GLP-1 therapy tripled.</p>');
  const drugSpending = card('Which medicines captured spending',
    '<p class="industry-caption">Share of U.S. glucose-lowering medication spending among adults with diabetes, 2022.</p>'+barList(drugDollars)+
    '<p class="reading">Newer noninsulin drugs include GLP-1, SGLT2 and DPP-4 therapies. Average annual drug spending per adult rose from $856 in 2000 to $3,725 in 2022, in constant 2022 dollars.</p>');
  const brands = card('Prescriptions and spending in the same market',
    '<p class="industry-caption">Selected drugs billed to Medicare Part D in 2023. Both columns cover the same payer and calendar year.</p>'+
    dataTable(['Drug','Prescription fills','Gross spending'],partDBrands.map(([name,fills,gross])=>[name,fills.toFixed(2)+'M','$'+gross.toFixed(2)+'B']))+
    '<p class="reading">Metformin filled about 31.2 million prescriptions for $628 million. Ozempic filled 6.93 million for $9.20 billion. People can fill more than one prescription in a year.</p>');
  const monitoring = card('What it costs to measure glucose',
    explanatoryTable(['Purchase','Published U.S. price','What that buys'],[
      ['Fingerstick meter','$14.99','One Accu-Chek Guide Me meter. Each test uses a compatible strip and a lancet.'],
      ['Test strips','$19.99','First 50 Guide strips with the manufacturer’s eligible pharmacy coupon. About $0.40 per test before lancets.'],
      ['Over-the-counter CGM','$99','Two Stelo sensors in a one-time adult purchase, for up to 30 days of readings.']
    ],'Examples of prices posted by manufacturers')+
    '<p class="reading">A meter can be reused. Strips and wearable sensors are recurring purchases, so the number of tests or days worn changes the annual bill.</p>');
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
  return heading('U.S. diabetes market')+spending+pair(prescribing,drugSpending)+brands+monitoring+
    pair(allowance,outOfPocket)+delivery+adoption+revenue+
    sourcesFooter([
      ['AHRQ · Diabetes treatment expenditure, 2021–22',ref.meps],
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
    ],[
      'MEPS covers U.S. civilian noninstitutionalized adults age 18+. AHRQ averaged 26.3 million adults treated per year. It counted six categories of actual payments where diabetes was recorded as the reason for care or identified during care. It omitted the separate category for other medical equipment and services. The prescribed-medicine dollar estimate is 80.3% of $153.2 billion, rounded.',
      'The first-prescription study followed 964,914 adults with type 2 diabetes across the full study period. Its GLP-1 category includes dual GIP/GLP-1 agonist tirzepatide. The five displayed classes are selected examples. The separate national spending study includes all diabetes types. Its newer group includes amylin analogs and certain combinations, and its older group includes metformin and sulfonylureas. Spending shares round to 99.9%.',
      'The Medicare Part D audit counted dispensing by selected drug, across covered indications. Gross spending includes ingredient cost and dispensing fees before rebates and other price concessions. These figures quantify Medicare Part D rather than the full U.S. drug market.',
      'Manufacturer prices were checked November 17, 2026. The Roche coupon has eligibility exclusions. Medicare figures cover fee-for-service claims for two FDA device classes. Household figures are actual patient payments for supplies in a separate commercially insured type 1 cohort in 2018. The three price sources cover different products, populations and periods.',
      'The ADA cost model and the AHRQ survey use different populations and attribution methods. Company sales are U.S. geographic or product-line revenues. The user counts are third-party market estimates quoted in an investor presentation. These sources cannot establish total U.S. device revenue or manufacturer market share.'
    ]);
}

const eras = [
  ['1921–23', 'Insulin was discovered in 1921 and first used to treat a patient in Toronto in 1922. U.S. distribution expanded in 1923. Insulin could replace the hormone missing in type 1 diabetes.', 'Patients drew insulin from a vial into a reusable syringe. Urine tests were an early way to check for excess glucose.'],
  ['1950s–60s', 'Sulfonylurea tablets gave people with type 2 diabetes a way to stimulate their own insulin production.', 'Disposable syringes reduced the work of sterilizing and reusing needles. Urine test strips simplified testing at home.'],
  ['1970s–80s', 'In 1982 the FDA approved Humulin. Recombinant technology made human insulin available at scale.', 'Meters and blood test strips brought a glucose reading into the home. Portable pumps supplied insulin continuously. Pens made injections easier to carry and measure.'],
  ['1990s', 'The FDA approved metformin for type 2 diabetes in 1994 and rapid-acting insulin lispro in 1996. The latter offered an insulin option for mealtimes.', 'In 1999 the MiniMed CGMS recorded glucose between fingersticks. Clinicians could download the sensor history to see excursions that spot checks missed.'],
  ['2005–13', 'Exenatide introduced injectable GLP-1 therapy for type 2 diabetes in 2005. Canagliflozin, approved in 2013, lowers glucose by increasing urinary glucose excretion.', 'Personal sensors began giving users real-time readings and alarms. The measurement could inform an action while glucose was changing.'],
  ['2016–19', 'In 2019 oral semaglutide brought a GLP-1 therapy for type 2 diabetes into tablet form.', 'The MiniMed 670G reached the U.S. market in 2017 with automated basal adjustment. In 2018 the FDA granted De Novo classification to Dexcom G6, opening an interoperable CGM category.'],
  ['2022–24', 'Tirzepatide, approved in 2022 for adults with type 2 diabetes, acts on both the GIP and GLP-1 receptors.', 'Omnipod 5 reached U.S. pharmacies in 2022 and gained an adult type 2 indication in 2024. In 2024 Stelo launched over the counter for adults who do not use insulin, and Abbott introduced the 15-day FreeStyle Libre 3 Plus.'],
  ['2025–26', 'In 2026 the FDA approved once-weekly basal insulin icodec for adults with type 2 diabetes. In October the indication expanded to children ages 10 and up with type 2.', 'In 2025 Dexcom launched G7 15 Day, Tandem launched Control-IQ+ and MiniMed 780G gained an adult type 2 indication. In June 2026 Stelo clearance expanded to ages 2+ without insulin use, with adult supervision for children.']
];

export function productEvolution() {
  return heading('How diabetes products evolved')+
    '<p class="industry-lead">Insulin changed what clinicians could treat. Home testing changed what patients could see. Connecting sensors to pumps made it possible to adjust insulin delivery between visits.</p>'+
    `<section class="panel">${explanatoryTable(['Era','Medicines and treatment','Measurement and delivery'],eras,'U.S. diabetes treatment and device milestones by era',productLinks)}</section>`+
    sourcesFooter([
      ['FDA · The discovery, scale-up and development of insulin',ref.earlyInsulin],
      ['Smithsonian · Insulin injections and pens',ref.injection],['Smithsonian · Oral medicines',ref.oral],
      ['Smithsonian · Home glucose testing',ref.glucose],['American College of Physicians · History of diabetes technology',ref.pumpHistory],
      ['FDA · Original U.S. approval date for metformin','https://www.accessdata.fda.gov/drugsatfda_docs/nda/98/020357s010_appltr_medr_chemr_EA.pdf'],
      ['FDA · Original MiniMed continuous glucose monitoring system',ref.firstCgm],
      ['FDA · Exenatide clinical review',ref.byetta],['FDA · U.S. SGLT2 approvals',ref.sglt2],
      ['FDA · Real-time glucose monitoring with alarms, 2005','https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P980022S011'],
      ['Abbott · 2024 annual report, Libre Plus launches','https://www.sec.gov/Archives/edgar/data/1800/000130817925000136/abt012575-ars.pdf'],
      ['Dexcom · G7 15 Day U.S. launch','https://investors.dexcom.com/news/news-details/2025/Dexcom-G7-15-Day-Continuous-Glucose-Monitoring-System-to-Launch-on-Dec--1-in-the-United-States/default.aspx'],
      ['FDA · 2026 prescribing information for weekly basal insulin icodec','https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/761326s001lbl.pdf'],
      ...milestones.slice(2).map(([year,name,, ,url])=>[`${name} · ${year}`,url]),
      ['Tandem · Control-IQ+ U.S. launch',sources.tandem.url],['FDA · MiniMed 780G indication',sources.med.url],
      ['FDA · Stelo pediatric indication',sources.stelo.url]
    ],[
      'The timeline distinguishes commercial availability, regulatory action and reimbursement. De Novo is the FDA pathway that established a new device classification for the interoperable G6. Device eligibility depends on the model and authorized combination.'
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
    '<p class="industry-lead">The FDA sets the population and intended use on the label. Medicare and state Medicaid programs decide which benefit pays and under what conditions. A sensor can therefore be available over the counter while a covered prescription sensor has clinical eligibility rules.</p>'+
    card('What FDA authorization permits',explanatoryTable(['Product','U.S. decision','Who gained access'],[
      ['Dexcom G6 · 2018','De Novo classification for an interoperable continuous glucose monitor.','Compatible devices could share readings, subject to their individual labels.'],
      ['Omnipod 5 · 2024','The FDA cleared the first automated insulin dosing system indicated for type 2 diabetes.','Eligible adults with type 2 gained a labeled automated delivery option.'],
      ['Stelo · 2024 and 2026','Initially cleared over the counter for adults who do not use insulin. In June 2026 the FDA expanded the indicated age to 2+.','Children require adult supervision. The label excludes insulin users, people on dialysis and people with problematic hypoglycemia.']
    ],'Federal device decisions and indications'))+
    card('Which Medicare benefit pays',explanatoryTable(['Care or product','Coverage rule','What this means'],accessRules,'Medicare benefits for diabetes and prediabetes'))+
    pair(card('Medicare’s first negotiated prices',
      '<p class="industry-caption">Selected Part D products, effective January 1, 2026. CMS negotiated these prices for a 30-day equivalent supply.</p>'+
      dataTable(['Drug','Negotiated price'],[['Januvia (sitagliptin)','$113.00'],['Selected Fiasp / NovoLog insulin aspart products','$119.00'],['Farxiga (dapagliflozin)','$178.50'],['Jardiance (empagliflozin)','$197.00']])+
      '<p class="reading">The plan price and the amount charged to the beneficiary are separate figures.</p>'),
      card('How Medicaid coverage varies',
        '<p>All states cover outpatient prescription drugs for categorically eligible enrollees and most other enrollees. For devices, the state’s benefit and authorization rules shape access.</p>'+
        '<dl class="industry-defs"><dt>Kansas</dt><dd>Its approved plan added subcutaneous CGMs to the durable medical equipment benefit in January 2024. A treating practitioner must prescribe the device.</dd><dt>North Carolina</dt><dd>Its May 2025 policy routes therapeutic CGMs through the pharmacy benefit and refers providers to the state’s prior-approval criteria.</dd></dl>'))+
    sourcesFooter([
      ['FDA · Dexcom G6 De Novo decision',milestones[3][4]],['FDA · Automated insulin dosing for type 2',milestones[8][4]],
      ['FDA · Original over-the-counter Stelo clearance','https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm?ID=K234070'],
      ['FDA · Stelo pediatric expansion',sources.stelo.url],['Medicare · CGM eligibility and coinsurance',ref.medicareCgm],
      ['Medicare · Insulin coverage and cost sharing',ref.medicareInsulin],['Medicare · Diabetes supplies and services',ref.medicareBook],
      ['CMS · Selected medicines and negotiated prices for 2026',ref.prices],['CMS · GLP-1 Bridge',ref.bridge],
      ['CMS · GLP-1 Bridge guidance for prescribers','https://www.cms.gov/files/document/glp-1-prescribers-c-1.pdf'],
      ['Medicare · Diabetes Prevention Program',ref.prevention],['Medicaid.gov · State outpatient drug programs',ref.medicaid],
      ['Kansas · Approved Medicaid state plan amendment 23-0045',ref.ks],['North Carolina · Coverage policy 5A-3',ref.nc]
    ],[
      'U.S. rules and sources checked November 17, 2026. Medicare cost sharing shown for Original Medicare assumes a participating provider or supplier who accepts assignment. A specific prescription, plan, supplier, clinical history and approved device combination may change coverage and a household’s payment.',
      'The two Medicaid examples illustrate different benefit routes. The 2026 CMS negotiated price is the maximum fair price for the selected product. The statutory monthly insulin limit is a beneficiary cost-sharing provision.'
    ]);
}

const categoryNames = {
  meter: 'Fingerstick meter and strips', rx: 'Prescription CGM', otc: 'Over-the-counter CGM',
  syringe: 'Vial and syringe', pen: 'Insulin pen', pump: 'Conventional pump', AID: 'Automated insulin delivery'
};
const namedProducts = products.map(p=>{
  const family = p.cat === 'CGM' ? (p.id === 'stelo' ? 'otc' : 'rx') : 'AID';
  const roles = {
    g7: 'A wearable sensor sends readings to a compatible display. Selected pump combinations can use its readings to adjust insulin.',
    libre: 'A sensor provides a glucose reading every minute. Certain compatible systems can use the readings for automated delivery.',
    stelo: 'A wearable sensor shows glucose trends in an app. The label excludes use with insulin, dialysis or problematic hypoglycemia.',
    omni: 'A tubeless disposable pod adjusts insulin delivery with readings from a compatible sensor.',
    tandem: 'Control-IQ+ software adjusts insulin delivery on compatible Tandem pumps using sensor readings and predicted glucose.',
    med: 'A pump and compatible sensor work together to adjust basal insulin and deliver automatic correction doses.'
  };
  return {...p,family,url:sources[p.source].url,use:roles[p.id] || p.use,
    type:p.id === 'libre' ? [...p.type,'gest'] : p.type,
    audience:p.id === 'libre' ? 'Age 2+ with diabetes, including type 1, type 2 and gestational diabetes.'
      : p.id === 'stelo' ? 'Age 2+ without insulin use. An adult must supervise use by children.' : p.audience};
});
const insulinLabel = 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/020563s214%2C205747s038lbl.pdf';
const meterProduct = {
  id:'guide',name:'Accu-Chek Guide Me',brand:'Roche',family:'meter',type:['t1','t2','gest'],
  audience:'People measuring capillary blood glucose at home.',access:'Available over the counter',
  wear:'Reusable meter and single-use strips',use:'A fingerstick sample on a compatible Guide strip gives one blood glucose reading.',
  url:ref.meter
};
const injectionProducts = [
  {id:'vial',name:'Humalog U-100 vial and syringe',brand:'Lilly',family:'syringe',type:['t1','t2'],
    audience:'Adults and children with diabetes who need this rapid-acting insulin.',access:'Prescription insulin',
    wear:'Vial and separate U-100 insulin syringes',use:'The insulin is drawn from a vial into a syringe for a manually administered injection.',
    url:insulinLabel},
  {id:'pen',name:'Humalog U-100 KwikPen',brand:'Lilly',family:'pen',type:['t1','t2'],
    audience:'Adults and children with diabetes who need this rapid-acting insulin.',access:'Prescription insulin',
    wear:'Prefilled disposable pen and pen needles',use:'The pen holds the same insulin formulation as the U-100 vial and lets the user dial each dose.',
    url:insulinLabel},
  {id:'dash',name:'Omnipod DASH',brand:'Insulet',family:'pump',type:['t1','t2'],
    audience:'People with insulin-requiring diabetes.',access:'Prescription',
    wear:'Disposable tubeless pod, up to 72 hours',use:'A handheld controller programs basal and mealtime insulin. The user enters glucose information manually.',
    url:ref.dash}
];
export const catalogProducts = [
  meterProduct,...namedProducts.filter(p=>p.cat==='CGM'),...injectionProducts,...namedProducts.filter(p=>p.cat==='AID')
];
const categoryOptions = [
  ['all','All device families'],['meter','Fingerstick meters and strips'],['CGM','All continuous monitors'],
  ['rx','Prescription CGMs'],['otc','Over-the-counter CGMs'],['syringe','Vials and syringes'],
  ['pen','Insulin pens'],['pump','Conventional pumps'],['AID','Automated insulin delivery']
];
const populationOptions = [
  ['all','All populations'],['t1','Type 1 diabetes'],['t2','Type 2 diabetes'],['gest','Gestational diabetes'],['pre','Prediabetes']
];

function options(items,selected) {
  return items.map(([id,label])=>`<option value="${id}"${id===selected?' selected':''}>${escapeHTML(label)}</option>`).join('');
}

export function catalogPage(view={}) {
  const search = view.search || '';
  const category = view.category || 'all', population = view.deviceType || 'all';
  const matches = catalogProducts.filter(p=>{
    const matchCategory = category === 'all' || category === p.family || (category === 'CGM' && p.cat === 'CGM');
    const searchable = [p.name,p.brand,categoryNames[p.family],p.audience,p.use,p.wear,p.access].join(' ').toLowerCase();
    return matchCategory && (population === 'all' || p.type.includes(population)) && searchable.includes(search.trim().toLowerCase());
  });
  const cards = matches.map(p=>`<article class="product-card" id="catalog-${p.id}">
    <span class="product-maker">${escapeHTML(p.brand)} · ${escapeHTML(categoryNames[p.family])}</span><h2>${escapeHTML(p.name)}</h2>
    <p>${escapeHTML(p.use)}</p><p class="industry-product-patient">${escapeHTML(p.audience)}</p>
    <dl class="industry-product-defs"><div><dt>Access</dt><dd>${escapeHTML(p.access)}</dd></div><div><dt>Format</dt><dd>${escapeHTML(p.wear)}</dd></div></dl>
    <label><input type="checkbox" data-compare="${p.id}" ${view.selected?.has(p.id)?'checked':''}> Compare product</label></article>`).join('');
  return heading('Devices and products')+
    '<p class="industry-lead">Meters and sensors measure glucose. Syringes, pens and pumps deliver insulin. An automated system connects a compatible sensor, pump and dosing algorithm.</p>'+
    `<div class="catalog-filters"><label>Find a product<input id="product-search" type="search" value="${escapeHTML(search)}" placeholder="Name, manufacturer or device"></label>
    <label>Device family<select id="category">${options(categoryOptions,category)}</select></label>
    <label>Population<select id="device-type">${options(populationOptions,population)}</select></label></div>
    <div class="product-grid">${cards||'<p class="empty" role="status">No products match these filters.</p>'}</div>`+
    sourcesFooter([
      ['FDA · Meter, strips and blood samples',ref.fdaMeter],['Roche · Accu-Chek Guide Me',ref.meter],
      ...namedProducts.map(p=>[p.brand+' · '+p.name,p.url]),
      ['Abbott · Libre 3 system indications and sensor specifications','https://payer.freestyle.abbott/content/dam/adc/freestylepayer/us/us-en/Leave%20Behind%2C%20FSL3%20Formulary%20Kit%2C%20Market%20Access%2C%20April%202025.pdf'],
      ['FDA · Humalog vials and pens',insulinLabel],['Insulet · Omnipod DASH',ref.dash],['NIDDK · Insulin delivery methods',ref.treatment]
    ],[
      'Selected U.S. product examples, checked November 17, 2026. The population filter uses the cited product labeling and examples. The prediabetes filter identifies an over-the-counter tracking option for eligible people without insulin use. Diabetes and prediabetes are diagnosed with laboratory testing.',
      'Automated delivery requires an authorized combination of software, pump and sensor. A prescription or an over-the-counter indication alone does not establish insurance coverage.'
    ]);
}

export function compareCatalog(ids) {
  const selected = ids instanceof Set ? ids : new Set(ids);
  const selectedProducts = catalogProducts.filter(p=>selected.has(p.id)).slice(0,3);
  const fields = [['Manufacturer','brand'],['Device family','family'],['Who can use it','audience'],['Access','access'],['Format and supplies','wear'],['Role','use']];
  return '<h2>Compare products</h2>'+explanatoryTable(['Feature',...selectedProducts.map(p=>p.name)],
    fields.map(([label,key])=>[label,...selectedProducts.map(p=>key==='family'?categoryNames[p.family]:p[key])]),
    'Selected diabetes products compared by feature');
}

export function industryExportRows() {
  const rows = [
    ...services.map(([name,v])=>['Industry','Diabetes-linked service payments',name,v,'% of annual treatment expenditure, 2021–22',ref.meps]),
    ['Industry','Diabetes-linked treatment','All included services',153.2,'estimated annual USD billions, 2021–22',ref.meps],
    ['Industry','Diabetes-linked treatment','Prescribed medicines',123.0,'calculated annual USD billions, 2021–22',ref.meps],
    ...firstDrugs.flatMap(([drug,first,last])=>[['Jan 2022',first],['May 2023',last]].map(([date,v])=>
      ['Industry','First glucose-lowering medicine, type 2',drug+' / '+date,parseFloat(v),'% of first prescriptions in claims cohort',ref.first])),
    ...drugDollars.map(([name,v])=>['Industry','Glucose-lowering expenditure',name,v,'% of medication spending, U.S. adults with diabetes, 2022',ref.drugSpend]),
    ...partDBrands.flatMap(([name,fills,gross])=>[
      ['Industry','Part D prescription fills',name,fills,'millions of prescriptions, 2023',ref.partDDrugs],
      ['Industry','Part D gross spending',name,gross,'USD billions, 2023',ref.partDDrugs]]),
    ...medicareDevices.flatMap(([name,lower,upper])=>[['FDA class II',lower],['FDA class III',upper]].map(([group,amount])=>
      ['Industry',name,group,Number(amount.slice(1)),'average Medicare allowed USD per claim, Jul 2022–Jun 2023',ref.oig])),
    ...patientBills.map(([name,v])=>['Industry','Household out-of-pocket spending on diabetes supplies',name,v,'mean annual USD, commercially insured type 1, 2018',ref.oop]),
    ['Industry','Accu-Chek Guide Me','One retail meter',14.99,'example USD, Nov 2026',ref.meter],
    ['Industry','Accu-Chek Guide strips','First 50 with an eligible coupon',19.99,'example USD, Nov 2026',ref.strips],
    ['Industry','Stelo adult retail','Two sensors, one-time purchase',99,'example USD, Nov 2026',ref.steloPrice],
    ['Industry','ADA attributed supply spending','Diabetes supplies',4.232,'USD billions, 2022',ref.ada],
    ['Industry','ADA attributed insulin spending','Insulin',22.389,'USD billions, 2022',ref.ada],
    ...[['CGM',3700000],['Insulin pump',891000],['Both',740000]].map(([group,v])=>['Industry','U.S. device users',group,v,'industry estimate of people, 2024',ref.marketEstimate]),
    ...[['Januvia',113],['Selected Fiasp / NovoLog',119],['Farxiga',178.50],['Jardiance',197]].map(([name,v])=>
      ['Public policy','Part D negotiated price',name,v,'USD per 30-day equivalent, effective Jan 2026',ref.prices]),
    ...catalogProducts.map(p=>['Device catalog',p.name,categoryNames[p.family],p.access,p.audience,p.url])
  ];
  return rows;
}
