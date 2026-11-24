import { audiences, chapters, conditions, metrics, pages, products, sources } from './content.js';
import { stateCounts } from './state-counts.js';
import { states } from './states.js';
import { stateNames } from '../diabetes-product/map-data.js';
import { mapImage } from '../diabetes-product/geography.js';

const main = document.getElementById('main-content');
const side = document.getElementById('navigation');
const mobile = document.getElementById('mobile-navigation');
const topics = path => {
  const family = path.split('/')[0];
  return (audiences[family] || []).map(([slug, label]) => [family + '/' + slug, label]);
};
const routes = chapters.flatMap(([, links]) => links.flatMap(([path]) => {
  const childRoutes = topics(path);
  return childRoutes.length ? childRoutes.map(([key]) => key) : [path];
}));
const ageGroups = ['Adults 18+', 'Ages 18–25', 'Ages 26+'];
const colors = ['#e3f1ef', '#a9d2cc', '#65afa6', '#337f78', '#10564f'];
const number = new Intl.NumberFormat('en-US');
const people = value => number.format(value * 1000);
let measure = 'count';
let conditionIndex = 0;
const stateCodes = Object.fromEntries(Object.entries(stateNames).map(([code, name]) => [name, code]));
const stateRows = states.filter(([name]) => Object.hasOwn(stateCodes, name));
const national = states.find(([name]) => name === 'Total U.S.');
const groups = ['All', ...new Set(products.map(product => product[1]))];
const included = new Set();
let active = 'intro';
let age = 0;
let locationFilter = '';
let productFilter = 'All';
let mapSource;

const link = (path, label, current = path === active) =>
  `<a href="#${path}" class="${current ? 'active' : ''}" ${path === active ? 'aria-current="page"' : ''}>${label}</a>`;
const links = rows => rows.map(([path, label]) => link(path, label)).join('');

function navigation() {
  const family = active.split('/')[0];
  side.innerHTML = chapters.map(([label, rows]) => {
    const group = rows.map(([path, title]) => {
      if (audiences[family] && path.startsWith(family + '/')) {
        return `<a href="#${path}" class="in-section">${title}</a><div class="audience-pages">${links(topics(path))}</div>`;
      }
      return link(path, title);
    }).join('');
    if (label === 'Research') return group;
    return `<section class="nav-cluster" aria-label="${label}"><h2>${label}</h2>${group}</section>`;
  }).join('');
  const selected = chapters.findIndex(([, rows]) => rows.some(([path]) => path.split('/')[0] === family));
  const mobileChapters = chapters.map(([label, rows], index) => [rows[0][0], label, selected === index]);
  mobile.innerHTML = `<div class="mobile-chapters">${mobileChapters.map(args => link(...args)).join('')}</div>
    <div class="mobile-sub">${links(chapters[selected][1].map(([p, n]) => [p, p === 'hcp/profile' ? 'Professionals' : n]))}</div>
    ${audiences[family] ? `<div class="mobile-topics">${links(topics(active))}</div>` : ''}`;
}

function metricCards(items) {
  return `<div class="metrics">${items.map(([value, label, year, source]) =>
    `<article class="panel"><strong>${value}</strong><p>${label}</p><small>${source} · ${year}</small></article>`).join('')}</div>`;
}

function barChart(title, text, rows, unit = '%', limit = 100) {
  return `<section class="panel"><h2>${title}</h2><p>${text}</p><div class="chart">${rows.map(([label, val]) =>
    `<div class="chart-row"><span>${label}</span><div class="chart-track" aria-hidden="true"><span style="width:${val / limit * 100}%"></span></div><strong>${val}${unit}</strong></div>`).join('')}</div></section>`;
}

function countRecord(name, group = age) {
  return stateCounts[name].slice(group * 3, group * 3 + 3);
}

