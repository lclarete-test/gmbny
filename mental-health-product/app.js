import { audiences, chapters, conditions, products, sources } from './content.js?v=3';
import { reports } from './evidence.js?v=3';
import { stateCounts } from './state-counts.js?v=3';
import { states } from './states.js?v=3';
import { seriousIllness } from './serious-illness.js?v=3';
import { stateNames } from '../diabetes-product/map-data.js';
import { mapImage } from '../diabetes-product/geography.js';
import { barList, dataTable, lineChart, mountCharts, resetCharts } from '../diabetes-product/charts.js';

const byId = id => document.getElementById(id);
const main = byId('main-content');
const ageGroups = ['Adults 18+', 'Ages 18–25', 'Ages 26+'];
const codeByName = Object.fromEntries(Object.entries(stateNames).map(([code, name]) => [name, code]));
const colors = ['#e3f1ef','#a9d2cc','#65afa6','#337f78','#10564f'];
const number = new Intl.NumberFormat('en-US');
const people = value => value === 0 ? '<500' : number.format(value * 1000);
const layers = {
  ami: {label:'Any mental illness', records:Object.fromEntries(states.map(([name, ...rates])=>[name,[rates,stateCounts[name]]]))},
  smi: {label:'Serious mental illness', records:seriousIllness},
};
const view = { route:'intro', layer:'ami', measure:'count', age:0, state:'', type:0, category:'All', compared:new Set(), svg:'' };
const subtopics = path => {
  const family = path.split('/')[0];
  return (audiences[family] || []).map(([id,label])=>[family+'/'+id,label]);
};
const routes = chapters.flatMap(([,links])=>links.flatMap(([path])=>subtopics(path).length ? subtopics(path).map(([id])=>id) : [path]));
const groupLabel = {
  Research:'Research', 'Healthcare system':'Healthcare', Audience:'Audience',
  'Public discussion':'Public discussion', 'Industry & market':'Market',
};
const navLink = (path, label, active = view.route === path) =>
  `<a href="#${path}" class="${active?'active':''}" ${path===view.route?'aria-current="page"':''}>${label}</a>`;

function navigation() {
  const family = view.route.split('/')[0];
  const activeChapter = chapters.find(([,entries])=>entries.some(([id])=>id.split('/')[0]===family));
  byId('navigation').innerHTML = chapters.map(([title, entries])=>{
    const group = entries.map(([path,label])=>path.startsWith(family+'/') && audiences[family]
      ? `<a href="#${path}" class="in-section">${label}</a><div class="audience-pages">${subtopics(path).map(row=>navLink(...row)).join('')}</div>`
      : navLink(path,label)).join('');
    return title==='Research' ? group : `<section class="nav-cluster"><h2>${title}</h2>${group}</section>`;
  }).join('');
  const mobileChapters = chapters.map(chapter=>navLink(chapter[1][0][0],groupLabel[chapter[0]],chapter===activeChapter));
  const mobileEntries = activeChapter[1].map(([path,label])=>navLink(path,label,path.split('/')[0]===family && (path===view.route || !!audiences[family])));
  byId('mobile-navigation').innerHTML = `<div class="mobile-chapters">${mobileChapters.join('')}</div>
    <div class="mobile-sub">${mobileEntries.join('')}</div>
    ${audiences[family] ? `<div class="mobile-topics">${subtopics(view.route).map(row=>navLink(...row)).join('')}</div>` : ''}`;
}

function formatValue(value, unit) {
  return unit === '$B' ? '$'+number.format(value)+'B' : number.format(value)+unit;
}
function sourceLink(key) {
  const [label,url] = sources[key];
  return `<a href="${url}">${label}</a>`;
}
function evidencePanel(block) {
  let body;
  if (block.series) {
    return lineChart({
      title:block.title, labels:block.labels, series:block.series,
      format:'percent', digits:1, unit:block.period + ' · Percent', note:block.note,
    }).replace('</article>', `<p class="evidence-source">${sourceLink(block.source)}</p></article>`);
  } else if (block.headers) {
    body = dataTable(block.headers,block.rows,block.title);
  } else {
    const max = block.unit === '%' ? 100 : Math.ceil(Math.max(...block.rows.map(([,value])=>value))/10)*10;
    const display = value => formatValue(value,block.unit);
    body = barList(block.rows,{max,format:display,color:'#6554a9'})
      + `<details><summary>View data table</summary>${dataTable(['Measure','Estimate'],block.rows.map(([label,value])=>[label,display(value)]),block.title)}</details>`;
  }
  return `<section class="panel evidence-panel">
    <h2>${block.title}</h2><p class="axis-unit">${block.period}</p>
    ${body}${block.note ? `<p class="reading">${block.note}</p>` : ''}
    <p class="evidence-source">${sourceLink(block.source)}</p>
  </section>`;
}

