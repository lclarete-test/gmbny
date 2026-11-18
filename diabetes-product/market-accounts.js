import {escapeHTML} from './charts.js';

const sources = {
  ada: 'https://professional.diabetes.org/sites/default/files/media/cost_of_diabetes_2022.pdf',
  partD: 'https://data.cms.gov/sites/default/files/2026-06/98218f98-166c-4723-8438-c344a4ef96a6/DSD_PTD_RY26_P04_V10_DY24_BGM.csv',
  partDGuide: 'https://data.cms.gov/resources/medicare-part-d-spending-by-drug-data-dictionary',
  dme: 'https://data.cms.gov/sites/default/files/2026-07/d264f6fd-f327-4e54-9ab7-9132f1395b6b/mup_dme_ry26_p05_v10_dy24_geor.csv',
  practitioners: 'https://data.cms.gov/sites/default/files/2026-05/e534c74b-79b8-4892-8a95-5a17e2dfec9f/MUP_PHY_R26_P05_V10_D24_Geo.csv',
  insulin: 'https://www.fda.gov/media/168391/download',
  amputation: 'https://aspe.hhs.gov/sites/default/files/documents/b60f396f32e29a2a9469276d9ca80e4b/aspe-insulin-affordibility-rtc.pdf',
  abbott22: 'https://www.abbottinvestor.com/static-files/d502f92e-e4ec-49de-96ce-3a96c2513f54',
  abbott24: 'https://www.abbottinvestor.com/static-files/3dcb47ba-03c7-45df-88c0-5ca586292984',
  dexcom: 'https://www.sec.gov/Archives/edgar/data/1093557/000109355725000036/dxcm-20241231.htm',
  insulet: 'https://www.sec.gov/Archives/edgar/data/1145197/000114519725000007/podd-20241231.htm'
};

export const marketAccountSources = [
  ['American Diabetes Association · Attributable healthcare use, spending by service and productivity, tables 2–4 and 7–8', sources.ada],
  ['CMS · Medicare Part D Spending by Drug, product-level data through 2024 (CSV)', sources.partD],
  ['CMS · Part D spending definitions', sources.partDGuide],
  ['CMS · Medicare equipment and supplies by geography and service, 2024 (CSV)', sources.dme],
  ['CMS · Original Medicare practitioner allowances by service and setting, 2024 (CSV)', sources.practitioners],
  ['FDA · Insulin products by duration and delivery', sources.insulin],
  ['HHS · Cost and length of a hospital stay involving lower-limb amputation, table 6-3', sources.amputation],
  ['Abbott · Full-year U.S. Diabetes Care sales, 2022', sources.abbott22],
  ['Abbott · Full-year U.S. Diabetes Care sales, 2024', sources.abbott24],
  ['Dexcom · 2024 Form 10-K, U.S. revenue for 2022 and 2024', sources.dexcom],
  ['Insulet · 2024 Form 10-K, U.S. Omnipod revenue for 2022 and 2024', sources.insulet]
];

export const marketAccountNotes = [
  'The ADA models the additional cost attributable to diagnosed diabetes relative to expected spending without diabetes. Only its national 2022 accounts and their indented service lines partition the economic burden. The three direct branches total $306.6 billion to one decimal place. Each displayed branch is rounded independently. Published service lines can also differ from a subtotal by $1 million because of rounding. The total includes the economic value of lost work and premature death.',
  'Brand comparisons use the CMS Overall row for each specific product name and generic ingredient. Each column gives U.S. Medicare Part D gross spending in that calendar year, including plan, beneficiary and other payments before manufacturer rebates. Each row covers its named presentation and all covered uses. Other brands, generic products or package names may exist. These nominal dollars are independent comparisons and cannot be added to the ADA accounts. Spending changes can reflect price, volume and product substitution.',
  'Company figures are U.S. sales from separate financial disclosures. Abbott covers its Diabetes Care division including FreeStyle Libre, Dexcom reports U.S. company revenue and Insulet reports its U.S. Omnipod product line. Each covers multiple products. The figures do not isolate a single device model or provide a share of the ADA supplies estimate.',
  'Equipment examples use 2024 original Medicare fee-for-service national, nonrental lines. The mean allowed amount is per billed unit and includes any Medicare and patient liability. Shoe and insert codes are diabetes-specific. The prosthetic foot codes include several etiologies and equivalent products. The practitioner service examples also use 2024 national Medicare fee-for-service allowances, include all indications and reflect the listed place of service. Facility-based clinician fees cover only the professional service.',
  'The amputation example covers 87,270 U.S. adult non-maternal discharges meeting AHRQ’s PQI 16 indicator in 2019. The mean hospital cost covers the full qualifying stay. ADA table 7 reports days of lost productivity or attributable deaths, while table 8 assigns mortality costs by the underlying cause of death.'
];

