import { escapeHTML, sourcesFooter } from './charts.js';
import { heading } from './epidemiology.js';
import { nonprofitSnapshot as snapshot } from './nonprofit-data.js';

const registry = ['IRS · Exempt Organizations Business Master File, November 10, 2026',
  'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf'];
const returns = ['IRS · Form 990 and 990-EZ financial extracts, filings in 2024 and 2025',
  'https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data'];
const roster = ['Download the full nonprofit roster and FY2024 revenue (CSV)', 'data/diabetes-nonprofits.csv'];
const audit = ['Rebuild the counts and rankings (Python)', 'analysis/diabetes_nonprofits.py'];

const programs = {
  '231907729': {
    name: 'Breakthrough T1D',
    story: 'Formerly JDRF, it funds type 1 diabetes research and advocates for access to therapies.',
    source: ['Breakthrough T1D · Research, advocacy and the JDRF name change',
      'https://www.breakthrought1d.org/for-the-media/press-releases/breakthrough-t1d-is-now-breakthrough-t1d/']
  },
  '131623888': {
    name: 'American Diabetes Association',
    story: 'It funds research across diabetes types and helps families secure diabetes care during the school day through Safe at School.',
    source: ['American Diabetes Association · Safe at School', 'https://diabetes.org/advocacy/safe-at-school']
  },
  '042203836': {
    name: 'Joslin Diabetes Center',
    story: 'Its Boston clinics bring together adult and pediatric diabetes care, eye care and clinical research.',
    source: ['Joslin Diabetes Center · Adult, pediatric, eye and research clinics', 'https://joslin.org/about/joslin-move']
  },
  '591361955': {
    name: 'Diabetes Research Institute Foundation',
    story: 'It raises money for the Diabetes Research Institute to move potential cures from the laboratory into clinical studies.',
    source: ['Diabetes Research Institute Foundation · Foundation and institute roles', 'https://diabetesresearch.org/mission/']
  },
  '460771608': {
    name: 'Insulin for Life USA',
    story: 'It collects donated insulin and diabetes supplies and redistributes them through health professionals in the U.S. and abroad.',
    source: ['Insulin for Life USA · How donated insulin and supplies reach patients', 'https://iflusa.org/about/']
  }
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const stateNames = { CA: 'California', FL: 'Florida', MA: 'Massachusetts', NY: 'New York', TX: 'Texas', VA: 'Virginia' };
const periodLabel = value => months[Number(value.slice(4)) - 1] + ' ' + value.slice(0, 4);

function scopeAndRoles() {
  const counts = Object.fromEntries(snapshot.headquarters);
  const largestGroup = Math.max(...snapshot.roles.map(([, count]) => count));
  const bars = snapshot.roles.map(([label, count]) => {
    const secondary = label === 'Other fields' || label === 'No classification listed';
    return `<li class="${secondary ? 'np-residual' : ''}"><span>${escapeHTML(label)}</span>
      <i aria-hidden="true"><em style="width:${count / largestGroup * 100}%"></em></i><b>${count}</b></li>`;
  }).join('');
  return `<section class="panel np-scan" aria-label="Scope and fields of work">
    <div class="np-count"><strong>${snapshot.count}</strong><p>U.S.-based nonprofits with diabetes identified in their registered names</p>
    <span>IRS register · November 10, 2026</span>
    <div class="np-geography">Across ${snapshot.statesAndDc - 1} states and Washington, DC. California has ${counts.CA} headquarters, followed by Florida and Texas with ${counts.FL} each.</div></div>
    <div class="np-work"><h2>What these organizations do</h2>
    <p>Number of nonprofits by primary field recorded by the IRS</p><ul class="np-bars">${bars}</ul></div></section>`;
}

function sizes() {
  const small = snapshot.sizeBands[0][1] + snapshot.sizeBands[1][1];
  const total = snapshot.financialCount;
  const segments = snapshot.sizeBands.map(([, count], i) =>
    `<i class="np-band-${i}" style="width:${100 * count / total}%"></i>`).join('');
  const legend = snapshot.sizeBands.map(([band, count], i) =>
    `<li><i class="np-band-${i}" aria-hidden="true"></i><span>${escapeHTML(band)}</span><b>${count}</b></li>`).join('');
  return `<section class="panel np-size"><h2>How large are these nonprofits?</h2>
    <p>Among ${total} organizations with comparable FY${snapshot.fiscalYear} returns, ${small} reported less than $1 million in annual revenue.</p>
    <div class="np-band" aria-hidden="true">${segments}</div><ul class="np-size-key" aria-label="Number of organizations by annual revenue">${legend}</ul></section>`;
}

function largest() {
  const rows = snapshot.ranking.map((row, i) => {
    const details = programs[row.ein];
    const state = stateNames[row.state_dc] || row.state_dc;
    return `<li><span class="np-position" aria-hidden="true">${i + 1}</span>
      <div class="np-org"><h3>${escapeHTML(details.name)}</h3><p>${escapeHTML(details.story)}</p></div>
      <div class="np-revenue"><strong>${escapeHTML(currency.format(row.total_revenue_usd))}</strong>
      <span>${escapeHTML(state)} · FY ended ${periodLabel(row.fiscal_period_end)}</span></div></li>`;
  }).join('');
  return `<section class="panel np-rank"><h2>Five largest by FY${snapshot.fiscalYear} revenue</h2>
    <ol aria-label="Organizations ranked by total reported revenue">${rows}</ol></section>`;
}

export function organizationsPage() {
  const missing = snapshot.count - snapshot.financialCount - snapshot.ambiguousReturns;
  return heading('Diabetes organizations') + scopeAndRoles() + sizes() + largest() +
    sourcesFooter([
      roster, audit, registry, ['IRS · Registry fields and organization codes', 'https://www.irs.gov/pub/foia/ig/tege/eo-info.pdf'],
      ['IRS · National Taxonomy of Exempt Entities categories', 'https://www.irs.gov/pub/irs-pdf/i1023.pdf'],
      returns, ['American Diabetes Association · Research, advocacy and education', 'https://diabetes.org/about-us'],
      ...snapshot.ranking.map(row => programs[row.ein].source)
    ], [
      'The November 2026 IRS extract covers recognized tax-exempt organizations. We searched the registered name and secondary name of 501(c)(3) entities with exemption status 01 and a filing address in the 50 states or DC for diabetes, diabetic, T1D, T2D, JDRF, insulin or type 1/2 variants. Four unrelated matches were removed. Organizations using other names, other tax statuses and informal groups fall outside this count.',
      'Each employer identification number counts once. Affiliates with separate IDs count separately. A headquarters address can differ from the states served. The chart groups education, youth development and recreation and uses one primary IRS field per organization. Organizations can run several kinds of programs.',
      `Revenue is the total for the individual tax entity, including eligible noncash gifts. We matched Forms 990 and 990-EZ filed in 2024 or 2025 for fiscal periods ending in 2024. The ${snapshot.financialCount} comparable returns include ${snapshot.zeroReturns} reporting $0. For ${missing} organizations these files supplied no comparable amount. One additional organization reported two periods ending in 2024. Both groups remain in the roster and outside the ranking. Form 990-N notices and Form 990-PF foundation returns are outside this financial comparison.`
    ]);
}

export function orgExportRows() {
  const section = 'Organizations';
  const census = 'Unique 501(c)(3) EINs, IRS registry, Nov 10 2026';
  const finance = 'Comparable Forms 990 / 990-EZ, fiscal year ended 2024';
  return [
    [section, 'U.S.-based diabetes nonprofits identified by name', '50 states and DC screened', snapshot.count, census, registry[1]],
    ...snapshot.roles.map(([label, count]) => [section, 'Primary field', label, count, census, registry[1]]),
    ...snapshot.headquarters.map(([state, count]) => [section, 'Filing address', state, count, census, registry[1]]),
    [section, 'Organizations with comparable revenue', 'FY2024', snapshot.financialCount, finance, returns[1]],
    ...snapshot.sizeBands.map(([band, count]) => [section, 'Organizations by annual revenue', band, count, finance, returns[1]]),
    ...snapshot.ranking.map(row => [section, 'Total revenue, USD', programs[row.ein].name + ' · ' + periodLabel(row.fiscal_period_end), row.total_revenue_usd, finance, returns[1]])
  ];
}