function stateRecord(name, layer = view.layer, age = view.age) {
  const [rates, counts] = layers[layer].records[name];
  return { rate:rates[age*2], interval:rates[age*2+1], count:counts[age*3], low:counts[age*3+1], high:counts[age*3+2] };
}
function buttonTabs(items, key, active, label) {
  return `<div class="epi-tabs mh-tabs" role="group" aria-label="${label}">${items.map(([id,name])=>
    `<button type="button" data-${key}="${id}" aria-pressed="${String(id)===String(active)}">${name}</button>`).join('')}</div>`;
}
function mapPanel() {
  return `<section class="panel condition-map"><h2>Mental illness by state</h2>
    <p class="axis-unit">2023–2024 annual average · SAMHSA modeled estimates · Civilian, noninstitutionalized population</p>
    <div class="mh-map-toolbar">
      ${buttonTabs(Object.entries(layers).map(([id,{label}])=>[id,label]),'layer',view.layer,'Mental illness measure')}
      <label class="picker"><span>Age group</span><select id="map-age">${ageGroups.map((label,i)=>`<option value="${i}" ${i===view.age?'selected':''}>${label}</option>`).join('')}</select></label>
      <label class="picker"><span>Location</span><select id="map-state"><option value="">All states</option>${Object.keys(codeByName).sort().map(name=>`<option value="${codeByName[name]}" ${codeByName[name]===view.state?'selected':''}>${name}</option>`).join('')}</select></label>
    </div>
    ${buttonTabs([['count','Number of people'],['percent','Percent of population']],'measure',view.measure,'Map display')}
    <div id="map-results"></div>
    <p class="reading">Each rate uses the population of the selected age group in that location. Serious mental illness is a subset of any mental illness. Counts are published to the nearest thousand.</p>
    <p class="evidence-source">${sourceLink('stateCounts')} · ${sourceLink('states')}</p>
  </section>`;
}
function renderMap(focusCode) {
  const panel = byId('map-results');
  if (!panel) return;
  const isCount = view.measure==='count';
  const isSerious = view.layer==='smi';
  const {label} = layers[view.layer];
  const cuts = isCount ? (isSerious?[25,50,125,250]:[100,250,500,1000])
    : isSerious ? (view.age===1?[8,9,10,11]:[4,5,6,7]) : view.age===1?[30,33,36,39]:[19,22,25,28];
  const format = value => isCount ? people(value) : Number(value).toFixed(2)+'%';
  const ranking = Object.keys(codeByName).map(name=>{
    const record=stateRecord(name);
    return [name, isCount ? record.count : Number(record.rate)];
  }).sort((a,b)=>b[1]-a[1]);
  const valueByCode = Object.fromEntries(ranking.map(([name,value])=>[codeByName[name],value]));
  const color = value => colors[cuts.filter(cut=>value>=cut).length];
  const name = stateNames[view.state] || 'Total U.S.';
  const selected = stateRecord(name);
  const rank = view.state ? 1+ranking.filter(([,value])=>value>valueByCode[view.state]).length : 0;
  const rows = (view.state?[name,'Total U.S.']:['Total U.S.',...ranking.map(([name])=>name)]).map(name=>{
    const r=stateRecord(name);
    return [name,people(r.count),people(r.low)+'–'+people(r.high),r.rate+'%',r.interval];
  });
  const legend = ['Below '+format(cuts[0]),...cuts.slice(1).map((cut,i)=>format(cuts[i])+' to <'+format(cut)),format(cuts.at(-1))+' or more'];
  const extremes = [['Highest estimate',ranking[0]],['Lowest estimate',ranking.at(-1)]];
  panel.innerHTML = `${view.svg ? `<div class="case-outline">${mapImage(view.svg,valueByCode,view.state,'geo',color,format,label+' by state')}</div>
    <div class="atlas-key" aria-label="Map color scale">${legend.map((text,i)=>`<span><i style="background:${colors[i]}"></i>${text.replaceAll('<','&lt;')}</span>`).join('')}</div>` : ''}
    <div class="geo-current" aria-live="polite"><strong>${view.state?name:'United States'}</strong>
      <span>${people(selected.count).replaceAll('<','&lt;')} people · ${selected.rate}% · ${ageGroups[view.age]}${rank?' · Rank '+rank+' of 51':''}</span>
      <small>95% CI · ${people(selected.low).replaceAll('<','&lt;')}–${people(selected.high)} people · ${selected.interval}%</small>
    </div><dl class="case-ranks">${extremes.map(([title,[name,value]])=>`<div><dt>${title}</dt><dd>${name} · ${format(value).replaceAll('<','&lt;')}</dd></div>`).join('')}</dl>
    <details ${panel.querySelector('details')?.open ? 'open' : ''}><summary>State estimates and 95% confidence intervals</summary>
      ${dataTable(['Location','Estimated people','Count 95% CI','Prevalence','Prevalence 95% CI'],rows,label+' by state')}
    </details>`;
  if (focusCode) panel.querySelector(`[data-state="${focusCode}"][role="button"]`)?.focus({preventScroll:true});
}

