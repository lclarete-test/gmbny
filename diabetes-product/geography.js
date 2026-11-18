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
const lastObserved=(rec,years)=>years.filter(y=>Number.isFinite(rec?.annual?.[y])).at(-1);
const isTypeSurvey=metric=>metric==='type1'||metric==='type2';
const surveyYearLabel=(year,metric)=>year===2025&&isTypeSurvey(metric)?'2025 · BRFSS analysis':String(year);
const isModelView=v=>v.geoMetric==='type1'&&['count','resident'].includes(v.geoMeasure);

function surveyObservation(source,id,year,latest){
  const record=source.states[id];
  const date=latest?lastObserved(record,source.years):year;
  const current=date===Number(source.period);
  return {year:date,value:(current?record?.value:record?.annual?.[date])??null,
    interval:record?.annualCI?.[date]||(current?record?.ci:null)};
}

function mapDataset(resources,view){
  const metric=hasStateLayer(view.geoMetric)?view.geoMetric:'all';
  const layer=layers[metric],model=isModelView(view),count=model&&view.geoMeasure==='count';
  const source=model?resources.type1Counts:metric==='all'?allDiagnosed(resources):resources.conditions[metric];
  const latest=!model&&metric!=='all'&&view.geoYear==='latest';
  const year=!model&&!latest&&source.years.includes(Number(view.geoYear))?Number(view.geoYear):Number(source.period);
  const observations={};
  for(const id of locations){
    if(model){
      const s=source.states[id];
      observations[id]={year,value:count?s.value:s.percent,interval:count?s.ci:s.percentCI};
    }else observations[id]=surveyObservation(source,id,year,latest);
  }
  const values=Object.fromEntries(locations.map(id=>[id,observations[id].value]));
  const ranked=Object.entries(values).filter(([,n])=>Number.isFinite(n)).sort((a,b)=>b[1]-a[1]);
  const display=count?v=>Number.isFinite(v)?Math.round(v).toLocaleString('en-US'):'No estimate':v=>percent(v,layer.digits);
  const cuts=count?[5000,15000,30000,60000]:model?[.38,.41,.44,.47]:layer.cuts;
  const subject=model?(count?'Modeled type 1 cases':'Modeled type 1 prevalence'):layer.subject;
  const unit=model?(count?'Estimated number of residents of all ages living with type 1 diabetes.':'Estimated percentage of all residents living with type 1 diabetes, including children.') :
    metric==='prediabetes'?'Adults who reported prediabetes without a diabetes diagnosis, age-adjusted.':
    metric==='all'?'Adults with a reported diabetes diagnosis of any type, age-adjusted.':'Adults with survey-classified '+(metric==='type1'?'type 1':'type 2')+' diabetes, age-adjusted.';
  return {metric,layer,model,count,source,latest,year,observations,values,ranked,display,cuts,subject,unit};
}

function latestTypePair(resources,id){
  const items=['type1','type2'].map(metric=>{
    const layer=resources.conditions[metric],record=layer.states[id],year=lastObserved(record,layer.years);
    const value=record?.annual?.[year];
    return '<div><span>'+layers[metric].short+'</span><strong>'+percent(value,layers[metric].digits)+'</strong>'+
      (year?'<small>'+surveyYearLabel(year,metric)+'</small>':'')+'</div>';
  });
  return '<div class="geo-by-type"><p>Latest adult survey estimates</p><div>'+items.join('')+'</div></div>';
}

function geoReadout(ctx,chosen,resources){
  const {metric,source,latest,year,observations,ranked,display,model,count}=ctx;
  let selection='';
  if(chosen){
    const obs=observations[chosen],valid=Number.isFinite(obs.value);
    const rank=valid&&!latest?1+ranked.filter(([,v])=>v>obs.value).length:null;
    const previous=!model&&!latest&&!valid?lastObserved(source.states[chosen],source.years):null;
    let note=valid?surveyYearLabel(obs.year,model?null:metric):latest?'The optional state survey has no estimate in this period.':'No survey estimate for '+year+'.';
    if(rank)note+=' · Rank '+rank+' of '+ranked.length;
    if(valid&&obs.interval?.every(Number.isFinite))note+=(model?' · 95% model interval ':' · 95% CI ')+display(obs.interval[0])+' to '+display(obs.interval[1]);
    selection='<div class="geo-current"><span>'+stateNames[chosen]+'</span><strong>'+display(obs.value)+'</strong><small>'+note+'</small>'+
      (previous?'<button type="button" data-geo-year="'+previous+'">Show '+previous+' estimate</button>':'')+'</div>';
  }
  const label=ranked.length+' of 51 jurisdictions';
  let references='';
  if(latest){
    const byYear=source.years.slice().reverse().map(y=>[y,Object.values(observations).filter(o=>o.year===y&&Number.isFinite(o.value)).length]).filter(([,n])=>n>0);
    references='<p class="geo-vintage-heading">Year of each latest estimate</p><dl class="geo-vintages">'+byYear.map(([y,n])=>'<div><dt>'+surveyYearLabel(y,metric)+'</dt><dd>'+n+' jurisdictions</dd></div>').join('')+'</dl>'+
      '<p class="geo-coverage">Choose a single year to see state ranks.</p>';
  }else if(ranked.length){
    const states=ranked.filter(([id])=>id!=='DC');
    const ref=model?(count?source.national.value:source.national.percent):states.reduce((sum,[,v])=>sum+v,0)/states.length;
    const mid=source.medianAnnual?.[year];
    references='<dl><div class="geo-reference geo-mean"><dt><i aria-hidden="true">≈</i><span>'+(model?'United States, all ages':'Average across reporting states')+'</span></dt><dd>'+display(ref)+'</dd></div>'+
      (Number.isFinite(mid)?'<div class="geo-median"><dt>CDC state median</dt><dd>'+display(mid)+'</dd></div>':'')+
      rankReference('highest',distinctExtreme(ranked,true),display)+rankReference('lowest',distinctExtreme(ranked,false),display)+'</dl>';
  }
  const byType=chosen&&metric==='all'?latestTypePair(resources,chosen):'';
  return '<aside class="atlas-readout geo-readout" aria-label="State comparisons">'+selection+byType+
    '<p class="geo-coverage-primary"><b>'+label+'</b> · '+(latest?'latest available':year)+'</p>'+references+'</aside>';
}

