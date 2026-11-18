import {escapeHTML} from './charts.js';

const sources = {
  diagnosis: ['NIDDK · Blood tests used to diagnose diabetes', 'https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis'],
  ada: ['ADA · Diagnostic and confirmation criteria, Standards of Care 2026', 'https://doi.org/10.2337/dc26-S002'],
  screening: ['Medicare · Eligibility, frequency and cost of diabetes screening', 'https://www.medicare.gov/coverage/diabetes-screenings'],
  diagnosticLab: ['Medicare · Coverage of diagnostic laboratory tests', 'https://www.medicare.gov/coverage/diagnostic-laboratory-tests'],
  united: ['UnitedHealthcare · Commercial and Individual Exchange preventive care policy, July 2026, pp. 2 and 10–11', 'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/index/commercial/preventive-care-services-07012026.pdf'],
  a1c: ['Labcorp OnDemand · In-person HbA1c price', 'https://www.ondemand.labcorp.com/lab-tests/diabetes-risk-hbA1c-test'],
  fpg: ['Labcorp OnDemand · In-person fasting glucose price', 'https://www.ondemand.labcorp.com/lab-tests/fasting-glucose-test'],
  fpgWalk: ['Walk-In Lab · Fasting plasma glucose price and order fee', 'https://www.walkinlab.com/products/view/glucose-plasma-test'],
  ogtt: ['Walk-In Lab · Two-hour oral glucose tolerance test, protocol and order fee', 'https://www.walkinlab.com/products/view/glucose-tolerance-test-gtt-two-hour-blood-test'],
  quest: ['Quest Health · HbA1c and glucose panel price and physician fee', 'https://www.questhealth.com/product/diabetes-monitoring-test-hba1c-glucose/94340M.html'],
  clfs: ['CMS · Clinical Laboratory Fee Schedule, Q4 2026', 'https://www.cms.gov/medicare/payment/fee-schedules/clinical-laboratory-fee-schedule-clfs/files/26clabq4'],
  walmart: ['Walmart · ReliOn Premier meter and compatible test strip prices', 'https://www.walmart.com/browse/health-medicine/relion/976760_2289975_9391152'],
  rocheMeter: ['Roche · Accu-Chek Guide Me retail meter price', 'https://www.accu-chek.com/products/meters/guide-me'],
  rocheProgram: ['Roche · Accu-Chek prescription discount prices and eligibility', 'https://www.accu-chek.com/tools/prescription-discount-program'],
  stelo: ['Dexcom · Stelo one-time purchase, subscription and sensor wear', 'https://www.stelo.com/buy-stelo-one-time'],
  steloFda: ['FDA · Stelo clearance for people aged two and older who do not use insulin, June 2026', 'https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor-children'],
  lingo: ['Abbott · Lingo two-sensor price and wear time', 'https://www.hellolingo.com/products'],
  lingoSub: ['Abbott · Lingo four-week subscription price', 'https://www.hellolingo.com/products?p=4-week-subscription'],
  lingoUse: ['Abbott · Lingo intended use and age group', 'https://support.hellolingo.com/hc/en-us/articles/15902948209170-Can-I-use-Lingo-with-diabetes'],
  syringe: ['Total Diabetes Supply · EasyTouch 100-count U-100 syringes', 'https://www.totaldiabetessupply.com/collections/diabetes-care/products/easytouch-insulin-syringe-30g-1cc-5-16-inch'],
  pods: ['Insulet · Omnipod 5 pod copay analysis, 2024 commercial and Medicare paid claims', 'https://www.omnipod.com/hcp/insurance-coverage'],
  dme: ['CMS · 2024 Original Medicare equipment and supplies, national claims by service code (CSV)', 'https://data.cms.gov/sites/default/files/2026-07/d264f6fd-f327-4e54-9ab7-9132f1395b6b/mup_dme_ry26_p05_v10_dy24_geor.csv'],
  cgmCoverage: ['Medicare · When Part B covers CGM and what the patient pays', 'https://www.medicare.gov/coverage/continuous-glucose-monitors']
};

const labPrices = {
  a1c: 39, fasting: 39, fastingPlasma: 28, ogtt: 55, walkOrder: 6, panel: 75, panelOrder: 6,
  allowedA1c: 9.71, allowedGlucose: 3.93, allowedPostLoad: 4.75
};
const devicePrices = {
  relionMeter: 9, relionStrips: 9.84, guideMeter: 14.99, guideStrips: 19.99, guideKit: 49.99,
  steloPair: 99, steloSub: 89, lingoPair: 89, lingoSub: 84, syringes: 19.99, podCopay: 30
};
const dmeAllowances = {
  meter: 35.69, strips: 8.52, lancets: 1.49, cgmReceiver: 285.12, cgmSupplies: 262.85
};