function typeDetail() {
  const item = conditions[view.type];
  return `<div class="condition-summary"><div><h3>${item.name}</h3><p>${item.summary}</p></div>
    <div class="condition-estimate">${item.value?`<strong>${item.value}</strong>`:''}<b>${item.measure}</b>
    <span>${item.count?item.count+' · ':''}${item.time}</span><a href="${item.source}">Estimate and methods</a></div></div>`;
}
function conditionPanel() {
  return `<section class="panel cs-differences"><h2>Diagnoses and U.S. prevalence</h2>
    <p class="reading">Past-year adult estimates where available. Survey benchmarks use different periods and case definitions. People may meet criteria for more than one condition.</p>
    ${buttonTabs(conditions.map((item,i)=>[i,item.measure]),'type',view.type,'Condition')}
    <div id="type-detail" aria-live="polite">${typeDetail()}</div>
    ${dataTable(['Condition measured','U.S. adults','Survey or source period'],conditions.map(item=>[item.measure,item.value||'See source summary',item.time]),'U.S. prevalence by condition')}
    <p class="reading">SAMHSA’s “serious mental illness” is an impairment category that can span diagnoses. Its “any mental illness” estimate excludes substance use and developmental disorders.</p>
  </section>`;
}

const searchSets = [
  ['Finding care',['therapist near me','online therapy','psychiatrist near me']],
  ['Symptoms',['depression symptoms','anxiety symptoms','panic attack']],
  ['Cost and coverage',['therapy cost','therapy insurance','sliding scale therapy']],
  ['Portuguese-language care',['terapia online','psicólogo brasileiro','terapia em português']],
];
function searchPanel() {
  return `<section class="panel"><h2>U.S. searches over the past 12 months</h2><div class="science-grid">
  ${searchSets.map(([label,terms])=>{
    const params = new URLSearchParams({geo:'US',date:'today 12-m',q:terms.join(',')});
    return `<section><h3><a href="https://trends.google.com/trends/explore?${params}">${label}</a></h3><p>${terms.join(' · ')}</p></section>`;
  }).join('')}</div></section>`;
}
const categories = ['All',...new Set(products.map(product=>product[1]))];
function catalogPanel() {
  return `<section class="panel"><h2>Product catalog</h2>
    ${buttonTabs(categories.map((name,index)=>[index,name]),'category',categories.indexOf(view.category),'Product category')}
    <div id="product-list" class="mh-grid"></div><div id="comparison"></div></section>`;
}
function renderProducts() {
  byId('product-list').innerHTML = products.map(([name,type,access,role,source],i)=>
    view.category!=='All' && view.category!==type ? '' : `<article class="product-card"><h3>${name}</h3><small>${type}</small>
    <p>${role}</p><p><b>Access</b> · ${access}</p><a href="${sources[source][1]}">Product record</a>
    <label><input type="checkbox" data-compare="${i}" ${view.compared.has(i)?'checked':''}> Compare</label></article>`).join('');
  renderComparison();
}
function renderComparison() {
  byId('comparison').innerHTML = view.compared.size ? `<h3>Product comparison</h3>${dataTable(['Product','Category','Access','Role'],products.filter((_,i)=>view.compared.has(i)).map(row=>row.slice(0,4)),'Product comparison')}` : '';
}

