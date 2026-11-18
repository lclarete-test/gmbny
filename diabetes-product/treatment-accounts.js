import {chartMark, escapeHTML} from './charts.js';
import {serviceData} from './treatment-service-data.js';
import {
  treatmentDrugGroups, treatmentDrugNotes, treatmentDrugRows, treatmentDrugSources, treatmentDrugTotal
} from './treatment-drugs.js';

const brief = 'https://meps.ahrq.gov/data_files/publications/st568/stat568.shtml';
const dataFile = code => 'https://meps.ahrq.gov/data_stats/download_data_files_detail.jsp?cboPufNumber=HC-' + code;
const variable = (file, name) =>
  'https://meps.ahrq.gov/mepsweb/data_stats/download_data_files_codebook.jsp?PUFId=H' + file + '&varName=' + name;
const script = 'analysis/treatment_services.py';
const period = 'U.S. adults treated for diabetes, annual average 2021–22';
const dollars = n => '$' + n.toLocaleString('en-US');
const millions = n => (n / 1e6).toFixed(1) + 'M';
const percent = n => n.toFixed(1) + '%';

function annualAmount(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  return '$' + Math.round(n / 1e6).toLocaleString('en-US') + 'M';
}

// Shares, service use, person-level mean and median come from AHRQ figures 3–5.
// Annual dollars at both service and product levels are weighted public-file estimates.
const services = [
  {
    key: 'prescriptions', name: 'Prescribed medicines', short: 'Insulins, other medicines and prescription supplies',
    share: 80.3, use: 95.9, mean: 4870, median: 1100,
    description: 'New prescriptions and refills linked to diabetes, including supplies recorded in the prescription survey.'
  },
  {
    key: 'office', name: 'Office-based visits', short: 'Primary care, endocrinology and other clinicians',
    share: 10.3, use: 59.5, mean: 1010, median: 370,
    description: 'Payments for office and clinic visits, including telehealth. Each visit is grouped by the physician specialty recorded.'
  },
  {
    key: 'home', name: 'Home health services', short: 'Agencies and independent home health workers',
    share: 5.0, use: 3.1, mean: 9500, median: 5120,
    description: 'Health plans and families paid for care delivered in the home by agencies and self-employed providers.'
  },
  {
    key: 'inpatient', name: 'Inpatient hospital stays', short: 'Hospital facilities and physician bills',
    share: 2.4, use: 0.9, mean: 15380, median: 9870,
    description: 'The facility payment covers the room, diagnostic tests and laboratory services on the hospital bill. Physicians can bill separately.'
  },
  {
    key: 'outpatient', name: 'Hospital outpatient visits', short: 'Hospital department care without an admission',
    share: 1.7, use: 10.8, mean: 890, median: 330,
    description: 'Hospital outpatient departments provide care without admitting the patient. They can bill facility and physician services separately, including for telehealth.'
  },
  {
    key: 'emergency', name: 'Emergency department visits', short: 'Emergency facility and professional fees',
    share: 0.3, use: 1.9, mean: 970, median: 420,
    description: 'Emergency department bills cover the facility and separately billed physicians. Emergency care billed as part of a hospital stay appears under inpatient care.'
  }
];

export const treatmentAccountSources = [
  ...treatmentDrugSources,
  ['AHRQ · 2021 event-to-condition linkage', dataFile('229I')],
  ['AHRQ · 2022 event-to-condition linkage', dataFile('239I')],
  ['AHRQ · Office medical visits and clinician specialties', dataFile('239G')],
  ['AHRQ · Home health provider categories', dataFile('239H')],
  ['AHRQ · Inpatient facility and physician payment files', dataFile('239D')],
  ['AHRQ · Hospital outpatient payment files', dataFile('239F')],
  ['AHRQ · Emergency department payment files', dataFile('239E')],
  ['AHRQ · Office visit laboratory-test question', variable('239G', 'LABTEST_M18')],
  ['AHRQ · Hospital outpatient laboratory-test question', variable('239F', 'LABTEST_M18')],
  ['Reproduce the annual service and provider payment estimates', script]
];

