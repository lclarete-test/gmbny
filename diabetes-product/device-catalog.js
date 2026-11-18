import {escapeHTML, sourcesFooter} from './charts.js';
import {deviceProducts, deviceSources, deviceNotes, deviceConnections} from './device-products.js';

export {deviceProducts as catalogProducts};
export const deviceById=new Map(deviceProducts.map(p=>[p.id,p]));
export const deviceTasks={
  spot:{name:'Check glucose now',tools:'Meter and strips',about:'A fingerstick meter reads glucose in a drop of blood. Each check gives one value.'},
  sensor:{name:'Follow a glucose trend',tools:'Wearable sensors',about:'A continuous glucose monitor estimates glucose in the fluid under the skin. Repeated readings show the direction it is moving.'},
  delivery:{name:'Give insulin',tools:'Syringes, pens and pumps',about:'People can inject insulin with a syringe or pen, or have a pump deliver it on a programmed schedule.'},
  automated:{name:'Adjust insulin automatically',tools:'Connected dosing systems',about:'A compatible sensor and pump exchange data. Software uses glucose readings to adjust insulin delivery.'}
};
const systems={
  omni:{name:'Omnipod 5',sensor:'g7-10',software:'SmartAdjust',pump:'Omnipod 5 Pod',behavior:'SmartAdjust uses sensor readings to adjust insulin every five minutes. The wearer still gives mealtime boluses.'},
  tandem:{name:'Tandem with Control-IQ+',sensor:'libre',software:'Control-IQ+',pump:'t:slim X2 pump',behavior:'Control-IQ+ uses predicted glucose to adjust insulin on a compatible pump. The wearer still manages mealtime doses.'},
  med:{name:'MiniMed 780G',sensor:'instinct',software:'SmartGuard',pump:'MiniMed 780G pump',behavior:'SmartGuard uses sensor readings for background insulin and automatic corrections. The wearer still enters meals.'}
};
const populations=[['all','All populations'],['t1','Type 1 diabetes'],['t2','Type 2 diabetes'],['gest','Gestational diabetes'],['pre','Prediabetes']];
const accessOptions=[['all','All access types'],['rx','Prescription'],['otc','Over the counter']];
const pathLink=id=>'#industry/products/task/'+id;
const productLink=id=>'#industry/products/item/'+id;
const clean=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const glossary={spot:'blood glucose monitor glucometer meter strips fingerstick bgm',sensor:'continuous glucose monitoring monitor cgm sensor wearable',delivery:'insulin delivery injection vial pen pump',automated:'hybrid closed loop aid automated insulin delivery pump algorithm'};
function options(rows,selected){
  return rows.map(([id,label])=>`<option value="${id}"${id===selected?' selected':''}>${escapeHTML(label)}</option>`).join('');
}
export function filterDevices(view={}) {
  const query=clean(view.search).split(' ').filter(Boolean);
  const category=view.category||'all', access=view.deviceAccess||'all', pop=view.deviceType||'all';
  return deviceProducts.filter(p=>{
    if(category!=='all'&&p.path!==category)return false;
    if(access!=='all'&&p.access!==access)return false;
    if(pop!=='all'&&!p.type.includes(pop))return false;
    const text=clean([p.name,p.brand,p.kind,p.access,p.accessText,p.audience,p.use,p.needs,p.action,p.cycle,deviceTasks[p.path].name,glossary[p.path]].join(' '));
    return query.every(word=>text.includes(word));
  });
}
function taskPicker(category) {
  return `<nav class="dv-tasks" aria-label="Browse devices by task">${Object.entries(deviceTasks).map(([id,t])=>`<a href="${pathLink(id)}" class="dv-task dv-${id}" ${category===id?'aria-current="true"':''}>
    <img alt="" width="96" height="60" src="media/industry/${id}.webp"><strong>${t.name}</strong><span>${t.tools}</span></a>`).join('')}</nav>`;
}
export function connectionDiagram(id='omni',sensorId) {
  const model=Object.hasOwn(systems,id)?id:'omni', s=systems[model];
  const pairs=deviceConnections.filter(c=>c.system===model);
  const pair=pairs.find(c=>c.sensor===sensorId)||pairs.find(c=>c.sensor===s.sensor);
  const sensor=deviceById.get(pair.sensor);
  const segment=(label,part,href)=>`<div class="dv-part"><span>${label}</span>${href?`<a href="${href}">${escapeHTML(part)}</a>`:`<b>${escapeHTML(part)}</b>`}</div>`;
  const sensorSelector=pairs.length>1?`<label>Compatible sensor <select id="dv-sensor">${options(pairs.map(c=>[c.sensor,deviceById.get(c.sensor).name]),pair.sensor)}</select></label>`:'';
  return `<div class="dv-system-head"><h2>How the pieces work together</h2><div class="dv-system-choices"><label>System <select id="dv-system">${options(Object.entries(systems).map(([key,v])=>[key,v.name]),model)}</select></label>${sensorSelector}</div></div>
    <div class="dv-flow" aria-label="Sensor to software to pump">
      ${segment('Sensor measures glucose',sensor.name,productLink(sensor.id))}<i aria-hidden="true">→</i>
      ${segment('Software adjusts delivery',s.software,productLink(model))}<i aria-hidden="true">→</i>
      ${segment('Pump delivers insulin',s.pump,model==='tandem'?null:productLink(model))}</div>
    <p>${escapeHTML(s.behavior)} <span>${escapeHTML(pair.detail)}</span></p>`;
}
function productRow(p,view) {
  const opened=view.openProduct===p.id;
  return `<div class="dv-row" id="catalog-${p.id}"><details ${opened?'open':''}>
    <summary><span class="dv-product-name"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.brand)} · ${escapeHTML(p.kind)}</small></span>
      <span class="dv-use">${escapeHTML(p.use)}</span><span class="dv-access">${p.access==='otc'?'Over the counter':'Prescription'}</span></summary>
    <dl class="dv-spec"><div><dt>Who can use it</dt><dd>${escapeHTML(p.audience)}</dd></div>
      <div><dt>What it needs</dt><dd>${escapeHTML(p.needs)}</dd></div><div><dt>What the person does</dt><dd>${escapeHTML(p.action)}</dd></div>
      <div><dt>Timing or replacement</dt><dd>${escapeHTML(p.cycle)}</dd></div><div><dt>How to get it</dt><dd>${escapeHTML(p.accessText)}</dd></div></dl></details>
    <label class="dv-compare"><input type="checkbox" data-compare="${p.id}" aria-label="Compare ${escapeHTML(p.name)}" ${view.selected?.has(p.id)?'checked':''}> Compare</label></div>`;
}
export function deviceResults(view,matches=filterDevices(view)) {
  if(!matches.length)return `<div class="dv-empty"><p>No products match this combination.</p><button type="button" data-clear-device-filters>Clear filters</button>${view.category!=='all'?' <a href="#industry/products">Browse all tasks</a>':''}</div>`;
  return Object.entries(deviceTasks).map(([id,t])=>{
    const rows=matches.filter(p=>p.path===id);
    if(!rows.length)return '';
    return `<section class="dv-group dv-${id}" aria-label="${t.name}">${view.category==='all'||!view.category?`<h3><i aria-hidden="true"></i>${t.name}</h3>`:''}${rows.map(p=>productRow(p,view)).join('')}</section>`;
  }).join('');
}
export function refreshDeviceResults(view) {
  const matches=filterDevices(view);
  document.getElementById('device-results').innerHTML=deviceResults(view,matches);
  document.getElementById('device-count').textContent=matches.length+' '+(matches.length===1?'product':'products');
}
export function catalogPage(view={}) {
  const category=Object.hasOwn(deviceTasks,view.category)?view.category:'all';
  const matches=filterDevices(view);
  return `<header class="pagehead explore-head"><h1>Devices and products</h1><p>Glucose monitors measure. Pens and pumps deliver insulin. Connected systems use a glucose reading to decide how much insulin the pump delivers.</p></header>
    ${taskPicker(category)}
    ${category==='all'||category==='automated'?`<section class="panel dv-system" id="device-system">${connectionDiagram(view.systemExample,view.sensorExample)}</section>`:''}
    <section class="panel dv-catalog" id="product-catalog"><div class="dv-catalog-head"><h2>${category==='all'?'All products':deviceTasks[category].name}</h2><span id="device-count" role="status">${matches.length} ${matches.length===1?'product':'products'}</span>${category!=='all'?'<a href="#industry/products">View all tasks</a>':''}</div>
    ${category==='all'?'':`<p class="dv-task-intro">${deviceTasks[category].about}</p>`}
    <div class="dv-filters"><label>Find a product<input id="product-search" type="search" placeholder="Product, maker or feature" value="${escapeHTML(view.search||'')}"></label>
      <label>Population<select id="device-type">${options(populations,view.deviceType||'all')}</select></label>
      <label>Access<select id="device-access">${options(accessOptions,view.deviceAccess||'all')}</select></label></div>
    <div id="device-results">${deviceResults({...view,category},matches)}</div></section>
    <nav class="dv-linkout" aria-label="Device costs"><a href="#industry/market/labs">Compare test, sensor and supply prices →</a></nav>`+
    sourcesFooter([...deviceSources,['NIDDK · How a continuous glucose monitor works','https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring'],...deviceConnections.map(c=>['Manufacturer · '+systems[c.system].name+' sensor compatibility',c.url])],deviceNotes);
}

