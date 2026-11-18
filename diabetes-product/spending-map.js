import {chartMark,escapeHTML} from './charts.js';
import {mapImage,pickState} from './geography.js';
import {stateNames} from './map-data.js';

const mapColors=['#e5eef3','#b7d1da','#7eafb8','#428792','#1a5a68'];
const composition=['medicare','medicaid','other'];
const totalBreaks=[500,1500,4000,10000];
const perPersonBreaks=[5000,7500,10000,12500];
const number=new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
const billions=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const nameOf=id=>stateNames[id]||'United States';

function amount(millions){
  return millions>=1000?'$'+billions.format(millions/1000)+'B':'$'+number.format(millions)+'M';
}

function legend(cuts,perPerson){
  const format=perPerson?v=>'$'+number.format(v/1000)+'k':amount;
  const thresholds=cuts.map(format);
  const ranges=['Below '+thresholds[0],
    ...thresholds.slice(1).map((high,i)=>thresholds[i]+' to below '+high),
    thresholds.at(-1)+' or more'];
  return '<div class="sm-legend" role="group" aria-label="State spending scale">'+
    '<div class="sm-scale">'+ranges.map((range,i)=>'<span role="img" aria-label="'+escapeHTML(range)+'" title="'+escapeHTML(range)+'" style="background:'+mapColors[i]+'"></span>').join('')+'</div>'+
    '<div class="sm-ticks" aria-hidden="true">'+thresholds.map((n,i)=>'<span style="left:'+((i+1)*20)+'%">'+n+'</span>').join('')+'</div></div>';
}

function options(meta,chosen){
  const opt=id=>'<option value="'+id+'"'+(id===chosen?' selected':'')+'>'+escapeHTML(meta[id].label)+'</option>';
  return '<label class="picker"><span>Payer</span><select data-picker="cost-payer" aria-label="State spending payer">'+
    ['all',...composition].map(opt).join('')+
    '<optgroup label="Included in other payers">'+opt('private')+'</optgroup></select></label>';
}

function payerMix(record,metadata,location){
  const total=record.all[0];
  const list=composition.map(id=>{
    const value=record[id][0], share=(100*value/total).toFixed(1)+'%';
    const cost=amount(value), label=metadata[id].label;
    const description=location+' · share of all diabetes-attributable medical dollars, 2021';
    return '<button type="button" class="sm-mix-row sm-'+id+'" '+chartMark(label,cost+' · '+share,description)+'>'+
      '<span class="sm-payer-name">'+escapeHTML(label)+'</span><strong>'+share+'</strong><span class="sm-payer-cost">'+cost+'</span>'+
      '<i aria-hidden="true"><em style="width:'+share+'"></em></i></button>';
  }).join('');
  return '<div class="sm-mix" role="group" aria-label="'+escapeHTML(location)+' payer shares">'+
    '<div class="sm-mix-label">Share of medical spending</div>'+list+
    '<p>CDC groups household out-of-pocket payments with private plans, military coverage and other sources in these state estimates.</p></div>';
}

function extremesAndRank(values,chosen,format){
  const sorted=Object.entries(values).filter(([,v])=>Number.isFinite(v)).sort((a,b)=>b[1]-a[1]);
  if(!sorted.length)return {html:'',rank:''};
  const extremes=[[sorted[0][1],'Highest','↑'],[sorted.at(-1)[1],'Lowest','↓']];
  const html='<dl class="sm-extremes">'+extremes.map(([value,label,arrow])=>{
    const names=sorted.filter(([,v])=>v===value).map(([id])=>nameOf(id)).join(', ');
    return '<div><dt><span aria-hidden="true">'+arrow+'</span> '+label+' · '+escapeHTML(names)+'</dt><dd>'+format(value)+'</dd></div>';
  }).join('')+'</dl>';
  const chosenValue=values[chosen];
  const rank=Number.isFinite(chosenValue)?'Rank '+(1+sorted.filter(([,v])=>v>chosenValue).length)+' of '+sorted.length+' jurisdictions':'';
  return {html,rank};
}