// ADA amounts are USD millions. The two age columns are the published national partition.
const accounts = [
  {name:'Outpatient medicines and supplies', total:137005, hint:'Insulin, other prescriptions, monitoring and delivery supplies', services:[
    {id:'otherRx', name:'Other prescription medicines', total:84483, younger:20564, older:63919, detail:'Additional prescriptions used to manage conditions such as hypertension and high cholesterol.', activity:['Other prescriptions',671.9]},
    {id:'noninsulin', name:'Noninsulin glucose-lowering medicines', total:24709, younger:12637, older:12073, detail:'Tablets and injectable medicines to lower blood glucose.'},
    {id:'insulin', name:'Insulin', total:22389, younger:12484, older:9905, detail:'Products for background and mealtime insulin needs, including pens, vials and inhaled insulin.'},
    {id:'devices', name:'Diabetes supplies', total:4232, younger:2392, older:1840, detail:'Glucose meters, monitoring supplies, insulin pumps, syringes and lancets.'},
    {id:'equipment', name:'Other equipment and supplies', total:1192, younger:826, older:366, detail:'Orthopedic items, prostheses, eyewear, hearing devices and household aids.'}
  ]},
  {name:'Institutional care', total:105820, hint:'Hospitals, nursing facilities and hospice', services:[
    {id:'inpatient', name:'Hospital inpatient care', total:96182, younger:28520, older:67662, detail:'Inpatient hospital stays, including excess use for complications.', activity:['Inpatient days',32.4]},
    {id:'residential', name:'Nursing and residential facilities', total:9581, younger:3217, older:6363, detail:'Time receiving care in a nursing or residential facility.', activity:['Facility days',77.6]},
    {id:'hospice', name:'Hospice', total:57, younger:5, older:52, detail:'End-of-life hospice care.', activity:['Hospice days',0.3]}
  ]},
  {name:'Outpatient care', total:63742, hint:'Office and hospital visits, home health, transport and foot care', services:[
    {id:'office', name:'Office visits', total:33646, younger:8023, older:25622, detail:'Visits with physicians and other health professionals in an office.', activity:['Office visits',120.1]},
    {id:'outpatient', name:'Hospital outpatient visits', total:12114, younger:5787, older:6326, detail:'Hospital clinic services and procedures without an overnight admission.', activity:['Hospital outpatient visits',14.3]},
    {id:'ed', name:'Emergency department visits', total:11821, younger:4650, older:7171, detail:'Unscheduled emergency care.', activity:['Emergency visits',9.7]},
    {id:'home', name:'Home health', total:5591, younger:2184, older:3407, detail:'Services delivered in the home, including skilled nursing.', activity:['Home health visits',16.6]},
    {id:'podiatry', name:'Podiatry', total:363, younger:113, older:250, detail:'Foot evaluation and care by a podiatry professional.'},
    {id:'ambulance', name:'Ambulance services', total:208, younger:59, older:148, detail:'Medical transport associated with additional care needs.'}
  ]}
];
const productivity = [
  {name:'Lower productivity while at work',cost:35800,count:112700000,unit:'workday equivalents'},
  {name:'Premature death',cost:32400,count:339000,unit:'attributable deaths', causes:[
    ['Cardiovascular disease',15400,179000], ['Diabetes',13800,107000],
    ['Kidney disease',1800,28000], ['Cerebrovascular disease',1400,25000]
  ]},
  {name:'Lower employment due to disability',cost:28300,count:107200000,unit:'workday equivalents'},
  {name:'Missed work',cost:5400,count:17300000,unit:'workdays absent'},
  {name:'Lost productivity outside the labor force',cost:4400,count:15500000,unit:'days of productivity'}
];