const dollar = n => '$' + n.toLocaleString('en-US', {
  minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2
});
const price = (n, unit) => '<b>' + dollar(n) + '</b> ' + escapeHTML(unit);
const detail = t => '<span class="gl-price-context">' + escapeHTML(t) + '</span>';
const rate = (amount, code) => price(amount, '· ' + code);

function priceTable(caption, columns, rows) {
  const headings = columns.map(h => '<th scope="col">' + escapeHTML(h) + '</th>').join('');
  const body = rows.map(([name, ...cells]) => {
    const values = cells.map((cell, i) => '<td data-column="' + escapeHTML(columns[i + 1]) + '">' + cell + '</td>').join('');
    return '<tr><th scope="row">' + escapeHTML(name) + '</th>' + values + '</tr>';
  }).join('');
  return '<table class="gl-price-table"><caption>' + escapeHTML(caption) + '</caption><thead><tr>' + headings +
    '</tr></thead><tbody>' + body + '</tbody></table>';
}

const lp = labPrices;
const dp = devicePrices;
const da = dmeAllowances;

export const diagnosticPriceSources = ['diagnosis', 'ada', 'screening', 'diagnosticLab', 'united', 'a1c', 'fpg', 'ogtt'].map(key => sources[key]);
export const glucosePriceSources = Object.values(sources);

export const diagnosticPriceNotes = [
  'Diagnostic prices are U.S. direct-purchase examples for nonpregnant adults, checked in November 2026. The $61 example includes the $55 test and one $6 order fee before temporary promotions. Separate office visits or repeat testing can change the total.',
  'Original Medicare covers up to two diabetes screenings within 12 months for people meeting its risk criteria. A provider accepting assignment accepts the Medicare-approved amount. Medicare also generally covers medically necessary diagnostic lab work ordered by a clinician with no patient charge for the covered test. UnitedHealthcare’s July 2026 private-plan example applies to eligible in-network claims on non-grandfathered plans, ages 35–70 with qualifying risk and screening codes. A known diabetes diagnosis uses other plan benefits.'
];

export const glucosePriceNotes = [
  ...diagnosticPriceNotes,
  'The Q4 2026 CMS Clinical Laboratory Fee Schedule gives national allowed amounts for individual lab services. Walk-In Lab’s plasma glucose example includes a $28 test and $6 per order. The oral test uses a fasting and a post-load specimen. Walk-In Lab lists 82947 and 82950 for this protocol. The two individual schedule rates do not establish a claim total. Quest markets its paired tests for monitoring. Its regular $75 price carries a $6 physician service fee.',
  'Retail prices refer to U.S. listings in November 2026. Lab and sensor comparisons use the regular one-time or renewal price, excluding limited-time codes. For strips and sensors, the per-unit price is the pack price divided by the number supplied. Actual wear, shipping, taxes and local prices may vary. Roche’s pharmacy discount requires a prescription and excludes government-insured users.',
  'The 2024 equipment rates are national average allowed amounts per service for non-rental Original Medicare fee-for-service claims, including both insurer and beneficiary shares. Codes E0607, A4253, A4259, E2103 and A4239 identify a meter, strips, lancets, a non-adjunctive CGM receiver and a monthly non-adjunctive CGM supply bundle, respectively. These historical averages and the retail examples describe different payment arrangements.',
  'The Omnipod threshold describes commercially insured and Medicare paid claims for Omnipod 5 G6/G7-compatible pods during 2024, including copay assistance. It measures the share of copays at or below $30. The patient’s purchase of insulin or a compatible CGM is separate.'
];

export function diagnosticJourneyCosts() {
  function item(amount, label) {
    return '<li><strong>' + dollar(amount) + '</strong><span>' + escapeHTML(label) + '</span></li>';
  }
  return '<figure class="diagnosis-prices"><figcaption>What the lab test can cost</figcaption>' +
    '<p>A clinician can check a venous blood sample for A1c or fasting glucose, or measure the response to an oral glucose drink. Diagnosis usually requires a second abnormal result.</p>' +
    '<ul>' + item(0, 'Eligible Medicare screening when the provider accepts assignment') +
    item(lp.a1c, 'Self-pay for either A1c or fasting glucose at Labcorp') +
    item(lp.ogtt + lp.walkOrder, 'Self-pay for a two-hour oral glucose test, including the order fee') +
    '</ul><p>Private coverage also depends on the reason for testing. UnitedHealthcare covers qualifying in-network screening at $0 on eligible plans. Home meters and sensors track glucose between visits.</p></figure>';
}