export const treatmentAccountNotes = [
  'AHRQ’s Medical Expenditure Panel Survey covers civilian adults age 18 and older living outside institutions. For each year, diabetes was the reported reason for the service or was identified during it. AHRQ counted the entire payment when several conditions shared one event. It excluded treatment solely for complications or other conditions. Separately purchased equipment and productivity losses are outside this account. Pharmacy supplies reported in the prescription survey can appear within prescribed medicines.',
  'Figure 5 of AHRQ Statistical Brief 568 supplies the service shares. Figures 3 and 4 supply the share of treated adults using each service and the mean and median annual payments per user, rounded to the nearest $10. One adult may use several services. All amounts represent payments from all sources in 2022 dollars.',
  'The national dollar amounts for each service and provider group are weighted estimates from the 2021 and 2022 public event files, linked once per event. The annual totals recover the published $153.2 billion to its reported precision. The service profile and drug files use the same adult population, two-year averaging and health-price adjustment. Figures may differ slightly when independently rounded.',
  'The office categories describe the clinician recorded for each visit. Visits without a separately identified physician specialty include care by other professionals. Hospital facility and physician amounts follow their separate payment fields. Provider subdivisions with fewer than 30 contributing respondents or a relative standard error above 30% are withheld. The CSV includes design-based standard errors and contributing sample counts for released provider estimates.',
  'The laboratory question records whether a visit included any laboratory test. The estimated visit count includes each encounter once. Percentages use in-person encounters with a known answer, including reports of none of the listed services. Telehealth skipped this question. The event file does not separately identify the test, laboratory company or test charge.',
  ...treatmentDrugNotes
];

function serviceAmount(key) {
  return key === 'prescriptions' ? treatmentDrugTotal.spendMillions * 1e6 : serviceData[key].spend.value;
}

function userAmounts(service) {
  return '<dl class="tr-users">' +
    '<div><dt>Of treated adults using this service</dt><dd>' + percent(service.use) + '</dd></div>' +
    '<div><dt>Annual mean per service user</dt><dd>' + dollars(service.mean) + '</dd></div>' +
    '<div><dt>Annual median per service user</dt><dd>' + dollars(service.median) + '</dd></div></dl>';
}

function drugTable(group) {
  const displayName = group.name.startsWith('Flagged diabetes') ? 'Diabetes supplies recorded with prescriptions' : group.name;
  const nameRows = group.rows.map(row =>
    '<tr><th scope="row">' + escapeHTML(row.brands) + '<small>' + escapeHTML(row.ingredient) + '</small></th>' +
    '<td>' + escapeHTML(row.makers) + '</td><td>' + annualAmount(row.spendMillions * 1e6) + '</td></tr>'
  ).join('');
  return '<details class="ma-family tr-family"><summary><span>' + escapeHTML(displayName) +
    '</span><strong class="ma-dollars">' + annualAmount(group.spendMillions * 1e6) + '</strong></summary>' +
    '<div class="ma-table tr-products"><table aria-label="' + escapeHTML(displayName + ' selected products') + '">' +
    '<thead><tr><th scope="col">Selected product</th><th scope="col">Company</th><th scope="col">Annual payments</th></tr></thead>' +
    '<tbody>' + nameRows + '</tbody></table></div></details>';
}

function providersTable(service) {
  const data = serviceData[service.key];
  const rows = Object.entries(data.components).map(([label, estimate]) => {
    const amount = estimate.value === null ? '<span class="tr-withheld">Estimate withheld</span>' : annualAmount(estimate.value);
    return '<tr><th scope="row">' + escapeHTML(label) + '</th><td>' + amount + '</td></tr>';
  }).join('');
  const column = service.key === 'office' ? 'Clinician at the visit' : 'Provider';
  return '<div class="ma-table tr-providers"><table aria-label="' + escapeHTML(service.name + ' payment breakdown') + '">' +
    '<thead><tr><th scope="col">' + column + '</th><th scope="col">Annual payments</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function labActivity(service) {
  const data = serviceData[service.key];
  if (!data.knownLabCount) return '';
  const count = millions(data.knownLabCount.value);
  const share = percent(100 * data.knownLabRate.value);
  const link = service.key === 'office' ?
    ' <a href="#industry/market/labs">Compare Labcorp, Quest and Medicare test prices.</a>' : '';
  return '<p class="tr-lab">Lab testing was reported at <strong>' + count + '</strong> visits a year, or <strong>' +
    share + '</strong> of in-person visits with a known answer.' + link + '</p>';
}