// Exact annual gross spending, rounded to dollars, and 2024 prescription claims.
// [marketed presentation, ingredient, manufacturer, 2022 USD, 2024 USD, 2024 claims]
const brands = {
  basal: [
    ["Lantus SoloStar", "Insulin glargine", "Sanofi", 2873658630, 699132486, 5570732],
    ["Basaglar KwikPen U-100", "Insulin glargine", "Lilly", 706582384, 664629408, 1777659],
    ["Tresiba FlexTouch U-100", "Insulin degludec", "Novo Nordisk", 669375559, 825797918, 1281963],
    ["Humulin N", "NPH insulin, intermediate acting", "Lilly", 104432622, 40008424, 286710]
  ],
  mealtime: [
    ["Humalog KwikPen U-100", "Insulin lispro", "Lilly", 1100404540, 334334172, 1392033],
    ["NovoLog FlexPen", "Insulin aspart", "Novo Nordisk", 1839750388, 318913549, 1483591],
    ["Fiasp FlexTouch", "Fast-acting insulin aspart", "Novo Nordisk", 68499735, 289492211, 398663],
    ["Humulin R", "Regular human insulin, short acting", "Lilly", 55393432, 20223572, 207421]
  ],
  mixed: [
    ["Humulin 70/30 KwikPen", "Premixed NPH and regular insulin", "Lilly", 116027391, 41785571, 169848],
    ["Humalog Mix 75/25 KwikPen", "Premixed insulin lispro and lispro protamine", "Lilly", 226141891, 53030308, 157545]
  ],
  inhaled: [
    ["Afrezza", "Inhaled human insulin", "MannKind", 12896498, 26879300, 13165]
  ],
  glp1: [
    ["Ozempic", "Semaglutide", "Novo Nordisk", 4628160643, 12970296347, 10417182],
    ["Trulicity", "Dulaglutide", "Lilly", 6225291668, 5454134725, 4305141],
    ["Bydureon BCise", "Exenatide extended release", "AstraZeneca", 355078758, 215354678, 178931]
  ],
  dual: [
    ["Mounjaro", "Tirzepatide", "Lilly", 144035152, 6336942641, 5105397]
  ],
  oralGlp: [
    ["Rybelsus", "Semaglutide tablet", "Novo Nordisk", 974894470, 1890082026, 1251733]
  ],
  sglt2: [
    ["Jardiance", "Empagliflozin", "Boehringer Ingelheim", 5851720782, 11435997421, 11368280],
    ["Farxiga", "Dapagliflozin", "AstraZeneca", 2584621150, 5290548963, 5634650],
    ["Invokana", "Canagliflozin", "Janssen", 427366295, 272062235, 255843]
  ],
  tablets: [
    ["Januvia", "Sitagliptin, DPP-4 inhibitor", "Merck", 4097997365, 3807854662, 4027317],
    ["Metformin HCl", "Biguanide, immediate release", "Multiple manufacturers", 198864972, 188056768, 23961097],
    ["Metformin HCl ER", "Biguanide, extended release", "Multiple manufacturers", 92748574, 101464243, 10256666],
    ["Glipizide", "Sulfonylurea", "Multiple manufacturers", 43484430, 43179193, 4523542],
    ["Pioglitazone HCl", "Thiazolidinedione", "Multiple manufacturers", 55565154, 42374791, 3217957]
  ],
  vascular: [
    ["Lisinopril", "Blood pressure, ACE inhibitor", "Multiple manufacturers", 269169779, 252873551, 36247459],
    ["Zestril", "Lisinopril", "Almatica/Upsher-Smith", 4881184, 3106440, 2794],
    ["Atorvastatin calcium", "Cholesterol, statin", "Multiple manufacturers", 842193306, 756487579, 73349032],
    ["Lipitor", "Atorvastatin", "Pfizer/Viatris", 34489246, 26798187, 23269]
  ]
};

const drugFamilies = {
  insulin: [
    ['basal', 'Background insulin injections'],
    ['mealtime', 'Mealtime insulin injections'],
    ['mixed', 'Premixed insulin injections'],
    ['inhaled', 'Inhaled mealtime insulin']
  ],
  noninsulin: [
    ['glp1', 'Injectable GLP-1 receptor agonists'],
    ['dual', 'Dual GIP and GLP-1 injection'],
    ['oralGlp', 'Oral GLP-1 receptor agonist'],
    ['sglt2', 'Oral SGLT2 inhibitors'],
    ['tablets', 'Other glucose-lowering tablets']
  ],
  otherRx: [['vascular', 'Blood pressure and cholesterol medicines']]
};

