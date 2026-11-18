const palette = ['#5147b5','#13796f','#985524','#475a78'];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const charts = new Map();
let observer;
export function resetCharts() {
  observer?.disconnect();
  charts.clear();
}
function formatted(value, d) {
  if (value == null) return '—';
  const n = value.toLocaleString('en-US',{minimumFractionDigits:d.digits ?? 1,maximumFractionDigits:d.digits ?? 1});
  return d.format === 'percent' ? n+'%' : d.format === 'billions' ? '$'+n+'B' : n;
}
export function dataTable(headers, rows, label = '') {
  return `<div class="value-table"><table aria-label="${escapeHTML(label || headers.join(', '))}"><thead><tr>${headers.map(h=>`<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${escapeHTML(row[0])}</th>${row.slice(1).map(cell=>`<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function lineChart(d) {
  const id = 'history-'+charts.size;
  charts.set(id,d);
  const rows = d.labels.map((p,i)=>[p,...d.series.map(([,v])=>formatted(v[i],d))]);
  return `<article class="panel history-panel"><div class="section-top"><h2>${escapeHTML(d.title)}</h2>${d.controls||''}</div><div class="axis-unit">${escapeHTML(d.unit)}</div>
    <div class="history-canvas" id="${id}" role="img" aria-label="${escapeHTML(d.title+'. '+d.unit+'. Exact values follow the chart.')}"></div>
    <div class="line-key">${d.series.map(([name,arr],i)=>`<span><i style="--series:${palette[i%4]}"></i>${escapeHTML(name)} <b>${formatted(arr.at(-1),d)}</b></span>`).join('')}</div>
    ${d.note?`<p class="reading">${escapeHTML(d.note)}</p>`:''}
    ${d.annual?`<div class="annual-values">${d.labels.map((year,i)=>`<div><span>${year}</span><b>${formatted(d.series[0][1][i],d)}</b></div>`).join('')}</div>`:''}
    <details class="chart-values"><summary>Chart data</summary>${dataTable(['Period',...d.series.map(s=>s[0])],rows,d.title)}</details></article>`;
}
function draw(el,d,width) {
  if(width < 60) return;
  const w = Math.round(width), h = w < 430 ? 174 : 204;
  const left = d.format === 'billions' ? 56 : 43, right = 13, top = 14, bottom = h-31;
  const n=d.labels.length, xs=d.x || d.labels.map((_,i)=>i);
  const x=i=>left+(xs[i]-xs[0])/(xs.at(-1)-xs[0]||1)*(w-left-right);
  const actual = d.series.flatMap(([,values])=>values.filter(Number.isFinite));
  const rawStep = Math.max(...actual,0.01)/4;
  const power = 10**Math.floor(Math.log10(rawStep));
  const step = ([1,2,2.5,4,5,10].find(v=>v*power>=rawStep)||10)*power;
  const max = Math.ceil(Math.max(...actual)/step)*step || step;
  const y=v=>bottom-v/max*(bottom-top);
  const axis=v=>d.format==='billions'?'$'+Number(v.toFixed(2))+'B':Number(v.toFixed(2))+(d.format==='percent'?'%':'');
  let svg='';
  for(let i=0;i<=Math.round(max/step);i++){
    const v=i*step;
    svg+=`<line x1="${left}" y1="${y(v)}" x2="${w-right}" y2="${y(v)}" class="gridline"/><text x="${left-6}" y="${y(v)+4}" text-anchor="end">${axis(v)}</text>`;
  }
  const short=v=>String(v).replace('2017–Mar 2020','2017–20').replace('Aug 2021–Aug 2023','2021–23');
  if(d.annual) d.labels.forEach((_,i)=>{svg+=`<line x1="${x(i)}" x2="${x(i)}" y1="${bottom}" y2="${bottom+4}" class="gridline"/>`});
  const wanted = d.annual && w>900 ? n : Math.max(2,Math.min(n,Math.floor((w-left-right)/75)));
  const ticks = [...new Set(Array.from({length:wanted},(_,i)=>Math.round(i*(n-1)/(wanted-1))))];
  ticks.forEach(i=>{svg+=`<text x="${x(i)}" y="${h-8}" text-anchor="${i===0?'start':i===n-1?'end':'middle'}">${escapeHTML(short(d.labels[i]))}</text>`});
  d.series.forEach(([name,values],s)=>{
    let path='',previous=false,dots='';
    values.forEach((value,i)=>{
      if(!Number.isFinite(value)){previous=false;return;}
      path+=(previous && !d.breakAt?.includes(i)?' L':' M')+x(i).toFixed(2)+' '+y(value).toFixed(2);
      previous=true;
      dots+=`<circle cx="${x(i)}" cy="${y(value)}" r="${n>15?2.4:3.6}" fill="${palette[s%4]}"><title>${escapeHTML(d.labels[i]+' · '+name+' · '+formatted(value,d))}</title></circle>`;
    });
    svg+=`<path d="${path}" fill="none" stroke="${palette[s%4]}" stroke-width="2.4" stroke-linejoin="round"/>${dots}`;
  });
  el.innerHTML=`<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" aria-hidden="true">${svg}</svg>`;
}
export function mountCharts(main) {
  const update=(el,width)=>{const d=charts.get(el.id);if(d)draw(el,d,width)};
  if(typeof ResizeObserver!=='undefined') observer=new ResizeObserver(entries=>entries.forEach(e=>update(e.target,e.contentRect.width)));
  main.querySelectorAll('.history-canvas').forEach(el=>{update(el,el.getBoundingClientRect().width);observer?.observe(el)});
}
export function sourcesFooter(entries, text = []) {
  return `<section class="source-foot" aria-label="Sources and methods"><h2>Sources and methods</h2>${text.map(t=>`<p>${escapeHTML(t)}</p>`).join('')}<ul>${entries.map(([label,url])=>`<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(label)}</a></li>`).join('')}</ul></section>`;
}
export function measures(items) {
  return `<div class="measure-strip">${items.map(([number,label])=>`<div><strong>${escapeHTML(number)}</strong><span>${escapeHTML(label)}</span></div>`).join('')}</div>`;
}
export function barList(rows,options={}) {
  const {max=100,format=v=>v.toFixed(1)+'%',color='#5147b5'}=options;
  return `<div class="read-bars">${rows.map(([label,value])=>`<div><span>${escapeHTML(label)}</span><i aria-hidden="true"><em style="width:${Math.min(value/max*100,100)}%;background:${color}"></em></i><b>${escapeHTML(format(value))}</b></div>`).join('')}</div>`;
}
export function matrix(title,unit,groups,headers,colors,controls='') {
  const groupBlocks=groups.map(([group,rows],index)=>{
    const body=rows.map(([label,...values])=>{
      const cells=values.map((v,i)=>{
        if(v==null)return '<td>—</td>';
        const bar=colors[i]?`<i aria-hidden="true"><em style="background:${colors[i]};width:${Math.min(v,100)}%"></em></i>`:'';
        return `<td><b>${v.toFixed(1)}%</b>${bar}</td>`;
      }).join('');
      return `<tr><th scope="row">${escapeHTML(label)}</th>${cells}</tr>`;
    }).join('');
    const header=headers.map(v=>`<th scope="col">${escapeHTML(v)}</th>`).join('');
    return `<section style="--group-order:${index}"><h3>${escapeHTML(group)}</h3><table aria-label="${escapeHTML(group+' · '+title)}"><thead><tr><th scope="col">Group</th>${header}</tr></thead><tbody>${body}</tbody></table></section>`;
  });
  const columns=[0,1].map(parity=>groupBlocks.filter((_,i)=>i%2===parity).join('')).filter(Boolean);
  const legend=headers.map((h,i)=>colors[i]?`<span><i style="background:${colors[i]}"></i>${escapeHTML(h)}</span>`:'').join('');
  return `<article class="panel matrix-panel"><div class="section-top"><h2>${escapeHTML(title)}</h2>${controls}</div><p class="axis-unit">${escapeHTML(unit)}</p><div class="matrix-grid matrix-columns">${columns.map(html=>'<div class="matrix-column">'+html+'</div>').join('')}</div><div class="matrix-legend">${legend}</div></article>`;
}
