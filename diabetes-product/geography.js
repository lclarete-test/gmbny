import {lineChart,barList,escapeHTML} from './charts.js';
import {links} from './evidence.js';
import {stateNames,medicalCosts,labelXY} from './map-data.js';

const colors=['#e3f1ef','#a9d2cc','#65afa6','#337f78','#10564f'];
const small={VT:[848,79],NH:[933,110],MA:[949,145],RI:[949,170],CT:[943,197],NJ:[918,224],DE:[900,253],MD:[889,281],DC:[872,307]};
function mapImage(svg,values,selected,mode,fill,format,title='Medical spending by state') {
  const dataKey=mode==='geo'?'data-state':'data-cost-state';
  const attrs=(id)=>`${dataKey}="${id}" class="atlas-state ${id===selected?'selected':''}" tabindex="0" role="button" aria-label="${stateNames[id]}, ${format(values[id])}" aria-pressed="${selected===id}" style="fill:${fill(values[id])}"`;
  const outlines=svg.replace(/<svg [^>]*>/,`<svg class="atlas-map" viewBox="168 95 979 608" role="group" aria-label="${escapeHTML(title)}"><defs><pattern id="map-no-data" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#eef0f4"/><path d="M-1,1 1,-1 M0,7 7,0 M6,8 8,6" stroke="#b7bfcd" stroke-width="1.1"/></pattern></defs>`)
    .replace(/<(path|g) id="([A-Z]{2})"/g,(_,tag,id)=>`<${tag} ${attrs(id)}`);
  const labels=Object.entries(labelXY).map(([id,[x,y]])=>{
    const [lx,ly]=small[id]||[x,y];
    const leader=small[id]?`<path d="M${x+174},${y+100} L${lx+174},${ly+100}" class="state-leader"/>`:'';
    return leader+`<text x="${lx+174}" y="${ly+100}" class="state-abbr" ${dataKey}="${id}" aria-hidden="true">${id}</text>`;
  }).join('');
  return outlines.replace('</svg>',labels+'</svg>');
}
function pickState(selected,mode) {
  return `<label class="picker"><span>Location</span><select data-picker="${mode}" aria-label="${mode==='geo'?'Epidemiology':'Spending'} location"><option value="">${mode==='geo'?'All states':'United States'}</option>${Object.entries(stateNames).sort((a,b)=>a[1].localeCompare(b[1])).map(([id,n])=>`<option value="${id}" ${selected===id?'selected':''}>${n}</option>`).join('')}</select></label>`;
}
const layers={
  all:{label:'All diagnosed diabetes',subject:'Diagnosed diabetes',short:'All diagnosed',cuts:[8.5,10,11.5,13],digits:1},
  type1:{label:'Type 1 diabetes',subject:'Diagnosed type 1 diabetes',short:'Type 1',cuts:[0.45,0.6,0.75,0.9],digits:2},
  type2:{label:'Type 2 diabetes',subject:'Diagnosed type 2 diabetes',short:'Type 2',cuts:[7.5,8.5,9.5,10.5],digits:1},
  prediabetes:{label:'Reported prediabetes',subject:'Reported prediabetes',short:'Prediabetes',cuts:[9.5,10.5,12,14],digits:1}
};
export const hasStateLayer=key=>Object.hasOwn(layers,key);
const percent=(value,digits=1)=>Number.isFinite(value)?value.toFixed(digits)+'%':'No estimate';
const locations=Object.keys(stateNames);
function allDiagnosed(resources) {
  const years=Array.from({length:25},(_,i)=>2000+i),medianAnnual={},states={};
  for(const id of locations) {
    const p=resources.profiles[id]||{};
    states[id]={value:p.adjusted,groups:p.groups,crude:p.crude,count:p.count,annual:{}};
  }
  for(const entry of resources.states) {
    const target=entry.state==='All'?medianAnnual:states[entry.state]?.annual;
    if(target)target[entry.year]=entry.estimate;
  }
  return {states,period:2024,years,medianAnnual,sourceUrl:links.states,
    unit:'Age-adjusted share of adults 18+ with a reported diabetes diagnosis, all types combined.'};
}
function legend(cuts,mark) {
  return cuts.map((cut,i)=>i===0?'Below '+mark(cut):mark(cuts[i-1])+' to <'+mark(cut)).concat(mark(cuts.at(-1))+' or higher','No estimate');
}
function rankReference(kind,entry,display) {
  const top=kind==='highest',marker=top?'↑':'↓';
  return `<div class="geo-reference geo-${kind}"><dt><i aria-hidden="true">${marker}</i><span>${top?'Highest':'Lowest'}<b>${escapeHTML(entry.names)}</b></span></dt><dd>${display(entry.value)}</dd></div>`;
}
function distinctExtreme(rows,fromTop) {
  const value=(fromTop?rows[0]:rows.at(-1))[1];
  const same=rows.filter(([,v])=>v===value).map(([id])=>stateNames[id]);
  return {value,names:same.join(', ')};
}
function stateReadout(source,rows,chosen,display,year,values,countMode) {
  const region=source.states[chosen],value=values[chosen];
  const stateRates=rows.filter(([id])=>id!=='DC');
  const mean=stateRates.length?stateRates.reduce((sum,[,v])=>sum+v,0)/stateRates.length:null;
  const rank=Number.isFinite(value)?1+rows.filter(([,v])=>v>value).length:null;
  const ci=region?.annualCI?.[year]||(year===Number(source.period)?region?.ci:null);
  const context=rank?'Rank '+rank+' of '+rows.length+' reporting jurisdictions':region?.status==='Suppressed'&&year===Number(source.period)?'Withheld for statistical reliability.':'This jurisdiction has no published estimate for '+year+'.';
  const last=chosen&&value==null?(source.years||[]).filter(y=>Number.isFinite(region?.annual?.[y])).at(-1):null;
  const selection=chosen?`<div class="geo-current"><span>${stateNames[chosen]}</span><strong>${display(value)}</strong><small>${context}${Array.isArray(ci)&&ci.every(Number.isFinite)?(countMode?' · 95% interval ':' · 95% CI ')+display(ci[0])+' to '+display(ci[1]):''}</small>${last?`<button type="button" data-geo-year="${last}">See the ${last} estimate →</button>`:''}</div>`:'';
  const highLow=rows.length?rankReference('highest',distinctExtreme(rows,true),display)+rankReference('lowest',distinctExtreme(rows,false),display):'';
  const median=source.medianAnnual?.[year];
  return `<aside class="atlas-readout geo-readout" aria-label="State comparisons">${selection}<dl>
    <div class="geo-reference geo-mean"><dt><i aria-hidden="true">≈</i><span>${countMode?'United States · modeled cases':'Average across reporting states'}</span></dt><dd>${display(countMode?source.national.value:mean)}</dd></div>
    ${Number.isFinite(median)?`<div class="geo-median"><dt>CDC state median</dt><dd>${display(median)}</dd></div>`:''}
    ${highLow}</dl><p class="geo-coverage">${rows.length} of 51 jurisdictions with estimates · ${year}</p></aside>`;
}
function stateGroups(source,id,metric){
  const rec=source.states[id];
  const rawGroups=rec?.groups;
  if(!rawGroups||!Number.isFinite(rec.value))return '';
  const groups=Object.entries(rawGroups).map(([name,rows])=>[name,Object.entries(rows).filter(([,n])=>Number.isFinite(n))]).filter(([,rows])=>rows.length);
  if(!groups.length)return '';
  const order={'Age':['18-44','45-64','65-74','75+'],'Sex':['Female','Male'],'Education':['< High School','High School','> High School']};
  const nice=name=>({'< High School':'Less than high school','> High School':'Beyond high school','High School':'High school'}[name]||name.replace(/(\d)-(\d)/g,'$1–$2'));
  const values=groups.flatMap(([,rows])=>rows.map(([,n])=>n));
  const max=Math.max(1,Math.ceil(Math.max(...values)));
  const count=Number.isFinite(rec.count)&&Number.isFinite(rec.crude)?`<p class="reading">${Math.round(rec.count).toLocaleString('en-US')} adults, or ${percent(rec.crude)} of the state's adult population before age adjustment.</p>`:'';
  return `<article class="panel geo-demographics"><div class="section-top"><h2>${stateNames[id]} by demographic group</h2><span class="axis-unit">${layers[metric].subject} · ${source.period}</span></div>${count}
    <div class="matrix-grid state-groups">${groups.map(([name,rows])=>{
      if(order[name]&&rows.every(([key])=>order[name].includes(key)))rows.sort(([a],[b])=>order[name].indexOf(a)-order[name].indexOf(b));
      return `<section><h3>${escapeHTML(name)}</h3>${barList(rows.map(([key,value])=>[nice(key),value]),{max,format:v=>percent(v,layers[metric].digits)})}</section>`;
    }).join('')}</div></article>`;
}
function localTrend(source,id,metric,start,year,unit){
  const years=source.years.map(Number).filter(y=>metric!=='all'||y>=start), rec=source.states[id];
  const values=years.map(y=>rec?.annual?.[y]??null);
  if(!values.some(Number.isFinite))return '';
  const median=years.map(y=>source.medianAnnual?.[y]??null);
  const series=[[stateNames[id],values]];
  if(median.some(Number.isFinite))series.push(['CDC state median',median]);
  const controls=metric==='all'?`<div class="period-picker" role="group" aria-label="State history period">${[2000,2011,2020].map(y=>`<button type="button" data-period="${y}" aria-pressed="${start===y}">${y}–2024</button>`).join('')}</div>`:'';
  return lineChart({title:stateNames[id]+' · '+layers[metric].subject.toLowerCase()+' over time',unit,labels:years,series,initialIndex:years.includes(year)?years.indexOf(year):years.length-1,intervals:[years.map(y=>rec?.annualCI?.[y]??null)],format:'percent',digits:layers[metric].digits,
    annotate:true,controls,colors:['#176e66','#7668a2'],breakAt:metric==='all'?[years.indexOf(2011)]:[],source:source.sourceUrl});
}
export function stateGeography(resources,view){
  const metric=hasStateLayer(view.geoMetric)?view.geoMetric:'all';
  const layer=layers[metric],countMode=metric==='type1'&&view.geoMeasure==='count';
  const source=countMode?resources.type1Counts:metric==='all'?allDiagnosed(resources):resources.conditions[metric];
  const cuts=countMode?[5000,15000,30000,60000]:layer.cuts;
  const display=countMode?v=>Number.isFinite(v)?Math.round(v).toLocaleString('en-US'):'No estimate':v=>percent(v,layer.digits);
  const subject=countMode?'Modeled type 1 cases, all ages':layer.subject;
  const measurePicker=metric==='type1'?`<label class="picker"><span>Measure</span><select data-picker="geo-measure" aria-label="Type 1 map measure"><option value="rate" ${countMode?'':'selected'}>Adult prevalence (%)</option><option value="count" ${countMode?'selected':''}>Modeled cases, all ages</option></select></label>`:'';
  const chosen=Object.hasOwn(stateNames,view.state)?view.state:null;
  const year=source.years?.includes(view.geoYear)?view.geoYear:Number(source.period);
  const current=year===Number(source.period);
  const unit=countMode?'Estimated people living with type 1 diabetes, including children. Counts depend on population size.':metric==='prediabetes'?'Age-adjusted share of adults 18+ who were told they had prediabetes and reported no diabetes diagnosis.':'Age-adjusted share of all adults aged 18 and older.';
  const yearPicker=countMode?'':`<label class="picker"><span>Year</span><select data-picker="geo-year" aria-label="State map year">${[...source.years].reverse().map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></label>`;
  const values=Object.fromEntries(locations.map(id=>[id,(current?source.states[id]?.value:source.states[id]?.annual?.[year])??null]));
  const ranked=Object.entries(values).filter(([,n])=>Number.isFinite(n)).sort((a,b)=>b[1]-a[1]);
  const shade=v=>Number.isFinite(v)?colors[cuts.filter(c=>v>=c).length]:'url(#map-no-data)';
  const buttons=Object.entries(layers).map(([id,l])=>`<button type="button" data-geo-metric="${id}" aria-pressed="${id===metric}">${l.short}</button>`).join('');
  const items=legend(cuts,countMode?v=>v.toLocaleString('en-US'):v=>Number(v.toFixed(layer.digits))+'%');
  return `<article class="panel atlas condition-map"><div class="section-top geo-heading"><h2>Diabetes and prediabetes by state</h2><div class="geo-location">${pickState(chosen,'geo')}${measurePicker}${yearPicker}${chosen?'<button data-geo-reset type="button">Show all states</button>':''}</div></div>
    <div class="epi-tabs geo-tabs" role="group" aria-label="State map measure">${buttons}</div>
    <p class="geo-unit"><strong>${subject} · ${year}</strong> <span>${unit}</span></p>
    <div class="atlas-inner"><div>${mapImage(resources.svg,values,chosen,'geo',shade,display,subject+' by state in '+year)}</div>${stateReadout(source,ranked,chosen,display,year,values,countMode)}</div>
    <div class="atlas-key">${items.map((label,i)=>`<span><i ${colors[i]?'style="background:'+colors[i]+'"':'class="geo-missing"'}></i>${escapeHTML(label)}</span>`).join('')}</div></article>`+
    (chosen&&!countMode?localTrend(source,chosen,metric,view.period||2000,year,unit)+(current?stateGroups(source,chosen,metric):''):'');
}
export function spendingMap(svg,id,perPerson) {
  const values=Object.fromEntries(Object.entries(stateNames).map(([abbr,n])=>[abbr,medicalCosts[n==='District of Columbia'?'District Of Columbia':n]?.[perPerson?1:0]]));
  const sorted=Object.values(values).filter(Number.isFinite).sort((a,b)=>a-b);
  const fmt=v=>v==null?'No estimate':perPerson?'$'+Math.round(v).toLocaleString('en-US'):'$'+(v/1e3).toFixed(2)+'B';
  const cuts=[1,2,3,4].map(i=>sorted[Math.floor(i*sorted.length/5)]);
  const color=v=>v==null?'#e4e5eb':colors[cuts.filter(c=>v>=c).length];
  const top=Object.keys(values).find(k=>values[k]===sorted.at(-1));
  return `<article class="panel atlas"><div class="section-top"><h2>Direct medical spending by state</h2>${pickState(id,'cost')}</div>
    <div class="section-top"><span class="axis-unit">CDC State Burden Toolkit · 2021</span><div class="period-picker">${['Total','Per patient'].map((label,i)=>`<button data-cost-mode="${i}" aria-pressed="${i===perPerson}">${label}</button>`).join('')}</div></div>
    <div class="atlas-inner"><div>${mapImage(svg,values,id,'cost',color,fmt)}</div><div class="atlas-readout"><div class="atlas-selected"><span>${stateNames[id]||'United States'}</span><strong>${fmt(id?values[id]:medicalCosts['United States'][perPerson])}</strong><small>${perPerson?'Annual cost per patient':'Annual direct medical costs'}</small></div><dl><div><dt>Highest · ${stateNames[top]}</dt><dd>${fmt(values[top])}</dd></div></dl></div></div>
    <div class="atlas-key">${colors.map((c,i)=>`<span><i style="background:${c}"></i>${i===0?'Below '+fmt(cuts[0]):i===4?fmt(cuts[3])+' or more':fmt(cuts[i-1])+' to <'+fmt(cuts[i])}</span>`).join('')}</div></article>`;
}