function serviceRow(service) {
  const amount = annualAmount(serviceAmount(service.key));
  let breakdown;
  if (service.key === 'prescriptions') {
    breakdown = '<p class="tr-product-note">Purchases are grouped by the medicine or supply recorded in the survey. Each group shows selected products and their companies.</p>' +
      treatmentDrugGroups.map(drugTable).join('');
  } else {
    breakdown = providersTable(service) + labActivity(service);
  }
  return '<details class="ma-branch tr-service"><summary ' +
    chartMark(service.name,percent(service.share)+' of treatment payments',amount+' per year')+'>' +
    '<span class="ma-branch-name">' + escapeHTML(service.name) + '<small>' + escapeHTML(service.short) + '</small></span>' +
    '<span class="tr-share">' + percent(service.share) + '<span class="tr-sr"> of all annual treatment payments</span>' +
    '<i class="tr-track" aria-hidden="true"><i style="width:' + service.share + '%"></i></i></span>' +
    '<strong class="ma-dollars">' + amount + '</strong></summary>' +
    '<div class="ma-children tr-inside"><p>' + escapeHTML(service.description) + '</p>' +
    userAmounts(service) + breakdown + '</div></details>';
}

export function treatmentAccounts() {
  return '<article class="panel market-accounts treatment-accounts" id="treatment-payments">' +
    '<div class="ma-intro"><div><h2>Payments for diabetes treatment</h2>' +
    '<p>U.S. health plans, families and other payers funded treatment for 26.3 million adults a year in 2021–22.</p>' +
    '</div><strong class="ma-total">$153.2B</strong></div>' +
    '<div class="tr-context"><span>Annual payments per treated adult</span><b>$5,810 <small>mean</small></b><b>$1,770 <small>median</small></b></div>' +
    '<div class="tr-columns"><span>Service</span><span>Share of total</span><span>Annual payments<br>(2022 USD)</span></div>' +
    services.map(serviceRow).join('') + '</article>';
}

export function treatmentAccountRows() {
  const rows = [];
  function add(name, detail, value, unit, source = brief) {
    rows.push(['Market · Diabetes treatment', name, detail, value, unit, source]);
  }
  function appendEstimate(name, detail, estimate, factor, unit, source) {
    if (estimate.value === null) return;
    add(name, detail, +(estimate.value * factor).toFixed(3), unit, source);
    add(name, detail + ' · design-based standard error', +(estimate.se * factor).toFixed(3), unit, source);
    add(name, detail + ' · pooled sample', estimate.respondents, 'unique respondents contributing to estimate', source);
  }
  add('Annual diabetes treatment payments', period, 153200000000, '2022 USD, published rounded estimate');
  add('Adults treated annually', period, 26300000, 'people');
  add('Mean annual treatment payments per treated adult', period, 5810, '2022 USD per person');
  add('Median annual treatment payments per treated adult', period, 1770, '2022 USD per person');
  for (const service of services) {
    const name = service.name;
    add(name, period, service.share, '% of all treatment payments');
    add(name, period, service.use, '% of treated adults using the service');
    add(name, period, service.mean, '2022 USD per service user per year, mean');
    add(name, period, service.median, '2022 USD per service user per year, median');
    if (service.key === 'prescriptions') {
      add(name, period, Math.round(serviceAmount(service.key)), '2022 USD, weighted public-file estimate', dataFile('239A'));
      continue;
    }
    const data = serviceData[service.key];
    appendEstimate(name, period, data.spend, 1, '2022 USD, weighted public-file estimate', script);
    for (const [provider, estimate] of Object.entries(data.components)) {
      appendEstimate(name, provider + ' · ' + period, estimate, 1, '2022 USD', script);
    }
    if (data.knownLabCount) {
      appendEstimate(name + ' with a lab test', period, data.knownLabCount, 1, 'visits per year', script);
      appendEstimate(name + ' with a lab test', period + ' · known test status', data.knownLabRate, 100,
        '% of in-person encounters with known answer', script);
    }
  }
  return rows.concat(treatmentDrugRows());
}

export {services as treatmentServiceProfile};