export function spendingMap(svg,id,perPerson,data,payer='all'){
  const chosen=Object.hasOwn(stateNames,id)?id:'US';
  const selected=Object.hasOwn(data.payers,payer)?payer:'all';
  const per=Number(perPerson)===1;
  const column=per?1:0;
  const format=v=>Number.isFinite(v)?(per?'$'+number.format(v):amount(v)):'No estimate';
  const cuts=per?perPersonBreaks:totalBreaks;
  const {locations,payers}=data;
  const record=locations[chosen];
  const values=Object.fromEntries(Object.keys(stateNames).map(state=>[state,locations[state]?.[selected]?.[column]]));
  const fill=v=>Number.isFinite(v)?mapColors[cuts.filter(cut=>v>=cut).length]:'url(#map-no-data)';
  const {html:extremes,rank}=extremesAndRank(values,chosen,format);
  const label=payers[selected].label,location=nameOf(chosen);
  const selectedNote=per?payers[selected].basis:'Annual direct medical costs';
  const privateContext=selected==='private'?'Private insurer spending covers adults living outside institutions. It is part of other-payer spending.':'';
  const title='Diabetes-attributable medical spending by state';
  const reset=chosen==='US'?'':'<button type="button" data-cost-reset>Show all states</button>';
  const measureButtons=['Total spending','Per person'].map((name,i)=>
    '<button type="button" data-cost-mode="'+i+'" aria-pressed="'+(i===column)+'">'+name+'</button>').join('');
  const mapTitle=label+' · '+selectedNote+' by state, 2021';
  return '<article class="panel atlas sm-panel"><header class="section-top"><h2>'+title+'</h2>'+
    '<span class="axis-unit">CDC · 2021 · adults 19+</span></header>'+
    '<p class="sm-intro">Each state estimate includes care for diagnosed diabetes and the medical costs of its complications.</p>'+
    '<div class="sm-controls">'+pickState(chosen==='US'?null:chosen,'cost')+options(payers,selected)+
      '<div class="sm-measure" role="group" aria-label="State spending measure">'+measureButtons+'</div>'+reset+'</div>'+
    '<div class="sm-layout"><div class="sm-geography">'+
      mapImage(svg,values,chosen==='US'?null:chosen,'cost',fill,format,mapTitle)+legend(cuts,per)+
      '</div><aside class="sm-readout" aria-label="State spending details">'+
      '<div class="sm-amount"><div class="sm-place">'+escapeHTML(location)+'</div>'+
      '<strong>'+format(record[selected][column])+'</strong>'+
      '<div class="sm-basis">'+escapeHTML(label)+' · '+escapeHTML(selectedNote.charAt(0).toLowerCase()+selectedNote.slice(1))+'</div>'+
      (rank?'<small>'+rank+'</small>':'')+'</div>'+
      (privateContext?'<p class="sm-private">'+privateContext+'</p>':'')+
      payerMix(record,payers,location)+extremes+'</aside></div></article>';
}

export function stateCostExportRows(data){
  const rows=[];
  for(const [postal,record] of Object.entries(data.locations)){
    const group=nameOf(postal)+' / '+data.year;
    for(const [id,[millions,perPerson]] of Object.entries(record)){
      const payer=data.payers[id];
      rows.push(['State direct medical spending',payer.label,group,millions,data.unit[0]+' · adults 19+ with diagnosed diabetes',data.source]);
      rows.push(['State direct medical spending',payer.label,group,perPerson,'2021 U.S. dollars · '+payer.basis,data.source]);
    }
    for(const id of composition){
      const share=Number((100*record[id][0]/record.all[0]).toFixed(1));
      rows.push(['State direct medical spending by payer',data.payers[id].label,group,share,'% of diabetes-attributable medical dollars',data.source]);
    }
  }
  return rows;
}