// U.S. company disclosures, USD millions, 2022 and 2024.
const diabetesTechnology = [
  ['Abbott Diabetes Care', 'Diabetes Care division, including FreeStyle Libre', 1633, 2633, sources.abbott22, sources.abbott24],
  ['Dexcom', 'U.S. company revenue, including G6 and G7 systems', 2142, 2889.8, sources.dexcom, sources.dexcom],
  ['Insulet Omnipod', 'U.S. Omnipod product line, including DASH and Omnipod 5', 884.8, 1509.3, sources.insulet, sources.insulet]
];

// Original Medicare fee-for-service allowed dollars per nonrental unit, 2024.
const equipmentExamples = [
  ['Extra-depth diabetic shoe', 'A5500 · One fitted shoe', 86.15],
  ['Custom-molded diabetic shoe insert', 'A5513 · One insert', 52.34],
  ['Energy-storing prosthetic foot', 'L5976 · Seattle Carbon Copy II or equivalent, all indications', 737.74],
  ['Flex-walk prosthetic foot system', 'L5981 · Flex-walk system or equivalent, all indications', 3706.58]
];

// Medicare practitioner billing lines. The examples span all covered indications.
const servicePrices = {
  office: [
    ['Established office visit with low-complexity decision-making', '99213 · Nonfacility', 85.37],
    ['Hemoglobin A1c lab test', '83036 · Nonfacility', 9.49]
  ],
  outpatient: [['Low-complexity established visit, clinician fee', '99213 · Facility', 61.15]],
  ed: [['Emergency visit with moderate-complexity decision-making, clinician fee', '99284 · Facility', 114.81]],
  podiatry: [['Debridement of six or more nails', '11721 · Nonfacility', 43.86]],
  ambulance: [['Emergency basic life support transport', 'A0429 · Base service', 446.94]]
};

const usd = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', minimumFractionDigits:2, maximumFractionDigits:2});
function abbreviatedDollars(dollars, digits = 2) {
  const unit = dollars >= 1e9 ? [1e9, 'B'] : [1e6, 'M'];
  return '$' + Number((dollars / unit[0]).toFixed(digits)).toLocaleString('en-US', {maximumFractionDigits:digits}) + unit[1];
}
const millions = (value, digits) => abbreviatedDollars(value * 1e6, digits);
function compactCount(value) {
  return value >= 1e6 ? (value / 1e6).toLocaleString('en-US', {maximumFractionDigits:1}) + 'M' : value.toLocaleString('en-US');
}

function financialTable(label, headers, rows) {
  const headings = headers.map(name => '<th scope="col">' + escapeHTML(name) + '</th>').join('');
  const body = rows.map(([name, note, ...numbers]) => '<tr><th scope="row"><b>' + escapeHTML(name) + '</b>' +
    (note ? '<small>' + escapeHTML(note) + '</small>' : '') + '</th>' +
    numbers.map(value => '<td>' + escapeHTML(value) + '</td>').join('') + '</tr>').join('');
  return '<div class="ma-table"><table aria-label="' + escapeHTML(label) + '"><thead><tr>' + headings +
    '</tr></thead><tbody>' + body + '</tbody></table></div>';
}

function drugBreakdown(service) {
  const groups = drugFamilies[service.id];
  const collection = groups.map(([key, name], i) => {
    const data = brands[key].map(([brand, ingredient, manufacturer, y22, y24]) =>
      [brand, ingredient + ' · ' + manufacturer, abbreviatedDollars(y22), abbreviatedDollars(y24)]);
    return '<details class="ma-family"' + (i === 0 ? ' open' : '') + '><summary>' + escapeHTML(name) +
      '</summary>' + financialTable(name + ' gross Medicare Part D spending', ['Product', '2022', '2024'], data) + '</details>';
  }).join('');
  return '<div class="ma-examples"><p class="ma-basis"><b>Medicare Part D gross spending.</b> Selected products across covered uses, before rebates. These figures have a different scope from the national account above.</p>' +
    collection + '</div>';
}

