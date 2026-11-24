import { audiences, chapters, metrics, pages, products, sources } from './content.js';
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
const colors = ['#efebfa', '#d9d0f2', '#b3a4e4', '#826bc8', '#5942a0'];
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

function geography() {
  return `<section class="panel">
    <h2>Past-year mental illness by state</h2><p>Annual average percentages, 2023–2024. SAMHSA modeled estimates for the civilian, noninstitutionalized population.</p>
    <div class="controls">
      <label>Age group<select id="age">${ageGroups.map((label, index) => `<option value="${index}" ${age === index ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      <label>Location<select id="place"><option value="">All states</option>${stateRows.map(([name]) => `<option value="${stateCodes[name]}" ${locationFilter === stateCodes[name] ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
    </div>
    <div id="geography"></div>
  </section>`;
}

function renderGeography(restoreCode) {
  const target = document.getElementById('geography');
  if (!target) return;
  const col = 1 + 2 * age;
  const values = Object.fromEntries(stateRows.map(row => [stateCodes[row[0]], row[col]]));
  const chosen = stateRows.find(([name]) => stateCodes[name] === locationFilter);
  const color = v => colors[Math.min(4, Math.max(0, Math.floor((Number(v) - 20) / 5)))];
  const rows = chosen ? [chosen, national] : [national, ...stateRows];
  target.innerHTML = `<p role="status">${chosen ? `${chosen[0]} · ${chosen[col]}% · 95% CI ${chosen[col + 1]}` : `U.S. modeled estimate · ${national[col]}% · 95% CI ${national[col + 1]}`}</p>
    ${mapSource ? `<div class="map">${mapImage(mapSource, values, locationFilter, 'geo', color, val => val + '%', 'Mental illness prevalence by state')}</div>
    <div class="map-key" aria-label="Map color scale">${['Below 25%', '25 to <30%', '30 to <35%', '35 to <40%', '40% or above'].map((label, i) => `<span style="--swatch:${colors[i]}">${label}</span>`).join('')}</div>` : ''}
    <div class="table-wrap" tabindex="0" role="region" aria-label="State estimates"><table><thead><tr><th scope="col">Location</th><th scope="col">Estimate</th><th scope="col">95% CI</th></tr></thead>
      <tbody>${rows.map(row => `<tr data-selected="${row === chosen}"><th scope="row">${row[0]}</th><td>${row[col]}%</td><td>${row[col + 1]}</td></tr>`).join('')}</tbody></table></div>`;
  if (restoreCode) target.querySelector(`[role="button"][data-state="${restoreCode}"]`)?.focus({ preventScroll: true });
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
  intro: () => metricCards(metrics),
  epidemiology: () => geography() + barChart('Persistent sadness or hopelessness', 'U.S. high school students · CDC Youth Risk Behavior Survey', [['2023',40],['2025',33]]),
  comorbidities: () => barChart('Care for co-occurring mental illness and substance use disorder', 'Adults with both conditions in the past year · 2024 NSDUH', [['Mental health only',41.0],['Substance use only',3.2],['Both',14.5],['Neither',41.2]]),
  healthcare: () => barChart('Treatment among adults with any mental illness', 'U.S. adults, past year · 2024 NSDUH', [['Received',52.1],['No treatment',47.9]]),
  audience: () => `<div class="panel-grid">${chapters[2][1].slice(1).map(([path, title]) => `<article class="panel"><h2>${link(path, title)}</h2><p>${pages[path][1]}</p></article>`).join('')}</div>`,
  'discussion/search': searchExplorer,
  'industry/market': () => barChart('Spending on treatment for mental disorders', 'Billions of dollars · U.S. adults · 2019 MEPS', [['Ages 18–64',88.4],['Ages 65+',18.1]], 'B', 100),
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
  const topicTitle = active.endsWith('/questions') ? 'Interview guide' : 'Research findings and questions';
  document.title = title + ' · Perspective';
  main.innerHTML = `<header class="pagehead"><h1>${title}</h1><p>${summary}</p></header>
    ${displays[active]?.() || ''}
    <section class="panel"><h2>${topicTitle}</h2><div class="topic-list">${detail.map(([heading, paragraph]) =>
      `<article><h3>${heading}</h3><p>${paragraph}</p></article>`).join('')}</div></section>
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
    ]))];
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
