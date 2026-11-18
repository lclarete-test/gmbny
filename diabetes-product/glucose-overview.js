import {escapeHTML,lineChart} from './charts.js';
import {glucoseStatus,glucoseTotal,labTrend,nhisIntervals} from './national-glucose.js';
import {links} from './evidence.js';

export const glucoseColors={
  diagnosed:'#5848a6', undiagnosed:'#a2512b', prediabetes:'#167769', below:'#657489',
  type1:'#5848a6',type2:'#2c689b'
};
const statusFor=id=>glucoseStatus.find(s=>s.id===id)||glucoseStatus[1];

export function statusDetails(id){
  const item=statusFor(id),ci=item.ci;
  const count=item.millions==null?'':`<strong>${item.millions.toFixed(1)}M <small>adults</small></strong>`;
  return `<div class="gs-definition" style="--condition:${glucoseColors[item.id]}"><div><b>${escapeHTML(item.label)}</b>${count}</div><p>${escapeHTML(item.detail)}</p>${ci?`<span>95% confidence interval for the share: ${ci[0].toFixed(1)}% to ${ci[1].toFixed(1)}%.</span>`:''}</div>`;
}
export function glucoseOverview(id='undiagnosed'){
  const chosen=statusFor(id).id;
  const rows=glucoseStatus.map(s=>`<button class="gs-row" type="button" data-glucose-status="${s.id}" aria-controls="glucose-detail" aria-pressed="${chosen===s.id}" aria-label="${escapeHTML(s.label)}, ${s.pct.toFixed(1)} percent" style="--condition:${glucoseColors[s.id]};--bar:${s.pct*2}%">
      <span class="gs-name">${escapeHTML(s.label)}</span><span class="gs-track"><i></i><b>${s.pct.toFixed(1)}%</b></span></button>`).join('');
  return `<article class="panel glucose-overview"><header class="section-top"><h2>Blood glucose status among U.S. adults</h2><span class="axis-unit">August 2021 to August 2023 · ages 18+</span></header>
    <div class="gs-grid"><div class="gs-summary"><strong>${glucoseTotal.toFixed(1)}%</strong><p>of adults had diabetes or prediabetes.</p><p>About 4 in 100 adults met the diabetes threshold in a blood test without a prior diagnosis.</p></div>
    <div class="gs-chart" role="group" aria-label="Share of all U.S. adults by glucose status">${rows}<div class="gs-axis" aria-hidden="true"><div>${[0,10,20,30,40,50].map(v=>`<span style="left:${v*2}%">${v}%</span>`).join('')}</div></div></div></div>
    <div id="glucose-detail" aria-live="polite" aria-atomic="true">${statusDetails(chosen)}</div></article>`;
}
export function comparisonHistory(nhis){
  return {title:'Reported type 1 diabetes, type 2 diabetes and prediabetes',unit:'Share of U.S. adults aged 18+ · annual interviews, 2019–2025',format:'percent',digits:2,
    labels:nhis.trend.map(row=>row[0]),series:['Type 1 diabetes','Type 2 diabetes','Reported prediabetes'].map((name,i)=>[name,nhis.trend.map(row=>row[i+1])]),
    intervals:nhisIntervals,colors:[glucoseColors.type1,glucoseColors.type2,glucoseColors.prediabetes],
    annotate:true,source:links.nhis};
}
export function nationalHistory(nhis,mode='reported'){
  const lab=mode==='labs';
  const chart=lab?{...labTrend,colors:[glucoseColors.prediabetes,glucoseColors.undiagnosed],annotate:true}:comparisonHistory(nhis);
  const controls=`<div class="epi-tabs" role="group" aria-label="National trend measure"><button type="button" data-national-series="reported" aria-pressed="${!lab}">Reported diagnoses</button><button type="button" data-national-series="labs" aria-pressed="${lab}">Prediabetes and undiagnosed diabetes in lab tests</button></div>`;
  const note=lab?'Exams capture previously undetected diabetes. CDC found no statistically significant long-term trend in undiagnosed diabetes or in lab-defined prediabetes over the respective periods.':'In 2019, 6.75% of adults reported a prediabetes diagnosis without diabetes. In 2025, 10.68% did. These interviews count people who knew their status.';
  return lineChart({...chart,title:'Diabetes and prediabetes over time',controls,note});
}
export function glucoseExportRows(){
  const rows=glucoseStatus.map(s=>['U.S. adult glucose status',s.label,'Aug 2021–Aug 2023',s.pct,'Crude % of adults 18+',links.cdc]);
  for(const s of glucoseStatus)if(s.millions!=null)rows.push(['U.S. adult glucose status',s.label,'2023',s.millions,'Millions of adults · projected separately',links.cdc]);
  return rows;
}