function commercialExamples(id) {
  if (id === 'devices') {
    const data = diabetesTechnology.map(([company, products, y22, y24]) => [company, products, millions(y22), millions(y24)]);
    return '<div class="ma-examples"><p class="ma-basis"><b>U.S. manufacturer sales.</b> Each company reports the product line shown. These sales cover different payers and settings from the ADA account.</p>' +
      financialTable('U.S. manufacturer sales by reported product line', ['Company / product line', '2022', '2024'], data) + '</div>';
  }
  if (id === 'equipment') {
    const data = equipmentExamples.map(([name, code, amount]) => [name, code, usd.format(amount)]);
    return '<div class="ma-examples"><p class="ma-basis"><b>What Medicare allowed per item.</b> National 2024 averages include Medicare and patient liability.</p>' +
      financialTable('Medicare allowed amounts per billed equipment unit, 2024', ['Item', 'Per unit'], data) + '</div>';
  }
  if (id === 'inpatient') {
    return '<div class="ma-examples ma-inpatient"><b>$30,032</b><span>Mean hospital cost for a U.S. adult stay involving diabetes and lower-limb amputation in 2019. The average stay lasted <strong>11.4 days</strong>.</span></div>';
  }
  if (servicePrices[id]) {
    const data = servicePrices[id].map(([name, code, value]) => [name, code, usd.format(value)]);
    return '<div class="ma-examples"><p class="ma-basis"><b>Original Medicare allowance.</b> National 2024 average per billed service, across covered diagnoses.</p>' +
      financialTable('National original Medicare practitioner service allowance', ['Service', 'Per unit'], data) + '</div>';
  }
  return '';
}

function serviceLine(service) {
  const extra = drugFamilies[service.id] ? drugBreakdown(service) : commercialExamples(service.id);
  const row = '<span class="ma-service-name">' + escapeHTML(service.name) + '</span><strong class="ma-dollars">' + millions(service.total) + '</strong>';
  const activity = service.activity ? '<span class="ma-activity">' + compactCount(service.activity[1] * 1e6) +
    ' ' + escapeHTML(service.activity[0].toLowerCase()) + ' attributable to diabetes</span>' : '';
  const description = '<div class="ma-service-text">' + escapeHTML(service.detail) + activity + '</div>';
  return extra ? '<details class="ma-service ma-drill"><summary>' + row + '</summary>' + description + extra + '</details>' :
    '<div class="ma-service"><div class="ma-static">' + row + '</div>' + description + '</div>';
}

function costBranch(group) {
  const ages = group.services.map(s => [s.name, '', millions(s.younger), millions(s.older)]);
  return '<details class="ma-branch"><summary><span class="ma-branch-name">' + escapeHTML(group.name) +
    '<small>' + escapeHTML(group.hint) + '</small></span><strong class="ma-dollars">' + millions(group.total, 1) +
    '</strong></summary><div class="ma-children">' + group.services.map(serviceLine).join('') +
    '<details class="ma-age"><summary>Spending by age</summary>' +
    financialTable('National attributable spending by age for ' + group.name.toLowerCase(), ['Service', 'Under 65', '65+'], ages) +
    '</details></div></details>';
}

export function marketAccounts() {
  const lost = productivity.map(({name, cost, count, unit, causes}) => {
    const values = '<span><b>' + escapeHTML(name) + '</b><small>' + compactCount(count) + ' ' + escapeHTML(unit) +
      '</small></span><strong class="ma-dollars">' + millions(cost, 1) + '</strong>';
    if (!causes) return '<li>' + values + '</li>';
    const data = causes.map(([cause, dollars, deaths]) => [cause, '', compactCount(deaths), millions(dollars, 1)]);
    return '<li class="ma-mortality"><details><summary>' + values + '</summary>' +
      financialTable('Underlying cause of death and the value of lost productivity, U.S. 2022', ['Underlying cause', 'Deaths', 'Loss'], data) +
      '</details></li>';
  }).join('');
  return '<article class="panel market-accounts"><div class="ma-intro"><div><h2>The economic cost of living with diagnosed diabetes</h2>' +
    '<p>The ADA estimated the extra medical spending and lost productivity attributable to diabetes in the United States in 2022.</p></div><strong class="ma-total">$412.9B</strong></div>' +
    '<div class="ma-ruler" role="group" aria-label="Economic cost in 2022"><i role="button" tabindex="0" data-chart-label="Direct medical costs" data-chart-value="$306.6B · 74.3%" aria-label="Direct medical costs, $306.6 billion, 74.3%"></i><i role="button" tabindex="0" data-chart-label="Lost productivity" data-chart-value="$106.3B · 25.7%" aria-label="Lost productivity, $106.3 billion, 25.7%"></i></div>' +
    '<p class="ma-overlap">AHRQ measured <a href="#industry/market/treatment">$153.2B in annual treatment payments</a> in 2021–22. Some care appears in both estimates. The studies do not report how much of that $153.2B is included in the economic cost.</p>' +
    '<div class="ma-columns"><section class="ma-direct"><div class="ma-account-head"><span>Direct medical costs <small>74%</small></span><strong>$306.6B</strong></div>' +
    accounts.map(costBranch).join('') + '</section>' +
    '<section class="ma-indirect"><div class="ma-account-head"><span>Lost productivity <small>26%</small></span><strong>$106.3B</strong></div>' +
    '<ul>' + lost + '</ul></section></div></article>';
}

