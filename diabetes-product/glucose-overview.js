import {escapeHTML,lineChart} from './charts.js';
import {glucoseStatus,glucoseTotal,labTrend,nhisIntervals} from './national-glucose.js';
import {links} from './evidence.js';

export const glucoseColors={
  diagnosed:'#5848a6', undiagnosed:'#a2512b', prediabetes:'#167769', below:'#657489',
  type1:'#5848a6',type2:'#2c689b',other:'#687589'
};
const statusNames={diagnosed:'Diagnosed diabetes, all types',undiagnosed:'Undiagnosed diabetes, type unknown'};
const statusName=s=>statusNames[s.id]||s.label;
const one=n=>n.toFixed(1);

export function statusDetails(id,typeDetail){
  const subgroup=typeDetail.mix.rows.find(s=>s.id===id);
  let label,count,detail,ci;
  if(subgroup){
    label=subgroup.label;
    count=subgroup.millions.toFixed(2)+'M';
    detail=one(subgroup.pct)+'% of U.S. adults who reported a diabetes diagnosis in the 2021–2023 NHIS interviews reported this type.';
    if(id==='other')detail=one(subgroup.pct)+'% reported another type or did not identify a type in the 2021–2023 NHIS interviews.';
    detail+=' In the same survey, this group represented '+subgroup.adultPct.toFixed(2)+'% of all adults with known diagnosis status. The count is an annual average.';
    if(id==='other')detail+=' Of diagnosed adults, '+one(typeDetail.mix.otherDetail[0].pct)+'% named another type and '+one(typeDetail.mix.otherDetail[1].pct)+'% did not give a type.';
    ci=subgroup.ci;
  }else{
    const item=glucoseStatus.find(s=>s.id===id)||glucoseStatus[1];
    label=statusName(item);count=item.millions==null?'':one(item.millions)+'M';
    detail=item.detail;ci=item.ci;
  }
  return '<div class="gs-definition" style="--condition:'+glucoseColors[id]+'"><div><b>'+escapeHTML(label)+'</b>'+
    (count?'<strong>'+count+' <small>adults</small></strong>':'')+'</div><p>'+escapeHTML(detail)+'</p>'+
    (ci?'<span>95% confidence interval for the share: '+one(ci[0])+'% to '+one(ci[1])+'%.</span>':'')+'</div>';
}

function typeComposition(mix,chosen){
  const rows=mix.rows.map(s=>{
    const label=s.id==='type1'?'Type 1':s.id==='type2'?'Type 2':'Other or unknown';
    return '<button type="button" data-glucose-status="'+s.id+'" aria-pressed="'+(s.id===chosen)+'" aria-controls="glucose-detail" aria-label="'+escapeHTML(label+', '+one(s.pct)+' percent of adults with diagnosed diabetes')+'" style="--condition:'+glucoseColors[s.id]+'"><span>'+label+'</span><b>'+one(s.pct)+'%</b></button>';
  });
  return '<div class="gs-type-mix" role="group" aria-label="Reported types among diagnosed adults"><div class="gs-mix-label"><b>Of every 100 adults who reported a diabetes diagnosis</b><small>Reported type · NHIS '+mix.period+'</small></div><div class="gs-mix-values">'+rows.join('')+'</div></div>';
}
export function glucoseOverview(id='undiagnosed',typeDetail){
  const rows=glucoseStatus.map(s=>'<button class="gs-row" type="button" data-glucose-status="'+s.id+'" aria-controls="glucose-detail" aria-pressed="'+(id===s.id)+'" aria-label="'+escapeHTML(statusName(s))+', '+one(s.pct)+' percent" style="--condition:'+glucoseColors[s.id]+';--bar:'+s.pct*2+'%"><span class="gs-name">'+escapeHTML(statusName(s))+'</span><span class="gs-track"><i></i><b>'+one(s.pct)+'%</b></span></button>').join('');
  return '<article class="panel glucose-overview"><header class="section-top"><h2>Blood glucose status among U.S. adults</h2><span class="axis-unit">August 2021 to August 2023 · ages 18+</span></header>'+
    '<div class="gs-grid"><div class="gs-summary"><strong>'+one(glucoseTotal)+'%</strong><p>of adults had diabetes or prediabetes.</p><p>About 4 in 100 adults had blood glucose in the diabetes range and reported no prior diagnosis. Their diabetes type is unknown.</p></div>'+
    '<div class="gs-chart" role="group" aria-label="Share of all U.S. adults by glucose status">'+rows+'<div class="gs-axis" aria-hidden="true"><div>'+[0,10,20,30,40,50].map(v=>'<span style="left:'+v*2+'%">'+v+'%</span>').join('')+'</div></div></div></div>'+
    typeComposition(typeDetail.mix,id)+'<div id="glucose-detail" aria-live="polite" aria-atomic="true">'+statusDetails(id,typeDetail)+'</div></article>';
}

