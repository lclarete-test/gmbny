import {lineChart,barList,escapeHTML} from './charts.js';
import {links} from './evidence.js';
import {stateNames,labelXY} from './map-data.js';

const colors=['#e3f1ef','#a9d2cc','#65afa6','#337f78','#10564f'];
const small={VT:[848,79],NH:[933,110],MA:[949,145],RI:[949,170],CT:[943,197],NJ:[918,224],DE:[900,253],MD:[889,281],DC:[872,307]};
export function mapImage(svg,values,selected,mode,fill,format,title='Medical spending by state') {
  const dataKey=mode==='geo'?'data-state':'data-cost-state';
  const attrs=(id)=>`${dataKey}="${id}" class="atlas-state ${id===selected?'selected':''}" tabindex="0" role="button" aria-label="${stateNames[id]}, ${escapeHTML(format(values[id],id))}" aria-pressed="${selected===id}" style="fill:${fill(values[id])}"`;
  const outlines=svg.replace(/<svg [^>]*>/,root=>`<svg ${(root.match(/xmlns(?::[\w-]+)?="[^"]*"/g)||[]).join(' ')} class="atlas-map" viewBox="168 95 979 608" role="group" aria-label="${escapeHTML(title)}"><defs><pattern id="map-no-data" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#eef0f4"/><path d="M-1,1 1,-1 M0,7 7,0 M6,8 8,6" stroke="#b7bfcd" stroke-width="1.1"/></pattern></defs>`)
    .replace(/<(path|g) id="([A-Z]{2})"([^>]*?)(\/?)>/g,(_,tag,id,rest,selfClosed)=>{
      const tip=escapeHTML(stateNames[id]+', '+format(values[id],id));
      return '<'+tag+' '+attrs(id)+rest+'><title>'+tip+'</title>'+(selfClosed?'</'+tag+'>':'');
    });
  const labels=Object.entries(labelXY).map(([id,[x,y]])=>{
    const [lx,ly]=small[id]||[x,y];
    const leader=small[id]?`<path d="M${x+174},${y+100} L${lx+174},${ly+100}" class="state-leader"/>`:'';
    return leader+`<text x="${lx+174}" y="${ly+100}" class="state-abbr" ${dataKey}="${id}" aria-hidden="true">${id}</text>`;
  }).join('');
  return outlines.replace('</svg>',labels+'</svg>');
}
export function pickState(selected,mode) {
  return `<label class="picker"><span>Location</span><select data-picker="${mode}" aria-label="${mode==='geo'?'Epidemiology':'Spending'} location"><option value="">${mode==='geo'?'All states':'United States'}</option>${Object.entries(stateNames).sort((a,b)=>a[1].localeCompare(b[1])).map(([id,n])=>`<option value="${id}" ${selected===id?'selected':''}>${n}</option>`).join('')}</select></label>`;
}
const layers={
  all:{label:'Diagnosed diabetes, all types',subject:'Diagnosed diabetes, all types',short:'All diagnosed types',cuts:[8.5,10,11.5,13],digits:1},
  type1:{label:'Type 1 diabetes',subject:'Diagnosed type 1 diabetes',short:'Type 1 diabetes',cuts:[0.45,0.6,0.75,0.9],digits:2},
  type2:{label:'Type 2 diabetes',subject:'Diagnosed type 2 diabetes',short:'Type 2 diabetes',cuts:[7.5,8.5,9.5,10.5],digits:1},
  prediabetes:{label:'Reported prediabetes',subject:'Reported prediabetes',short:'Prediabetes',cuts:[9.5,10.5,12,14],digits:1}
};
export const hasStateLayer=key=>Object.hasOwn(layers,key);
const percent=(value,digits=1)=>Number.isFinite(value)?value.toFixed(digits)+'%':'No estimate';
const locations=Object.keys(stateNames);
function allDiagnosed(resources) {
  const years=[...new Set(resources.states.map(entry=>entry.year))].sort((a,b)=>a-b);
  const period=resources.stateTotals.years.at(-1), medianAnnual={}, states={};
  for(const id of locations) {
    const current=resources.stateTotals.states[id], prior=resources.profiles[id];
    states[id]={value:current?.adjusted,ci:current?.adjustedCI,annual:{},annualCI:{[period]:current?.adjustedCI},
      profilesByYear:{2024:prior,[period]:current}};
  }
  for(const entry of resources.states) {
    const target=entry.state==='All'?medianAnnual:states[entry.state]?.annual;
    if(target)target[entry.year]=entry.estimate;
  }
  return {states,period,years,medianAnnual,sourceUrl:resources.stateTotals.source,
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

const typeKeys=['type1','type2','prediabetes'];
const typePalette={type1:'#5848a6',type2:'#2c689b',prediabetes:'#167769'};
const isTypeSurvey=metric=>metric==='type1'||metric==='type2';
const isModelView=view=>view.geoMetric==='type1';
const people=n=>Number.isFinite(n)?Math.round(n).toLocaleString('en-US'):'No estimate';

export function stateGeography(resources,view){
  const metric=view.geoMetric, series=resources.caseMap[metric],years=Object.keys(series).map(Number).sort((a,b)=>a-b);
  const year=years.includes(view.geoYear)?view.geoYear:years.at(-1), records=series[year];
  const chosen=view.state, count=view.geoMeasure==='count',column=count?0:1;
  const model=metric==='type1',layer=layers[metric],population=model?'all residents':'adults 18+';
  const pct=n=>percent(n,model?2:1),format=count?people:pct;
  const rows=Object.entries(records).filter(([,r])=>Number.isFinite(r[column])).map(([id,r])=>[id,r[column]]).sort((a,b)=>b[1]-a[1]);
  const values=Object.fromEntries(rows);
  const cuts=count?(model?[5000,15000,30000,60000]:[50000,200000,500000,1000000]):model?[.38,.41,.44,.47]:layer.cuts;
  const shade=v=>Number.isFinite(v)?colors[cuts.filter(c=>v>=c).length]:'url(#map-no-data)';
  const tabs=Object.entries(layers).map(([id,l])=>`<button type="button" data-geo-metric="${id}" aria-pressed="${id===metric}">${l.short}</button>`).join('');
  const options=years.slice().reverse().map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('');
  const key=legend(cuts,format).map((label,i)=>`<span><i ${colors[i]?'style="background:'+colors[i]+'"':'class="geo-missing"'}></i>${escapeHTML(label)}</span>`).join('');
  const high=rows.length?rankReference('highest',distinctExtreme(rows,true),format):'';
  const low=rows.length?rankReference('lowest',distinctExtreme(rows,false),format):'';
  const mean=rows.filter(([id])=>id!=='DC');
  const average=mean.length?format(mean.reduce((sum,[,v])=>sum+v,0)/mean.length):'No estimate';
  const selection=records[chosen]||[];
  const rank=Number.isFinite(selection[column])?1+rows.filter(([,v])=>v>selection[column]).length:null;
  const selected=chosen?`<div class="geo-current"><strong>${stateNames[chosen]}</strong><span>${people(selection[0])} people · ${pct(selection[1])} of ${population}${rank?' · Rank '+rank+' of '+rows.length:''}</span><button type="button" data-geo-reset>Show all states</button></div>`:'';
  const method=model?'The 2024 model includes children and adults. The percentage uses the state’s total resident population.':metric==='all'?'CDC estimates how many adults reported a diabetes diagnosis and their share of the state’s adult population.':(metric==='prediabetes'?'These adults reported prediabetes and had no diabetes diagnosis.':'These adults were classified as having type 2 diabetes in a state survey.')+' Counts are approximate: the survey percentage multiplied by the Census adult population, rounded to the nearest hundred.'+(metric==='type2'&&year===2025?' The 2025 survey analysis differs from CDC’s earlier estimates.':'');
  return `<article class="panel condition-map"><h2>Diabetes and prediabetes by state</h2>
    <div class="geo-toolbar"><div class="epi-tabs geo-tabs" aria-label="Condition">${tabs}</div>
    <div class="geo-location">${pickState(chosen,'geo')}<label class="picker"><span>Year</span><select aria-label="State map year" data-picker="geo-year">${options}</select></label></div></div>
    <div class="epi-tabs case-toggle" role="group" aria-label="Map measure"><button type="button" data-case-measure="count" aria-pressed="${count}">Number of people</button><button type="button" data-case-measure="percent" aria-pressed="${!count}">Percent of population</button></div>
    <div class="case-outline">${mapImage(resources.svg,values,chosen,'geo',shade,format,layer.short+' by state')}</div>
    <div class="atlas-key">${key}</div>${selected}
    <div class="geo-readout"><dl class="case-ranks">${high}${low}<div class="geo-reference"><dt>State average</dt><dd>${average}</dd></div></dl></div>
    <p class="geo-coverage-primary">${rows.length} of 51 jurisdictions · ${year} · ${population}.</p><p class="reading">${method}</p></article>`;
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

export function stateDemographics(resources,view){
  if(!view.state||isModelView(view))return '';
  const metric=view.geoMetric,date=view.geoYear;
  const layer=metric==='all'?allDiagnosed(resources):resources.conditions[metric];
  const rec=layer.states[view.state];if(!rec)return '';
  const profile=rec.profilesByYear?.[date]||rec;
  const groups=profile.groupsByYear?.[date]||(rec.profilesByYear?.[date]||date===Number(layer.period)?profile.groups:null);
  if(!groups||!Number.isFinite(rec.annual[date]))return '';
  return stateGroups({...layer,period:date,states:{[view.state]:{...profile,groups,value:rec.annual[date]}}},view.state,metric);
}

export function historyScopeButtons(state,isNational){
  if(!state)return '';
  return '<div class="epi-tabs" role="group" aria-label="Time trend location">'+[[false,stateNames[state]],[true,'United States']].map(([national,label])=>'<button type="button" data-history-scope="'+(national?'national':'state')+'" aria-pressed="'+(isNational===national)+'">'+label+'</button>').join('')+'</div>';
}

export function stateHistory(resources,view){
  const id=view.state,metric=view.geoMetric,all=metric==='all';
  const allData=all?allDiagnosed(resources):null;
  const years=all?allData.years.filter(y=>y>=(view.period||2000)):[...new Set(typeKeys.flatMap(k=>resources.conditions[k].years))].sort((a,b)=>a-b);
  const scopeButtons=historyScopeButtons(id,false);
  const selectedYear=Number(view.geoYear);
  let series,intervals,seriesBreakAt,unit,colors,note,source,extraControls='';
  if(all){
    series=[[stateNames[id],years.map(y=>allData.states[id].annual[y]??null)]];
    if(years.some(y=>Number.isFinite(allData.medianAnnual[y])))series.push(['CDC state median',years.map(y=>allData.medianAnnual[y]??null)]);
    colors=['#167769','#8b829f'];unit='Diagnosed diabetes, all types · age-adjusted % of adults aged 18+';
    note='The survey changed its telephone sampling and weighting in 2011. The line breaks at the change.';source=allData.sourceUrl;
    extraControls='<div class="period-picker" role="group" aria-label="State history period">'+[2000,2011,2020].map(y=>'<button type="button" data-period="'+y+'" aria-pressed="'+((view.period||2000)===y)+'">'+y+'–'+years.at(-1)+'</button>').join('')+'</div>';
  }else{
    const keys=typeKeys.filter(k=>years.some(y=>Number.isFinite(resources.conditions[k].states[id]?.annual[y])));
    if(!keys.length){
      return '<article class="panel history-panel"><div class="section-top"><h2>'+stateNames[id]+' diabetes over time</h2>'+scopeButtons+'</div><p class="reading">No adult survey estimates by condition were available here in '+years[0]+'–'+years.at(-1)+'. The U.S. view includes national trends.</p></article>';
    }
    series=keys.map(k=>[k==='prediabetes'?'Reported prediabetes':layers[k].short,years.map(y=>resources.conditions[k].states[id].annual[y]??null)]);
    intervals=keys.map(k=>years.map(y=>resources.conditions[k].states[id].annualCI[y]??null));
    seriesBreakAt=keys.map(k=>(resources.conditions[k].breakYears||[]).map(y=>years.indexOf(y)));
    colors=keys.map(k=>typePalette[k]);unit='State survey estimates · age-adjusted % of adults aged 18+';
    note=isModelView(view)?'The map models type 1 diabetes in 2024 for all ages. This history uses adult state surveys in the years each condition was measured.':'Each point represents a year when the state survey measured that condition. Gaps mark unavailable estimates.';
    if(keys.some(k=>isTypeSurvey(k)&&Number.isFinite(resources.conditions[k].states[id].annual[2025])))note+=' The 2025 diabetes-type estimates use a separate BRFSS analysis and are plotted as individual points.';
    source=resources.conditions[metric].sourceUrl;
  }
  const initialIndex=years.includes(selectedYear)?years.indexOf(selectedYear):years.findLastIndex((_,i)=>series.some(([,v])=>Number.isFinite(v[i])));
  return lineChart({title:stateNames[id]+' diabetes over time',unit,labels:years,series,initialIndex,intervals,format:'percent',digits:all?1:2,
    annotate:true,controls:'<div class="trend-controls">'+scopeButtons+extraControls+'</div>',colors,seriesBreakAt,breakAt:all?[years.indexOf(2011)]:[],note,source});
}