export function marketAccountRows() {
  const rows = [];
  const add = (name, group, value, unit, source = sources.ada) => rows.push(['Market accounts', name, group, value, unit, source]);
  const national = 'U.S. attributable economic burden, diagnosed diabetes, 2022';
  add('Total economic cost, published rounded estimate', national, 412900000000, 'USD');
  add('Direct medical costs', national, 306568000000, 'USD');
  add('Lost productivity', national, 106300000000, 'USD');
  for (const group of accounts) {
    add(group.name, national, group.total * 1e6, 'USD');
    for (const service of group.services) {
      add(service.name, group.name + ', all ages, 2022', service.total * 1e6, 'USD');
      add(service.name, group.name + ', age under 65, 2022', service.younger * 1e6, 'USD');
      add(service.name, group.name + ', age 65+, 2022', service.older * 1e6, 'USD');
      if (service.activity) add(service.activity[0], service.name + ', attributable utilization, 2022', service.activity[1] * 1e6, service.activity[0].toLowerCase());
      for (const [key, family] of drugFamilies[service.id] || []) {
        for (const [brand, ingredient, manufacturer, y22, y24, claims24] of brands[key]) {
          const label = family + ', ' + ingredient + ', ' + manufacturer + ', U.S. Medicare Part D, all covered uses';
          add(brand, label + ', 2022 gross spending', y22, 'USD before rebates', sources.partD);
          add(brand, label + ', 2024 gross spending', y24, 'USD before rebates', sources.partD);
          add(brand, label + ', 2024 claims', claims24, 'prescription claims', sources.partD);
        }
      }
    }
  }
  for (const {name, cost, count, unit, causes} of productivity) {
    add(name, 'Lost productivity attributable to diabetes, 2022', cost * 1e6, 'USD');
    add(name, 'Lost productivity attributable to diabetes, 2022', count, unit);
    for (const [cause, dollars, deaths] of causes || []) {
      add(cause, 'Premature mortality attributable to diabetes by underlying cause, 2022', dollars * 1e6, 'USD lost productivity');
      add(cause, 'Premature mortality attributable to diabetes by underlying cause, 2022', deaths, 'attributable deaths');
    }
  }
  for (const [company, products, y22, y24, src22, src24] of diabetesTechnology) {
    add(company, products + ', U.S. sales, 2022', Math.round(y22 * 1e6), 'USD company revenue', src22);
    add(company, products + ', U.S. sales, 2024', Math.round(y24 * 1e6), 'USD company revenue', src24);
  }
  for (const [name, code, amount] of equipmentExamples) add(name, code + ', national Medicare fee-for-service, 2024', amount, 'USD mean allowed per billed unit', sources.dme);
  for (const prices of Object.values(servicePrices)) {
    for (const [name, code, amount] of prices) add(name, code + ', national Medicare fee-for-service, 2024', amount, 'USD mean allowed per billed unit', sources.practitioners);
  }
  add('Hospital stay involving diabetes and lower-limb amputation', 'U.S. adults, AHRQ PQI 16, 2019', 30032, 'USD mean hospital cost per stay', sources.amputation);
  add('Hospital stay involving diabetes and lower-limb amputation', 'U.S. adults, AHRQ PQI 16, 2019', 11.4, 'mean length of stay in days', sources.amputation);
  return rows;
}