export function glucosePrices() {
  const labs = priceTable('Laboratory testing', ['Test', 'Self-pay example', 'Medicare lab fee, 2026'], [
    ['Venous HbA1c', price(lp.a1c, '· Labcorp') + detail('One blood draw. Fasting is unnecessary.'), rate(lp.allowedA1c, '83036')],
    ['Fasting glucose', price(lp.fastingPlasma + lp.walkOrder, '· Walk-In Lab, plasma test') + detail('Includes the order fee. Labcorp’s fasting glucose test is ' + dollar(lp.fasting) + '.'), rate(lp.allowedGlucose, '82947')],
    ['Two-hour oral glucose tolerance test', price(lp.ogtt + lp.walkOrder, '· Walk-In Lab') + detail('Fasting draw, 75 g glucose drink and a second draw two hours later. Includes the order fee.'),
      rate(lp.allowedGlucose, '82947, fasting') + detail(dollar(lp.allowedPostLoad) + ' · 82950, after the drink')],
    ['HbA1c + glucose monitoring panel', price(lp.panel + lp.panelOrder, '· Quest') + detail('Two tests in one order to track an existing diagnosis. Includes the physician fee.'), rate(lp.allowedA1c, '83036, A1c') + detail(dollar(lp.allowedGlucose) + ' · 82947, glucose')]
  ]);

  const monitors = priceTable('Glucose monitoring at home', ['Product', 'U.S. purchase price', 'Cost per use or refill'], [
    ['ReliOn Premier Classic', price(dp.relionMeter, 'per meter') + detail('Walmart cash price. Strips are a separate purchase.'),
      price(dp.relionStrips, 'per 50 Premier strips') + detail('About ' + dollar(dp.relionStrips / 50) + ' per strip. Lancets are separate.')],
    ['Accu-Chek Guide Me', price(dp.guideMeter, 'per meter') + detail('Roche also offers a pharmacy starter bundle from ' + dollar(dp.guideKit) + ' with a meter, 100 strips and at least 100 lancets.'),
      price(dp.guideStrips, 'per first 50 Guide strips') + detail('About ' + dollar(dp.guideStrips / 50) + ' each with the eligible pharmacy coupon.')],
    ['Stelo by Dexcom', price(dp.steloPair, 'for two OTC sensors') + detail('Each lasts up to 15 days. For people who do not use insulin.'),
      price(dp.steloSub, 'monthly for two') + detail(dollar(dp.steloSub / 2) + ' per sensor on subscription, ' + dollar(dp.steloPair / 2) + ' per sensor bought once.')],
    ['Lingo by Abbott', price(dp.lingoPair, 'for two OTC sensors') + detail('Each lasts up to 14 days. For adults tracking glucose for wellness.'),
      price(dp.lingoSub, 'every four weeks for two') + detail(dollar(dp.lingoSub / 2) + ' per sensor on subscription, ' + dollar(dp.lingoPair / 2) + ' per sensor bought once.')]
  ]);

  const covered = priceTable('Equipment paid through insurance', ['Equipment', '2024 U.S. allowed amount', 'Unit paid by Original Medicare'], [
    ['Fingerstick meter and supplies', price(da.meter, 'per meter') + detail('E0607'),
      price(da.strips, 'per 50 strips') + detail(dollar(da.lancets) + ' per 100 lancets. Separate supply claims.')],
    ['Prescription CGM', price(da.cgmReceiver, 'per receiver') + detail('E2103'),
      price(da.cgmSupplies, 'per month of supplies') + detail('A4239. Eligible patients generally pay 20% of the approved amount after the Part B deductible when the supplier accepts assignment.')]
  ]);

  const delivery = priceTable('Insulin delivery', ['Product', 'Observed price', 'What the patient gets'], [
    ['EasyTouch U-100 syringes', price(dp.syringes, 'per 100') + detail('Total Diabetes Supply cash listing.'),
      'About ' + dollar(dp.syringes / 100) + ' per syringe. Insulin is purchased separately.'],
    ['Omnipod 5 disposable pods', price(dp.podCopay, 'or less per month') + detail('At least half of copays in the manufacturer’s 2024 claims analysis.'),
      'Prescription pump pods. Insulin and the compatible sensor have separate costs.']
  ]);

  return '<article class="panel glucose-prices" id="glucose-prices"><h2>From a lab test to ongoing glucose care</h2>' +
    '<p class="gl-price-intro">A lab test helps establish the diagnosis. At home, each fingerstick uses a strip and each wearable sensor has a replacement cycle.</p>' +
    labs + '<p class="gl-price-aside"><strong>What a patient owes.</strong> Qualifying Original Medicare screening costs $0 with a provider who accepts assignment. The lab fee is the amount allowed for the service.</p>' +
    monitors + covered + delivery + '</article>';
}

