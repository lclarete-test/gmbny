import {lineChart,barList} from './charts.js';
import {links} from './evidence.js';
import {stateNames,medicalCosts,labelXY} from './map-data.js';

const colors=['#e3f1ef','#a9d2cc','#65afa6','#337f78','#10564f'];
const bins=['Below 8.5%','8.5–9.9%','10.0–11.4%','11.5–12.9%','13.0% or above','No estimate'];
const scale=v=>v==null?'#e4e5eb':colors[v<8.5?0:v<10?1:v<11.5?2:v<13?3:4];
const rate=v=>v==null?'No estimate':v.toFixed(1)+'%';
const small={VT:[848,79],NH:[933,110],MA:[949,145],RI:[949,170],CT:[943,197],NJ:[918,224],DE:[900,253],MD:[889,281],DC:[872,307]};
function mapImage(svg,values,selected,mode,fill,format) {
  const dataKey=mode==='geo'?'data-state':'data-cost-state';
  const attrs=(id)=>`${dataKey}="${id}" class="atlas-state ${id===selected?'selected':''}" tabindex="0" role="button" aria-label="${stateNames[id]}, ${format(values[id])}" aria-pressed="${selected===id}" style="fill:${fill(values[id])}"`;
  const outlines=svg.replace(/<svg [^>]*>/,`<svg class="atlas-map" viewBox="168 95 979 608" role="group" aria-label="${mode==='geo'?'Diagnosed diabetes':'Medical spending'} by state">`)
    .replace(/<(path|g) id="([A-Z]{2})"/g,(_,tag,id)=>`<${tag} ${attrs(id)}`);
  const labels=Object.entries(labelXY).map(([id,[x,y]])=>{
    const [lx,ly]=small[id]||[x,y];
    const leader=small[id]?`<path d="M${x+174},${y+100} L${lx+174},${ly+100}" class="state-leader"/>`:'';
    return leader+`<text x="${lx+174}" y="${ly+100}" class="state-abbr" ${dataKey}="${id}" aria-hidden="true">${id}</text>`;
  }).join('');
  return outlines.replace('</svg>',labels+'</svg>');
}
function pickState(selected,mode) {
  return `<label class="picker"><span>Location</span><select data-picker="${mode}" aria-label="${mode==='geo'?'Epidemiology':'Spending'} location"><option value="">United States</option>${Object.entries(stateNames).sort((a,b)=>a[1].localeCompare(b[1])).map(([id,n])=>`<option value="${id}" ${selected===id?'selected':''}>${n}</option>`).join('')}</select></label>`;
}
export function prevalenceMap(svg,profiles,series,selected) {
  const values=Object.fromEntries(Object.entries(stateNames).map(([id])=>[id,profiles[id]?.adjusted]));
  const ranked=Object.entries(values).filter(([,v])=>v!=null).sort((a,b)=>b[1]-a[1]);
  const reportingStates=ranked.filter(([abbr])=>abbr!=='DC');
  const mean=reportingStates.reduce((n,[,v])=>n+v,0)/reportingStates.length,highest=ranked[0],lowest=ranked.at(-1);
  const v=values[selected], median=series.find(d=>d.state==='All' && d.year===2024).estimate;
  const r=ranked.findIndex(([s])=>s===selected)+1;
  return `<article class="panel atlas"><div class="section-top"><h2>Diagnosed diabetes by state</h2>${pickState(selected,'geo')}</div>
   <div class="axis-unit">Age-adjusted prevalence among adults 18+ · 2024</div><div class="atlas-inner"><div>${mapImage(svg,values,selected,'geo',scale,rate)}</div>
   <div class="atlas-readout">${selected?`<div class="atlas-selected"><span>${stateNames[selected]}</span><strong>${rate(v)}</strong><small>${r?'Rank '+r+' of '+ranked.length+' reporting jurisdictions':'2024 estimate unavailable'}</small></div>`:''}
    <dl><div><dt>State average</dt><dd>${rate(mean)}</dd></div><div><dt>CDC state median</dt><dd>${rate(median)}</dd></div><div><dt>Highest · ${stateNames[highest[0]]}</dt><dd>${rate(highest[1])}</dd></div><div><dt>Lowest · ${stateNames[lowest[0]]}</dt><dd>${rate(lowest[1])}</dd></div></dl></div></div>
    <div class="atlas-key">${bins.map((b,i)=>`<span><i style="background:${colors[i]||'#e4e5eb'}"></i>${b}</span>`).join('')}</div></article>`;
}
export function stateTrend(series,selected,start) {
  const labels=Array.from({length:2025-start},(_,i)=>i+start);
  const values=id=>{const rows=new Map(series.filter(d=>d.state===id).map(d=>[+d.year,d.estimate]));return labels.map(y=>rows.get(y)??null)};
  const names=selected?[[stateNames[selected],values(selected)],['U.S. state median',values('All')]]:[['U.S. state median',values('All')]];
  return lineChart({title:(selected?stateNames[selected]:'United States')+' · diagnosed diabetes, '+start+'–2024',unit:'Age-adjusted prevalence among adults 18+ (%)',format:'percent',labels,series:names,annual:true,
    controls:`<div class="period-picker" aria-label="Trend period">${[2000,2011,2020].map(y=>`<button data-period="${y}" aria-pressed="${start===y}">${y}–2024</button>`).join('')}</div>`,
    breakAt:[labels.indexOf(2011)],source:links.states});
}
export function stateBreakdown(id,profiles) {
  const p=profiles[id],name=stateNames[id];
  if(!p || p.count==null)return `<article class="panel"><h2>${name} · 2024 reporting</h2><p>CDC published no 2024 estimate for this state. Its available years appear in the trend.</p></article>`;
  const order={'Age':['18-44','45-64','65-74','75+'],'Sex':['Female','Male'],'Education':['< High School','High School','> High School']};
  const groups=Object.entries(p.groups).map(([dim,rows])=>{
    const items=(order[dim]||Object.keys(rows)).filter(k=>rows[k]!=null).map(k=>[k.replace('< High School','Less than high school').replace('> High School','Beyond high school').replace(/^High School$/,'High school'),rows[k]]);
    return `<section><h3>${dim}</h3>${barList(items,{max:Math.max(40,...Object.values(p.groups.Age||{}),...Object.values(p.groups['Race and ethnicity']||{}),...Object.values(p.groups.Education||{}),...Object.values(p.groups.Sex||{}))})}</section>`;
  });
  return `<article class="panel"><h2>Adults with diagnosed diabetes in ${name}</h2><p class="reading">${Math.round(p.count).toLocaleString('en-US')} adults, or ${rate(p.crude)} of the adult population in 2024.</p><div class="matrix-grid state-groups">${groups.join('')}</div></article>`;
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