function geography() {
  return `<section class="panel condition-map">
    <h2>Any mental illness by state</h2><p>Past-year estimates for the civilian, noninstitutionalized population, annual average for 2023–2024.</p>
    <div class="geo-toolbar"><div class="geo-location">
      <label class="picker"><span>Age group</span><select id="age">${ageGroups.map((label, index) => `<option value="${index}" ${age === index ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      <label class="picker"><span>Location</span><select id="place"><option value="">All states</option>${stateRows.map(([name]) => `<option value="${stateCodes[name]}" ${locationFilter === stateCodes[name] ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
    </div></div>
    <div class="epi-tabs case-toggle" role="group" aria-label="Map measure">
      <button type="button" data-measure="count" aria-pressed="${measure === 'count'}">Number of people</button>
      <button type="button" data-measure="percent" aria-pressed="${measure === 'percent'}">Percent of population</button>
    </div>
    <div id="geography"></div>
  </section>`;
}

function renderGeography(restoreCode) {
  const target = document.getElementById('geography');
  if (!target) return;
  const col = 1 + 2 * age;
  const count = measure === 'count';
  const cuts = count ? [100, 250, 500, 1000] : age === 1 ? [30, 33, 36, 39] : [19, 22, 25, 28];
  const format = value => count ? people(value) : value + '%';
  const ranked = stateRows.map(row => [row[0], count ? countRecord(row[0])[0] : Number(row[col])])
    .sort((a, b) => b[1] - a[1]);
  const values = Object.fromEntries(ranked.map(([name, value]) => [stateCodes[name], value]));
  const chosen = stateRows.find(([name]) => stateCodes[name] === locationFilter);
  const color = value => colors[cuts.filter(cut => value >= cut).length];
  const ordered = ranked.map(([name]) => stateRows.find(row => row[0] === name));
  const rows = chosen ? [chosen, national] : [national, ...ordered];
  const labels = ['Below ' + format(cuts[0]), ...cuts.slice(1).map((cut, index) => format(cuts[index]) + ' to <' + format(cut)), format(cuts.at(-1)) + ' or more'];
  const reading = chosen || national;
  const rank = chosen ? 1 + ranked.filter(([, value]) => value > values[locationFilter]).length : null;
  const extreme = ([name, value]) => `${name} · ${format(value)}`;
  target.innerHTML = `${mapSource ? `<div class="map case-outline">${mapImage(mapSource, values, locationFilter, 'geo', color, format, 'Any mental illness by state')}</div>
    <div class="atlas-key" aria-label="Map color scale">${labels.map((label, index) => `<span><i style="background:${colors[index]}"></i>${label}</span>`).join('')}</div>` : ''}
    <div class="geo-current" aria-live="polite"><strong>${chosen ? reading[0] : 'United States'}</strong>
    <span>${people(countRecord(reading[0])[0])} people · ${reading[col]}% · ${ageGroups[age]}${rank ? ' · Rank ' + rank + ' of 51' : ''}</span>
    ${chosen ? '<button type="button" data-reset-map>Show all states</button>' : ''}</div>
    <dl class="case-ranks"><div><dt>Highest estimate</dt><dd>${extreme(ranked[0])}</dd></div><div><dt>Lowest estimate</dt><dd>${extreme(ranked.at(-1))}</dd></div></dl>
    <p class="reading">SAMHSA modeled estimates for 50 states and D.C. Counts are rounded to the nearest thousand. Percentages use the population of the selected age group in each location. Rank reflects point estimates.</p>
    <details class="state-estimates"><summary>State estimates and 95% confidence intervals</summary>
    <div class="table-wrap" tabindex="0" role="region" aria-label="State estimates"><table><thead><tr><th scope="col">Location</th><th scope="col">Estimated people (95% CI)</th><th scope="col">Prevalence (95% CI)</th></tr></thead>
      <tbody>${rows.map(row => {
        const [estimate, lower, upper] = countRecord(row[0]);
        return `<tr data-selected="${row === chosen}"><th scope="row">${row[0]}</th><td>${people(estimate)} (${people(lower)}–${people(upper)})</td><td>${row[col]}% ${row[col + 1]}</td></tr>`;
      }).join('')}</tbody></table></div></details>`;
  if (restoreCode) target.querySelector(`[role="button"][data-state="${restoreCode}"]`)?.focus({ preventScroll: true });
}

function conditionDetail() {
  const item = conditions[conditionIndex];
  return `<div class="condition-summary">
    <div><h3>${item.name}</h3><p>${item.summary}</p></div>
    <div class="condition-estimate">${item.value ? `<strong>${item.value}</strong>` : ''}<b>${item.measure}</b>
    <span>${item.count ? item.count + ' · ' : ''}${item.time}</span><a href="${item.source}">View estimate and methodology</a></div>
  </div>`;
}
function conditionExplorer() {
  return `<section class="panel cs-differences"><h2>Conditions and prevalence benchmarks</h2>
    <p class="reading">Past-year estimates for U.S. adults where available. Each estimate names the survey period and the condition it measures.</p>
    <div class="filters" role="group" aria-label="Mental health conditions">${conditions.map((item, index) => `<button type="button" data-condition="${index}" aria-pressed="${index === conditionIndex}">${item.measure}</button>`).join('')}</div>
    <div id="condition-detail" aria-live="polite">${conditionDetail()}</div>
    <details><summary>Compare all condition benchmarks</summary>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Prevalence benchmarks"><table><thead><tr><th scope="col">Measure</th><th scope="col">U.S. adults</th><th scope="col">Source period</th></tr></thead>
      <tbody>${conditions.map(item => `<tr><th scope="row"><a href="${item.source}">${item.measure}</a></th><td>${item.value || 'See source summary'}</td><td>${item.time}</td></tr>`).join('')}</tbody></table></div>
    </details></section>`;
}

function catalog() {
  return `<section class="panel">
    <h2>Product catalog</h2>
    <div class="filters" role="group" aria-label="Product category">${groups.map((group, i) => `<button type="button" data-product-filter="${i}" aria-pressed="${group === productFilter}">${group}</button>`).join('')}</div>
    <div id="product-list"></div>
    <div id="comparison"></div>
  </section>`;
}
function renderCatalog() {
  const list = document.getElementById('product-list');
  list.className = 'panel-grid';
  list.innerHTML = products.map(([name, type, buyer, role, source], index) => productFilter === 'All' || type === productFilter
    ? `<article class="product-card"><h3>${name}</h3><small>${type}</small><p>${role}</p><a href="${sources[source][1]}">Product source</a><label><input type="checkbox" data-compare="${index}" ${included.has(index) ? 'checked' : ''}> Compare</label></article>`
    : '').join('');
  renderComparison();
}
function renderComparison() {
  const comparison = document.getElementById('comparison');
  comparison.innerHTML = included.size ? `<div class="controls"><h3>Product comparison</h3><button type="button" data-clear>Clear selection</button></div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Product comparison">
    <table><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Typical access channel</th></tr></thead><tbody>
    ${products.filter((_, index) => included.has(index)).map(([name, type, buyer]) => `<tr><th scope="row">${name}</th><td>${type}</td><td style="white-space:normal">${buyer}</td></tr>`).join('')}</tbody></table></div>` : '';
}

const searchSets = [
  ['Find care', ['therapist near me', 'online therapy', 'psychiatrist near me']],
  ['Symptoms and conditions', ['depression symptoms', 'anxiety symptoms', 'panic attack']],
  ['Cost and insurance', ['therapy cost', 'therapy insurance', 'sliding scale therapy']],
  ['Portuguese-language access', ['terapia online', 'psicólogo brasileiro', 'terapia em português']],
];
function searchExplorer() {
  return `<section class="panel"><h2>Compare U.S. search terms</h2><p>Open a live Google Trends comparison for the past 12 months.</p><div class="topic-list">
    ${searchSets.map(([label, terms]) => {
      const params = new URLSearchParams({ geo: 'US', date: 'today 12-m', q: terms.join(',') });
      return `<article><h3><a href="https://trends.google.com/trends/explore?${params}">${label}</a></h3><p>${terms.join(' · ')}</p></article>`;
    }).join('')}</div></section>`;
}

const displays = {
  intro: () => `<section class="panel cs-impact" aria-label="U.S. mental health indicators">${metrics.slice(0, 3).map(([value, label, year, source]) => `<div><strong>${value}</strong><p>${label}</p><small>${source} · ${year}</small></div>`).join('')}</section>
    <section class="panel cs-differences"><h2>What the different diagnoses mean</h2>
    <dl>${conditions.map(item => `<div><dt>${item.name}</dt><dd>${item.summary}</dd></div>`).join('')}</dl>
    <p class="reading-links"><a href="#conditions">Explore types and prevalence</a><a href="#epidemiology">Explore the state map</a></p></section>`,
  conditions: () => conditionExplorer() + barChart('Major depressive episode by age', 'Past-year prevalence among U.S. adults, 2024 NSDUH', [['Ages 18–25',15.9],['Ages 26–49',10],['Ages 50+',4.4]], '%', 20),
  epidemiology: () => metricCards(metrics) + geography() + barChart('Persistent sadness or hopelessness', 'U.S. high school students · CDC Youth Risk Behavior Survey', [['2023',40],['2025',33]]),
  comorbidities: () => barChart('Care for co-occurring mental illness and substance use disorder', 'Adults with both conditions in the past year · 2024 NSDUH', [['Mental health only',41.0],['Substance use only',3.2],['Both',14.5],['Neither',41.2]]),
  healthcare: () => `<div class="chapter-pair">${barChart('Treatment among adults with any mental illness', 'U.S. adults, past year · 2024 NSDUH', [['Received',52.1],['No treatment',47.9]])}
    ${barChart('Treatment expenditures by age', 'Billions of U.S. dollars · 2019 MEPS', [['Ages 18–64',88.4],['Ages 65+',18.1]], 'B', 100)}</div>`,
  'healthcare/public': () => barChart('Public payer spending', 'Billions of U.S. dollars spent treating mental disorders among adults · 2019 MEPS', [['Medicaid',27.61],['Medicare',20.38]], 'B', 40),
  'healthcare/private': () => barChart('Private insurance and direct payments', 'Billions of U.S. dollars spent treating mental disorders among adults · 2019 MEPS', [['Private insurance',33.87],['Out of pocket',15.62]], 'B', 40),
  'hcp/profile': () => metricCards([['6,959','Mental health shortage area designations','Mar 2026','HRSA'],['7,393','Additional practitioners needed to remove designations','Mar 2026','HRSA']]),
  'patients/treatment': () => barChart('How U.S. adults received treatment', 'Past year · 2024 NSDUH · Treatment modes can overlap', [['Any treatment',22.9],['Prescription medication',16.7],['Telehealth',12.8]], '%', 25),
  'patients/profile': () => metricCards([['61.5M','Adults with any mental illness',2024,'SAMHSA NSDUH'],['21.4M','Adults with a major depressive episode',2024,'SAMHSA NSDUH'],['21.2M','Adults with any mental illness and a substance use disorder',2024,'SAMHSA NSDUH']]),
  audience: () => `<div class="panel-grid">${chapters[2][1].slice(1).map(([path, title]) => `<article class="panel"><h2>${link(path, title)}</h2><p>${pages[path][1]}</p></article>`).join('')}</div>`,
  'discussion/search': searchExplorer,
  'industry/market': () => `<div class="chapter-pair">${barChart('Spending by service', 'Billions of U.S. dollars · 2019 MEPS', [['Ambulatory visits',44.21],['Prescription medicines',31.78],['Other',30.54]], 'B', 50)}
    ${barChart('Spending by payer', 'Billions of U.S. dollars · 2019 MEPS', [['Private insurance',33.87],['Medicaid',27.61],['Medicare',20.38],['Out of pocket',15.62],['Other',9.06]], 'B', 50)}</div>`,
  'industry/products': catalog,
};

function render(focus = true) {
  const hash = window.location.hash.slice(1);
  if (hash === 'main-content' && focus) {
    main.focus();
    return;
  }
  active = Object.hasOwn(pages, hash) ? hash : 'intro';
  const [title, summary, detail, references] = pages[active];
  const next = routes[routes.indexOf(active) + 1];
  const journey = active.endsWith('/journey');
  const topicTitle = active.endsWith('/questions') ? 'Interview guide' : 'Research findings and questions';
  const detailPanel = journey
    ? `<section class="journey-fork" aria-label="Care journey">${detail.map(([heading, paragraph]) => `<article class="journey-stage"><h2>${heading}</h2><p class="stage-question">${paragraph}</p></article>`).join('')}</section>`
    : `<section class="panel"><h2>${topicTitle}</h2><div class="science-grid">${detail.map(([heading, paragraph]) => `<section><h3>${heading}</h3><p>${paragraph}</p></section>`).join('')}</div></section>`;
  document.title = title + ' · Perspective';
  main.innerHTML = `<header class="pagehead"><h1>${title}</h1><p>${summary}</p></header>
    ${displays[active]?.() || ''}
    ${detailPanel}
    ${next ? `<div class="chapter-next">${link(next, 'Next · ' + pages[next][0])}</div>` : ''}
    <section class="source-foot"><h2>Sources</h2><ul>${references.map(key => `<li><a href="${sources[key][1]}">${sources[key][0]}</a></li>`).join('')}</ul></section>
    <footer class="report-footer"><span>Perspective · U.S. Research edition</span><button id="export" type="button">Export research data</button></footer>`;
  navigation();
  if (active === 'epidemiology') {
    renderGeography();
    if (!mapSource) {
      fetch('../diabetes-product/us-map.svg')
        .then(response => response.ok ? response.text() : '')
        .then(svg => { if (svg) { mapSource = svg; renderGeography(); } })
        .catch(() => { /* The accessible state table remains available. */ });
    }
  }
  if (active === 'industry/products') renderCatalog();
  window.scrollTo(0, 0);
  if (focus) main.focus({ preventScroll: true });
}

function exportData() {
  const rows = [['Measure','Value','Period','Source'],
    ...metrics.map(([value, label, year, source]) => [label, value, year, source]),
    ...states.flatMap(([name, ...columns]) => ageGroups.map((group, i) => [
      `${name}: Any mental illness, ${group}`,
      `${columns[i * 2]}% (95% CI ${columns[i * 2 + 1].slice(1, -1)})`,
      '2023–2024', sources.states[1],
    ])),
    ...Object.keys(stateCounts).flatMap(name => ageGroups.map((group, index) => {
      const [estimate, lower, upper] = countRecord(name, index);
      return [`${name}: People with any mental illness, ${group}`, `${estimate * 1000} (95% CI ${lower * 1000}–${upper * 1000})`, '2023–2024', sources.stateCounts[1]];
    }))];
  const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'mental-health-research.csv';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function selectOnMap(state) {
  locationFilter = locationFilter === state ? '' : state;
  document.getElementById('place').value = locationFilter;
  renderGeography(state);
}

main.addEventListener('change', event => {
  const control = event.target;
  if (control.id === 'age') {
    age = Number(control.value);
    renderGeography();
  } else if (control.id === 'place') {
    locationFilter = control.value;
    renderGeography();
  } else if (Object.hasOwn(control.dataset, 'compare')) {
    const index = Number(control.dataset.compare);
    if (control.checked) included.add(index);
    else included.delete(index);
    renderComparison();
  }
});

main.addEventListener('click', event => {
  const target = event.target;
  const mapItem = target.closest('[data-state]');
  if (mapItem) selectOnMap(mapItem.dataset.state);
  else if (target.id === 'export') exportData();
  else if (Object.hasOwn(target.dataset, 'measure')) {
    measure = target.dataset.measure;
    main.querySelectorAll('[data-measure]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
    renderGeography();
  } else if (Object.hasOwn(target.dataset, 'resetMap')) {
    locationFilter = '';
    const place = document.getElementById('place');
    place.value = '';
    renderGeography();
    place.focus();
  } else if (Object.hasOwn(target.dataset, 'condition')) {
    conditionIndex = Number(target.dataset.condition);
    main.querySelectorAll('[data-condition]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
    document.getElementById('condition-detail').innerHTML = conditionDetail();
  }
  else if (Object.hasOwn(target.dataset, 'productFilter')) {
    productFilter = groups[Number(target.dataset.productFilter)];
    main.querySelectorAll('[data-product-filter]').forEach(button =>
      button.setAttribute('aria-pressed', String(button === target)));
    renderCatalog();
  } else if (Object.hasOwn(target.dataset, 'clear')) {
    included.clear();
    renderCatalog();
    main.querySelector('[data-product-filter][aria-pressed="true"]').focus();
  }
});
main.addEventListener('keydown', event => {
  const mapItem = event.target.closest('[data-state][role="button"]');
  if (mapItem && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    selectOnMap(mapItem.dataset.state);
  }
});
window.addEventListener('hashchange', () => render());
render(false);