export function comparisonHistory(nhis,detail){
  const early=detail.early;
  const labels=[...early.map(r=>r.year),...nhis.trend.map(r=>r[0])];
  const series=['Type 1','Type 2','Prediabetes'].map((label,i)=>
    [label,[...early.map(r=>r.values[i]),...nhis.trend.map(r=>r[i+1])]]);
  return {title:'U.S. diabetes diagnoses over time',unit:'Percentage of U.S. adults aged 18+ · NHIS interviews, '+labels[0]+'–'+labels.at(-1),
    format:'percent',digits:2,labels,series,
    intervals:nhisIntervals.map((intervals,i)=>[...early.map(r=>r.intervals[i]),...intervals]),
    colors:[glucoseColors.type1,glucoseColors.type2,glucoseColors.prediabetes],
    breakAt:detail.breakBeforeYears.map(y=>labels.indexOf(y)).filter(i=>i>=0),
    annotate:[labels.indexOf(2006),labels.indexOf(2016),labels.length-1],source:links.nhis};
}
export function nationalHistory(nhis,typeDetail,mode,scopeControl='',start=2019,end=nhis.trend.at(-1)[0]){
  const lab=mode==='labs';
  const chart=lab?{...labTrend,colors:[glucoseColors.prediabetes,glucoseColors.undiagnosed],annotate:true}:comparisonHistory(nhis,typeDetail);
  let range='';
  if(!lab){
    const years=chart.labels,offset=years.indexOf(start),limit=years.indexOf(end)+1;
    const picker=(name,value)=>`<label>${name==='start'?'From':'Through'} <select aria-label="${name==='start'?'Start year':'End year'}" data-trend-bound="${name}">${years.map(y=>`<option ${y===value?'selected':''}>${y}</option>`).join('')}</select></label>`;
    range='<div class="case-period">'+picker('start',start)+picker('end',end)+'</div>';
    chart.labels=years.slice(offset,limit);
    chart.series=chart.series.map(([name,values])=>[name,values.slice(offset,limit)]);
    chart.intervals=chart.intervals.map(v=>v.slice(offset,limit));
    chart.breakAt=chart.breakAt.map(i=>i-offset).filter(i=>i>0);
    chart.annotate=[0,chart.labels.length-1];
    chart.unit='U.S. adults aged 18+ · percent reporting each condition · '+start+'–'+end;
    chart.everyYear=true;
  }
  const controls='<div class="trend-controls">'+scopeControl+range+'<div class="epi-tabs" role="group" aria-label="National trend measure"><button type="button" data-national-series="reported" aria-pressed="'+!lab+'">Reported diagnoses</button><button type="button" data-national-series="labs" aria-pressed="'+lab+'">Blood test results</button></div></div>';
  const note=lab?'Blood tests identify prediabetes and undiagnosed diabetes. CDC found no statistically significant long-term trend in either measure over its published examination periods.':start<2019?'NHIS recorded diabetes type in 2016 and 2017, skipped the question in 2018 and resumed in 2019. Breaks in the prediabetes line mark questionnaire changes.':'';
  return lineChart({...chart,title:'U.S. diabetes and prediabetes over time',controls,note});
}
export function glucoseExportRows(typeDetail){
  const rows=glucoseStatus.map(s=>['U.S. adult glucose status',statusName(s),'Aug 2021–Aug 2023',s.pct,'Crude % of adults 18+',links.cdc]);
  for(const s of glucoseStatus)if(s.millions!=null)rows.push(['U.S. adult glucose status',statusName(s),'2023',s.millions,'Millions of adults · projected separately',links.cdc]);
  for(const s of typeDetail.mix.rows){
    rows.push(['Reported type among diagnosed adults',s.label,typeDetail.mix.period,s.pct,'% of adults who reported a diabetes diagnosis · NHIS',links.nhis],
      ['Reported type among all adults',s.label,typeDetail.mix.period,s.adultPct,'% of all adults with known diagnosis status · NHIS',links.nhis],
      ['Reported type among diagnosed adults',s.label,typeDetail.mix.period,s.millions,'Millions of U.S. adults · NHIS annual average',links.nhis]);
  }
  return rows;
}