export function stateGeography(resources,view){
  const ctx=mapDataset(resources,view);
  const {metric,source,model,count,latest,year,display,observations,values,cuts,subject,unit}=ctx;
  const chosen=Object.hasOwn(stateNames,view.state)?view.state:null;
  const modelPick=metric==='type1'?'<label class="picker"><span>Measure</span><select data-picker="geo-measure" aria-label="Type 1 map measure">'+
    [['resident','Modeled % of all residents'],['count','Modeled count, all ages'],['survey','Survey % of adults']].map(([id,name])=>'<option value="'+id+'" '+((id==='survey'?!model:view.geoMeasure===id)?'selected':'')+'>'+name+'</option>').join('')+'</select></label>':'';
  const yearOptions=model?'':(metric==='all'?'':'<option value="latest" '+(latest?'selected':'')+'>Latest by state</option>')+
    [...source.years].reverse().map(y=>'<option value="'+y+'" '+(!latest&&year===y?'selected':'')+'>'+surveyYearLabel(y,metric)+'</option>').join('');
  const yearPicker=model?'':'<label class="picker"><span>Survey year</span><select data-picker="geo-year" aria-label="State map year">'+yearOptions+'</select></label>';
  const buttons=Object.entries(layers).map(([id,l])=>'<button type="button" data-geo-metric="'+id+'" aria-pressed="'+(id===metric)+'">'+l.short+'</button>').join('');
  const mark=v=>count?v.toLocaleString('en-US'):String(Number(v.toFixed(ctx.layer.digits)))+'%';
  const items=legend(cuts,mark);
  const shade=v=>Number.isFinite(v)?colors[cuts.filter(c=>v>=c).length]:'url(#map-no-data)';
  const ariaValue=(v,id)=>display(v)+(latest&&Number.isFinite(v)?' in '+observations[id].year:'');
  let surveyNote=!model&&metric!=='all'?' Only participating states asked these optional questions.':'';
  if(!model&&isTypeSurvey(metric)&&(latest||year===2025))surveyNote+=latest?' The 2022–24 rates are CDC estimates. The 2025 rates are a separate BRFSS analysis.':' The dashboard calculated this estimate from the 2025 BRFSS survey.';
  return '<article class="panel atlas condition-map"><h2>Diabetes and prediabetes by state</h2>'+
    '<div class="geo-toolbar"><div class="epi-tabs geo-tabs" role="group" aria-label="State map condition">'+buttons+'</div><div class="geo-location">'+pickState(chosen,'geo')+modelPick+yearPicker+
    (chosen?'<button data-geo-reset type="button">Show all states</button>':'')+'</div></div>'+
    '<p class="geo-unit"><strong>'+subject+' · '+(latest?source.years[0]+'–'+source.years.at(-1):year)+'</strong><span>'+unit+surveyNote+'</span></p>'+
    '<div class="atlas-inner"><div>'+mapImage(resources.svg,values,chosen,'geo',shade,ariaValue,subject+' by state')+'</div>'+geoReadout(ctx,chosen,resources)+'</div>'+
    '<div class="atlas-key">'+items.filter((_,i)=>i<5||ctx.ranked.length<51).map((label,i)=>'<span><i '+(colors[i]?'style="background:'+colors[i]+'"':'class="geo-missing"')+'></i>'+escapeHTML(label)+'</span>').join('')+'</div></article>';
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
  const ctx=mapDataset(resources,view);
  const date=ctx.observations[view.state]?.year;
  if(!Number.isFinite(date))return '';
  const rec=ctx.source.states[view.state];
  const profile=rec.profilesByYear?.[date]||rec;
  const groups=profile.groupsByYear?.[date]||(rec.profilesByYear?.[date]||date===Number(ctx.source.period)?profile.groups:null);
  if(!groups)return '';
  const source={...ctx.source,period:date,states:{[view.state]:{...profile,groups,value:ctx.observations[view.state].value}}};
  return stateGroups(source,view.state,ctx.metric);
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