export function glucosePriceRows() {
  function record(group, measure, value, unit, key) {
    return ['U.S. glucose pricing', group, measure, value, unit, sources[key][1]];
  }
  return [
    record('Laboratory, November 2026', 'HbA1c · Labcorp', lp.a1c, 'USD per test, self-pay', 'a1c'),
    record('Laboratory, November 2026', 'Fasting glucose · Labcorp', lp.fasting, 'USD per test, self-pay', 'fpg'),
    record('Laboratory, November 2026', 'Fasting plasma glucose · Walk-In Lab', lp.fastingPlasma + lp.walkOrder, 'USD per order, including physician fee before promotions', 'fpgWalk'),
    record('Laboratory, November 2026', '75 g two-hour OGTT · Walk-In Lab', lp.ogtt + lp.walkOrder, 'USD per order, including physician fee before promotions', 'ogtt'),
    record('Laboratory, November 2026', 'HbA1c and glucose monitoring panel · Quest', lp.panel + lp.panelOrder, 'USD per order, including physician fee before promotions', 'quest'),
    record('Clinical Laboratory Fee Schedule, Q4 2026', 'HbA1c 83036', lp.allowedA1c, 'USD national lab fee', 'clfs'),
    record('Clinical Laboratory Fee Schedule, Q4 2026', 'Glucose 82947', lp.allowedGlucose, 'USD national lab fee', 'clfs'),
    record('Clinical Laboratory Fee Schedule, Q4 2026', 'Post-load glucose 82950', lp.allowedPostLoad, 'USD national lab fee', 'clfs'),
    record('Patient payment', 'Eligible Original Medicare screening with assignment', 0, 'USD per eligible screen', 'screening'),
    record('Patient payment', 'UnitedHealthcare eligible in-network preventive claim', 0, 'USD cost sharing on qualifying non-grandfathered plans', 'united'),
    record('Home glucose monitoring, November 2026', 'ReliOn Premier Classic meter', dp.relionMeter, 'USD per meter', 'walmart'),
    record('Home glucose monitoring, November 2026', 'ReliOn Premier strips', dp.relionStrips, 'USD per 50 strips', 'walmart'),
    record('Home glucose monitoring, November 2026', 'Accu-Chek Guide Me meter', dp.guideMeter, 'USD per meter, retail', 'rocheMeter'),
    record('Home glucose monitoring, November 2026', 'Accu-Chek Guide Me starter bundle', dp.guideKit, 'USD starting price, eligible pharmacy coupon', 'rocheProgram'),
    record('Home glucose monitoring, November 2026', 'Accu-Chek Guide strips', dp.guideStrips, 'USD per first 50 strips, eligible pharmacy coupon', 'rocheProgram'),
    record('OTC CGM, November 2026', 'Stelo one-time purchase', dp.steloPair, 'USD per two sensors, up to 15 days each', 'stelo'),
    record('OTC CGM, November 2026', 'Stelo subscription', dp.steloSub, 'USD monthly per two sensors', 'stelo'),
    record('OTC CGM, November 2026', 'Lingo one-time purchase', dp.lingoPair, 'USD per two sensors, up to 14 days each', 'lingo'),
    record('OTC CGM, November 2026', 'Lingo subscription', dp.lingoSub, 'USD every four weeks per two sensors', 'lingoSub'),
    record('Original Medicare FFS, 2024', 'E0607 home glucose meter', da.meter, 'USD average allowed per meter', 'dme'),
    record('Original Medicare FFS, 2024', 'A4253 test strips', da.strips, 'USD average allowed per 50 strips', 'dme'),
    record('Original Medicare FFS, 2024', 'A4259 lancets', da.lancets, 'USD average allowed per 100 lancets', 'dme'),
    record('Original Medicare FFS, 2024', 'E2103 non-adjunctive CGM receiver', da.cgmReceiver, 'USD average allowed per receiver', 'dme'),
    record('Original Medicare FFS, 2024', 'A4239 non-adjunctive CGM supplies', da.cgmSupplies, 'USD average allowed per month of supplies', 'dme'),
    record('Insulin delivery, November 2026', 'EasyTouch U-100 syringes', dp.syringes, 'USD per 100 syringes, insulin separate', 'syringe'),
    record('Insulin delivery, 2024', 'Omnipod 5 pod monthly copay threshold for at least half of paid claims', dp.podCopay, 'USD per month, commercially insured and Medicare paid claims', 'pods')
  ];
}