function exportData() {
  const rows = [['Panel','Measure','Period or series','Value','Count 95% CI','Prevalence','Prevalence 95% CI','Source']];
  const unique = new Set();
  for (const report of Object.values(reports)) for (const block of report.blocks||[]) {
    if (unique.has(block)) continue;
    unique.add(block);
    if (block.series) block.series.forEach(([label,values])=>values.forEach((value,i)=>rows.push([block.title,label,block.labels[i],value+'%','','','',sources[block.source][1]])));
    else block.rows.forEach(([label,...values])=>rows.push([block.title,label,block.period,block.headers?values.map((value,i)=>block.headers[i+1]+': '+value).join(' | '):formatValue(values[0],block.unit),'','','',sources[block.source][1]]));
  }
  for (const [layer, entry] of Object.entries(layers)) for (const name of Object.keys(entry.records)) {
    ageGroups.forEach((group,index)=>{
      const r=stateRecord(name,layer,index);
      rows.push([entry.label,name+' · '+group,'2023–2024',people(r.count),people(r.low)+'–'+people(r.high),r.rate+'%',r.interval,sources.stateCounts[1]+' | '+sources.states[1]]);
    });
  }
  conditions.forEach(item=>rows.push(['Condition benchmark',item.measure,item.time,item.value||'','','','',item.source]));
  const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='mental-health-research.csv';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

const specials = {map:mapPanel,conditions:conditionPanel,search:searchPanel,catalog:catalogPanel};
let mapRequest;
function render(moveFocus = true) {
  const hash = window.location.hash.slice(1);
  if (hash==='main-content') { main.focus(); return; }
  view.route = Object.hasOwn(reports,hash) ? hash : 'intro';
  const report = reports[view.route];
  const next = routes[routes.indexOf(view.route)+1];
  resetCharts();
  document.title = report.title+' · Perspective';
  main.innerHTML = `<header class="pagehead"><h1>${report.title}</h1><p>${report.summary}</p></header>
    ${report.stats ? `<section class="panel cs-impact" aria-label="Key figures">${report.stats.map(([value,label,period])=>`<div><strong>${value}</strong><p>${label}</p><small>${period}</small></div>`).join('')}</section>` : ''}
    ${report.special ? specials[report.special]() : ''}
    ${(report.blocks||[]).map(evidencePanel).join('')}
    ${report.cards ? `<nav class="mh-grid" aria-label="Explore the research">${report.cards.map(([path,text])=>`<a class="panel chapter-card" href="#${path}">${text}</a>`).join('')}</nav>` : ''}
    ${report.links ? `<section class="source-foot"><h2>Additional sources</h2><ul>${report.links.map(key=>`<li>${sourceLink(key)}</li>`).join('')}</ul></section>` : ''}
    ${next ? `<a class="chapter-next" href="#${next}">Next · ${reports[next].title}</a>` : ''}
    <footer class="report-footer"><span>Perspective · U.S. research edition</span><button id="export" type="button">Export research data</button></footer>`;
  navigation();
  mountCharts(main);
  if (report.special==='map') {
    renderMap();
    if (!view.svg && !mapRequest) {
      mapRequest=fetch('../diabetes-product/us-map.svg').then(response=>response.ok?response.text():'')
        .then(text=>{view.svg=text; if (view.route==='epidemiology') renderMap();})
        .catch(()=>{}).finally(()=>{mapRequest=null;});
    }
  }
  if (report.special==='catalog') renderProducts();
  window.scrollTo(0,0);
  if (moveFocus) main.focus({preventScroll:true});
}

function pickMapState(code) {
  view.state=view.state===code?'':code;
  byId('map-state').value=view.state;
  renderMap(code);
}

main.addEventListener('change',({target})=>{
  if (target.id==='map-age') { view.age=Number(target.value); renderMap(); }
  else if (target.id==='map-state') { view.state=target.value; renderMap(); }
  else if (Object.hasOwn(target.dataset,'compare')) {
    const index=Number(target.dataset.compare);
    if (target.checked) view.compared.add(index);
    else view.compared.delete(index);
    renderComparison();
  }
});
main.addEventListener('click',({target})=>{
  const state=target.closest('[data-state]');
  if (state) { pickMapState(state.dataset.state); return; }
  if (target.id==='export') { exportData(); return; }
  for (const key of ['layer','measure','type','category']) {
    if (!Object.hasOwn(target.dataset,key)) continue;
    const value=target.dataset[key];
    view[key]=key==='type'?Number(value):key==='category'?categories[Number(value)]:value;
    main.querySelectorAll(`[data-${key}]`).forEach(button=>button.setAttribute('aria-pressed',String(button===target)));
    if (key==='category') renderProducts();
    else if (key==='type') byId('type-detail').innerHTML=typeDetail();
    else renderMap();
    return;
  }
});
main.addEventListener('keydown',event=>{
  const state=event.target.closest('[data-state][role="button"]');
  if (state && ['Enter',' '].includes(event.key)) {
    event.preventDefault();
    pickMapState(state.dataset.state);
  }
});
window.addEventListener('hashchange',()=>render());
render(false);