export function compareCatalog(ids) {
  const selected=[...ids].map(id=>deviceById.get(id)).filter(Boolean).slice(0,3);
  const fields=[['Task',p=>deviceTasks[p.path].name],['Device or component',p=>p.kind],['Company',p=>p.brand],['What it does',p=>p.use],['Who can use it',p=>p.audience],['What it needs',p=>p.needs],['What the person does',p=>p.action],['Timing or replacement',p=>p.cycle],['Access',p=>p.accessText]];
  return `<h2>Compare products</h2><div class="industry-prose-table dv-comparison"><table aria-label="Device comparison"><thead><tr><th scope="col">Feature</th>${selected.map(p=>`<th scope="col">${escapeHTML(p.name)}</th>`).join('')}</tr></thead>
    <tbody>${fields.map(([name,get])=>`<tr><th scope="row">${name}</th>${selected.map(p=>`<td data-column="${escapeHTML(p.name)}">${escapeHTML(get(p))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function deviceExportRows() {
  const rows=deviceProducts.flatMap(p=>[['Device task',deviceTasks[p.path].name],['Component',p.kind],['Who can use it',p.audience],['Access',p.accessText],['What it does',p.use],['Required items',p.needs],['User action',p.action],['Timing or replacement',p.cycle]].map(([field,v])=>['Device catalog',p.name,field,v,p.brand+' · U.S. labeling',p.url]));
  return rows.concat(deviceConnections.map(c=>['Device compatibility',deviceById.get(c.system).name,deviceById.get(c.sensor).name,c.detail,'Selected U.S. configuration',c.url]));
}
