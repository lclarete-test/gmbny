const palette = ['#5147b5', '#15796f', '#a35c25', '#566b9d', '#9d557d', '#657234', '#4e5360'];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

const charts = new Map();
let chartId = 0;
let observer;
let interactionDocument;
let tooltip;
let activeTip;
const markSelector = '[data-chart-label][data-chart-value]';
const seriesColor = (chart, index) => chart.colors?.[index] || palette[index % palette.length];
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
const number = (value, digits) => value.toLocaleString('en-US', {
  minimumFractionDigits: digits, maximumFractionDigits: digits
});

function formatted(value, chart) {
  if (!Number.isFinite(value)) return '—';
  const n = number(value, chart.digits ?? 1);
  if (chart.format === 'percent') return n + '%';
  if (chart.format === 'billions') return '$' + n + 'B';
  if (chart.format === 'millions') return n + 'M';
  return n;
}

export function dataTable(headers, rows, label = '') {
  return `<div class="value-table${headers.length>4?' large-table':''}"><table aria-label="${escapeHTML(label || headers.join(', '))}"><thead><tr>${headers.map(h=>`<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${escapeHTML(row[0])}</th>${row.slice(1).map((cell,i)=>`<td data-column="${escapeHTML(headers[i+1])}">${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function currentSeries() { return Array.from(charts.values()); }

function hideTip() {
  if (tooltip) tooltip.hidden = true;
  activeTip?.owner.removeAttribute('data-chart-inspecting');
  if (activeTip && tooltip && activeTip.owner.getAttribute('aria-describedby') === tooltip.id) {
    activeTip.owner.removeAttribute('aria-describedby');
  }
  activeTip = null;
}

export function resetCharts() {
  observer?.disconnect();
  hideTip();
  charts.clear();
}

export function chartMark(label, value, context = '') {
  const text = [label, value, context].filter(Boolean).join(', ');
  return `data-chart-label="${escapeHTML(label)}" data-chart-value="${escapeHTML(value)}" ${context?'data-chart-context="'+escapeHTML(context)+'" ':''}aria-label="${escapeHTML(text)}"`;
}

function showTip(owner, key, data, x, y, mode, bounds) {
  const same = activeTip?.owner === owner && activeTip.key === key;
  if (mode === 'hover' && activeTip?.pinned) return;
  if (mode === 'pin' && same && activeTip.pinned) {
    hideTip();
    return;
  }
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'dashboard-chart-tooltip';
    tooltip.className = 'chart-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    document.body.append(tooltip);
  }
  if (!same) {
    hideTip();
    tooltip.innerHTML = `${data.period?'<span class="ct-period">'+escapeHTML(data.period)+'</span>':''}
      <div class="ct-reading"><span>${escapeHTML(data.label)}</span><b>${escapeHTML(data.value)}</b></div>
      ${data.detail?'<small>'+escapeHTML(data.detail)+'</small>':''}`;
    tooltip.style.setProperty('--tip-color', data.color || '#64549e');
    if (!owner.hasAttribute('aria-describedby')) owner.setAttribute('aria-describedby', tooltip.id);
  }
  activeTip = {owner, key, pinned: mode === 'pin' || (same && activeTip?.pinned)};
  owner.setAttribute('data-chart-inspecting', '');
  tooltip.hidden = false;
  const gap = 12;
  const size = tooltip.getBoundingClientRect();
  let left = 6, right = window.innerWidth - 6, top = 6, bottom = window.innerHeight - 6;
  if (bounds && Math.min(right, bounds.right) - Math.max(left, bounds.left) > size.width + gap) {
    left = Math.max(left, bounds.left + 2);
    right = Math.min(right, bounds.right - 2);
  }
  if (bounds && Math.min(bottom, bounds.bottom) - Math.max(top, bounds.top) > size.height + gap) {
    top = Math.max(top, bounds.top);
    bottom = Math.min(bottom, bounds.bottom);
  }
  const preferredX = x + gap + size.width <= right ? x + gap : x - gap - size.width;
  const preferredY = y - gap - size.height >= top ? y - gap - size.height : y + gap;
  tooltip.style.left = Math.round(clamp(preferredX, left, right - size.width)) + 'px';
  tooltip.style.top = Math.round(clamp(preferredY, top, bottom - size.height)) + 'px';
}

function showBar(mark, event, mode) {
  const rect = mark.getBoundingClientRect();
  const point = event && Number.isFinite(event.clientX) && (event.type.startsWith('pointer') || event.detail > 0);
  const bar = mark.querySelector('em')?.getBoundingClientRect() || rect;
  const x = point ? event.clientX : bar.right;
  const y = point ? event.clientY : (rect.top + rect.bottom) / 2;
  const {chartLabel, chartValue, chartContext} = mark.dataset;
  const unit = chartContext || mark.closest('.panel')?.querySelector('.axis-unit')?.textContent.trim();
  showTip(mark, chartLabel + chartValue, {
    label:chartLabel, value:chartValue, detail:unit,
    color: getComputedStyle(mark.querySelector('em') || mark).backgroundColor.replace(/^rgba\(0, 0, 0, 0\)$/, '') || '#64549e'
  }, x, y, mode);
}

function bindInteractions(doc) {
  if (doc === interactionDocument) return;
  interactionDocument = doc;
  doc.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const mark = event.target.closest?.(markSelector);
    if (mark) showBar(mark, event, 'hover');
  });
  doc.addEventListener('pointerout', event => {
    const mark = event.target.closest?.(markSelector);
    if (mark && activeTip?.owner === mark && !activeTip.pinned && !mark.contains(event.relatedTarget)) hideTip();
  });
  doc.addEventListener('pointerdown', event => {
    if (activeTip && !activeTip.owner.contains(event.target)) hideTip();
  }, true);
  doc.addEventListener('focusin', event => {
    const mark = event.target.closest?.(markSelector);
    if (activeTip && !activeTip.owner.contains(event.target) &&
        !event.target.closest?.('.history-panel')?.contains(activeTip.owner)) hideTip();
    if (mark) showBar(mark, null, 'focus');
  });
  doc.addEventListener('focusout', event => {
    if (activeTip?.owner === event.target && !event.target.contains(event.relatedTarget)) hideTip();
  });
  doc.addEventListener('click', event => {
    const mark = event.target.closest?.(markSelector);
    if (mark) showBar(mark, event, 'pin');
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeTip) {
      hideTip();
      return;
    }
    const mark = event.target.closest?.(markSelector);
    if (!mark || mark.matches('button, summary, a[href]') || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    showBar(mark, null, 'pin');
  });
  doc.addEventListener('scroll', hideTip, true);
  window.addEventListener('resize', hideTip);
}

export function lineChart(d) {
  const id = 'history-' + chartId++;
  charts.set(id, d);
  const last = d.labels.length - 1;
  const initial = Number.isInteger(d.initialIndex) && d.initialIndex >= 0 && d.initialIndex <= last ? d.initialIndex : last;
  const rows = d.labels.map((p, i) => [p, ...d.series.map(([, v]) => formatted(v[i], d))]);
  const options = d.labels.map((year, i) => `<option value="${i}" ${i === initial ? 'selected' : ''}>${escapeHTML(year)}</option>`).join('');
  const key = d.series.map(([name, arr], i) =>
    `<span><i style="--series:${escapeHTML(seriesColor(d,i))}"></i>${escapeHTML(name)} <b>${formatted(arr[initial],d)}</b></span>`).join('');
  return `<article class="panel history-panel"><div class="section-top"><h2>${escapeHTML(d.title)}</h2>${d.controls||''}</div><div class="axis-unit">${escapeHTML(d.unit)}</div>
    <div class="annual-plot-wrap"><div class="history-canvas" style="${d.everyYear?'min-width:'+(d.labels.length*38+60)+'px':''}" id="${id}" role="slider" tabindex="0" aria-label="${escapeHTML(d.title+' · inspect values')}" aria-valuemin="1" aria-valuemax="${Math.max(1,d.labels.length)}" aria-valuenow="${Math.max(1,initial+1)}" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End" aria-description="Use left and right arrow keys to change the period. Use up and down to change the series."></div></div>
    <div class="chart-inspect"><label class="period-read" ${d.everyYear?'style="display:none"':''}>Period <select data-chart-period="${id}" aria-controls="${id}" aria-label="${escapeHTML('Period for '+d.title)}">${options}</select></label><div class="line-key">${key}</div></div>
    ${d.note?`<p class="reading">${escapeHTML(d.note)}</p>`:''}
    ${d.annual?`<div class="annual-values">${d.labels.map((year,i)=>`<div><span>${escapeHTML(year)}</span><b>${formatted(d.series[0][1][i],d)}</b></div>`).join('')}</div>`:''}
    <details class="chart-values"><summary>Chart data</summary>${dataTable(['Period',...d.series.map(s=>s[0])],rows,d.title)}</details></article>`;
}

function yScale(data) {
  const low = Math.min(0, ...data), high = Math.max(0, ...data);
  if (low === high) return {min:0, max:1, step:0.25};
  const raw = (high - low) / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 4, 5, 10].find(v => v * power >= raw) || 10) * power;
  return {min: Math.floor(low / step) * step, max: Math.ceil(high / step) * step, step};
}

function axisValue(value, d, step) {
  const digits = Math.max(1, 1 - Math.floor(Math.log10(step)));
  const v = Number(value.toFixed(Math.min(8, digits))).toLocaleString('en-US', {maximumFractionDigits:8});
  if (d.format === 'percent') return v + '%';
  if (d.format === 'billions') return '$' + v + 'B';
  if (d.format === 'millions') return v + 'M';
  return v;
}

function yearLabel(label) {
  return String(label).replace('2017–Mar 2020', '2017–20').replace('Aug 2021–Aug 2023', '2021–23');
}
function tickIndices(xs, labels, x, width) {
  const last = xs.length - 1;
  if (last <= 0) return last < 0 ? [] : [0];
  const occupied = label => 8 + 6.5 * yearLabel(label).length;
  const half = i => occupied(labels[i]) / 2;
  const selected = [0];
  let edge = x(0) + occupied(labels[0]);
  for (let i = 1; i < last; i++) {
    if (x(i) - half(i) < edge + 8 || x(i) + half(i) > width - occupied(labels[last]) - 8) continue;
    selected.push(i);
    edge = x(i) + half(i);
  }
  selected.push(last);
  return selected;
}

function anchorLabels(d, positions, width) {
  if (!d.annotate || d.labels.length < 2) return '';
  const {x, y, top, bottom, left, right} = positions;
  const last = d.labels.length - 1;
  let indices = Array.isArray(d.annotate) ? d.annotate : [0, Math.round(last/2), last];
  indices = [...new Set(indices)].filter(i => Number.isInteger(i) && i >= 0 && i <= last).sort((a,b)=>a-b);
  if (width < 440 && indices.length > 2) indices = [indices[0], indices.at(-1)];
  const a = [];
  for (const i of indices) {
    const points = d.series.map(([, values], s) => ({s, value:values[i]}))
      .filter(p => Number.isFinite(p.value)).map(p => ({...p, py:y(p.value)})).sort((u,v)=>u.py-v.py);
    if (!points.length || points.length * 15 > bottom - top) continue;
    let floor = top + 8;
    for (const p of points) {
      p.labelY = Math.max(floor, p.py - 7);
      floor = p.labelY + 16;
    }
    let ceiling = bottom - 2;
    for (let k = points.length - 1; k >= 0; k--) {
      points[k].labelY = Math.min(points[k].labelY, ceiling);
      ceiling = points[k].labelY - 16;
    }
    const at = x(i), alignEnd = right - at < Math.min(65, (right-left)/3);
    const dx = alignEnd ? -7 : 7;
    for (const p of points) {
      const color = escapeHTML(seriesColor(d,p.s)), label = escapeHTML(formatted(p.value,d));
      if (Math.abs(p.labelY-p.py) > 11) a.push(`<path class="chart-label-lead" stroke="${color}" d="M ${at} ${p.py} L ${at+dx} ${p.labelY-3}"/>`);
      a.push(`<text class="chart-point-label" x="${at+dx}" y="${p.labelY}" text-anchor="${alignEnd?'end':'start'}" style="fill:${color}">${label}</text>`);
    }
  }
  return a.join('');
}

function draw(el, d, width) {
  const w = Math.round(width);
  if (w < 60 || Number(el.dataset.plotWidth) === w) return;
  el.dataset.plotWidth = w;
  if (activeTip?.owner === el) hideTip();
  const n = d.labels.length;
  const actual = d.series.flatMap(([, v]) => v.filter(Number.isFinite));
  if (!actual.length || !n) {
    el.innerHTML = '<p class="chart-empty">No published estimate for this selection.</p>';
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
    return;
  }
  const h = clamp(Math.round(w * .34), 212, 345);
  const {min, max, step} = yScale(actual);
  const yTicks = Array.from({length: Math.round((max - min) / step) + 1}, (_,i) => min + i * step);
  const wideLabel = Math.max(...yTicks.map(v=>axisValue(v,d,step).length));
  const left = Math.max(38, wideLabel * 7 + 12), right = w - 12, top = 16, bottom = h - 33;
  const numeric = d.labels.map(Number);
  const chronological = numeric.every((v,i)=>Number.isFinite(v) && (i === 0 || v > numeric[i-1]));
  const xs = d.x || (chronological ? numeric : d.labels.map((_,i)=>i));
  const x = i => n === 1 ? (left+right)/2 : left + ((xs[i]-xs[0])/(xs.at(-1)-xs[0] || 1))*(right-left);
  const y = value => bottom - (value-min)/(max-min) * (bottom-top);
  const svg = [];
  for (const value of yTicks) {
    svg.push(`<line class="gridline" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/><text x="${left-7}" y="${y(value)+4}" text-anchor="end">${axisValue(value,d,step)}</text>`);
  }
  svg.push(`<path class="chart-axis" d="M${left} ${top}V${bottom}H${right}"/>`);
  const ticks = d.everyYear?d.labels.map((_,i)=>i):tickIndices(xs,d.labels,x,right);
  d.labels.forEach((_,i) => {
    if (ticks.includes(i) || d.annual) svg.push(`<line class="chart-axis" x1="${x(i)}" x2="${x(i)}" y1="${bottom}" y2="${bottom+4}"/>`);
  });
  for (const i of ticks) {
    const anchor = n === 1 ? 'middle' : i === 0 ? 'start' : i === n-1 ? 'end' : 'middle';
    svg.push(`<text class="chart-x-label" x="${x(i)}" y="${h-9}" text-anchor="${anchor}">${escapeHTML(yearLabel(d.labels[i]))}</text>`);
  }
  d.series.forEach(([,values], s) => {
    const color = escapeHTML(seriesColor(d,s)), dots = [], path = [];
    let joined = false;
    values.forEach((value,i) => {
      if (!Number.isFinite(value)) { joined = false; return; }
      path.push((joined && !d.breakAt?.includes(i) && !d.seriesBreakAt?.[s]?.includes(i) ? 'L' : 'M') + x(i).toFixed(2) + ' ' + y(value).toFixed(2));
      joined = true;
      dots.push(`<circle cx="${x(i)}" cy="${y(value)}" r="${n>15?2.5:3.4}" fill="${color}"/>`);
    });
    svg.push(`<path d="${path.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` + dots.join(''));
  });
  svg.push(anchorLabels(d, {x,y,top,bottom,left,right}, w));
  svg.push(`<g class="chart-selected"><line class="chart-guide" y1="${top}" y2="${bottom}"/><circle r="5.5" fill="white" stroke-width="2.5"/></g>`);
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" aria-hidden="true">${svg.join('')}</svg>`;
  const select = el.closest('.history-panel').querySelector('[data-chart-period]');
  const guide = el.querySelector('.chart-guide'), dot = el.querySelector('.chart-selected circle');
  const legend = el.closest('.history-panel').querySelectorAll('.line-key b');
  let index = clamp(Number(select.value), 0, n-1), series = clamp(Number(el.dataset.series || 0), 0, d.series.length - 1);
  const describe = (i,s) => {
    const [name, values] = d.series[s];
    const interval = d.intervals?.[s]?.[i];
    const ci = Array.isArray(interval) && interval.length === 2 && interval.every(Number.isFinite)
      ? '95% CI ' + interval.map(v=>formatted(v,d)).join(' to ') : '';
    const detail = [ci, !['percent','billions','millions'].includes(d.format) ? d.unit : ''].filter(Boolean).join(' · ');
    return {label:name, period:d.labels[i], value:Number.isFinite(values[i])?formatted(values[i],d):'No estimate', detail, color:seriesColor(d,s)};
  };
  const inspect = (i,s) => {
    index = i; series = s; el.dataset.series = String(s); select.value = String(i);
    const value = d.series[s][1][i], data = describe(i,s);
    guide.setAttribute('x1',x(i)); guide.setAttribute('x2',x(i));
    dot.setAttribute('visibility',Number.isFinite(value)?'visible':'hidden');
    if (Number.isFinite(value)) {
      dot.setAttribute('cx',x(i)); dot.setAttribute('cy',y(value)); dot.setAttribute('stroke',data.color);
    }
    legend.forEach((element,j)=>{element.textContent = formatted(d.series[j][1][i],d);});
    el.setAttribute('aria-valuenow',i+1);
    el.setAttribute('aria-valuetext',[data.period,data.label,data.value,data.detail].filter(Boolean).join(', '));
  };
  const pointForKeyboard = () => {
    const rect = el.getBoundingClientRect(), val = d.series[series][1][index];
    return [rect.left + x(index)*rect.width/w, rect.top + (Number.isFinite(val)?y(val):top)*rect.height/h];
  };
  const show = (mode, point) => {
    const [px,py] = point || pointForKeyboard();
    showTip(el,index+'/'+series,describe(index,series),px,py,mode,el.getBoundingClientRect());
  };
  const pointer = (e,mode) => {
    if (mode === 'hover' && (activeTip?.pinned || (e.pointerType && !['mouse','pen'].includes(e.pointerType)))) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX-rect.left)*w/rect.width, py = (e.clientY-rect.top)*h/rect.height;
    if (mode === 'hover' && (px < left-5 || px > right+5 || py < top-8 || py > bottom+8)) {
      if (activeTip?.owner === el) hideTip();
      return;
    }
    let closest = 0;
    for (let i=1;i<n;i++) if (Math.abs(x(i)-px) < Math.abs(x(closest)-px)) closest=i;
    let closestSeries=series, distance=Infinity;
    d.series.forEach(([,values],j) => {
      if (!Number.isFinite(values[closest])) return;
      const delta=Math.abs(y(values[closest])-py);
      if (delta<distance) {distance=delta;closestSeries=j;}
    });
    inspect(closest,closestSeries);
    show(mode,[e.clientX,e.clientY]);
  };
  inspect(index,series);
  select.onchange=()=>{inspect(Number(select.value),series); show('focus');};
  el.onpointermove=e=>pointer(e,'hover');
  el.onpointerleave=()=>{if(activeTip?.owner===el && !activeTip.pinned) hideTip();};
  el.onclick=e=>{if (e.detail) pointer(e,'pin'); else show('pin');};
  el.onfocus=()=>show('focus');
  el.onkeydown=e=>{
    if (!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End',' ','Enter'].includes(e.key)) return;
    e.preventDefault();
    if (e.key===' ' || e.key==='Enter') {show('pin');return;}
    hideTip();
    if (e.key==='ArrowLeft') index=Math.max(0,index-1);
    if (e.key==='ArrowRight') index=Math.min(n-1,index+1);
    if (e.key==='Home') index=0;
    if (e.key==='End') index=n-1;
    if (e.key==='ArrowDown') series=(series+1)%d.series.length;
    if (e.key==='ArrowUp') series=(series+d.series.length-1)%d.series.length;
    inspect(index,series);show('focus');
  };
}

function mountCanvases(region) {
  const paint=(el,width)=>{const d=charts.get(el.id);if(d)draw(el,d,width);};
  if (!observer && typeof ResizeObserver!=='undefined') {
    observer=new ResizeObserver(entries=>entries.forEach(entry=>paint(entry.target,entry.contentRect.width)));
  }
  region.querySelectorAll('.history-canvas').forEach(el=>{
    paint(el,el.getBoundingClientRect().width);
    observer?.observe(el);
  });
}
export function mountCharts(main) {
  bindInteractions(main.ownerDocument);
  mountCanvases(main);
}

export function refreshChartRegion(region, makeHTML) {
  if (!region) return;
  const nextId = chartId;
  let html;
  try {
    html = makeHTML();
  } catch (error) {
    for (let id=nextId;id<chartId;id++) charts.delete('history-'+id);
    throw error;
  }
  if (activeTip && region.contains(activeTip.owner)) hideTip();
  region.querySelectorAll('.history-canvas').forEach(el=>{
    observer?.unobserve(el);
    charts.delete(el.id);
  });
  region.innerHTML=html;
  mountCharts(region);
}

export function sourcesFooter(entries, text = []) {
  const notes=text.map(t=>`<p>${escapeHTML(t)}</p>`).join('');
  const links=Array.from(new Map(entries.map(item=>[item[1],item])).values())
    .map(([label,url])=>`<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(label)}</a></li>`).join('');
  return `<section class="source-foot" aria-label="Sources and methods"><h2>Sources and methods</h2><div class="source-body">${notes?'<div class="source-notes">'+notes+'</div>':''}${links?'<ul class="source-links" aria-label="References">'+links+'</ul>':''}</div></section>`;
}

export function measures(items) {
  return `<div class="measure-strip">${items.map(([number,label])=>`<div><strong>${escapeHTML(number)}</strong><span>${escapeHTML(label)}</span></div>`).join('')}</div>`;
}

export function barList(rows, options = {}) {
  const {max=100,format=v=>v.toFixed(1)+'%',color='#5147b5',context=''}=options;
  const items=rows.map(([label,value])=>{
    const valid=Number.isFinite(value), display=valid?format(value):'—';
    const attrs=valid?` role="button" tabindex="0" ${chartMark(label,display,context)}`:'';
    const width=valid&&max>0?clamp(value/max*100,0,100):0;
    return `<div${attrs}><span>${escapeHTML(label)}</span><i aria-hidden="true"><em style="width:${width}%;background:${escapeHTML(color)}"></em></i><b>${escapeHTML(display)}</b></div>`;
  });
  return '<div class="read-bars">'+items.join('')+'</div>';
}

export function matrix(title,unit,groups,headers,colors,controls='') {
  const groupBlocks=groups.map(([group,rows])=>{
    const header=headers.map(v=>`<th scope="col">${escapeHTML(v)}</th>`).join('');
    const body=rows.map(([label,...values])=>{
      const cells=values.map((v,i)=>{
        if (!Number.isFinite(v)) return '<td>—</td>';
        const value=v.toFixed(1)+'%';
        if (!colors[i]) return `<td><b>${value}</b></td>`;
        const bar=`<i aria-hidden="true"><em style="background:${escapeHTML(colors[i])};width:${clamp(v,0,100)}%"></em></i>`;
        return `<td><button type="button" class="matrix-value" ${chartMark(headers[i],value,group+' · '+label)}><b>${value}</b>${bar}</button></td>`;
      }).join('');
      return `<tr><th scope="row">${escapeHTML(label)}</th>${cells}</tr>`;
    }).join('');
    return `<section><h3>${escapeHTML(group)}</h3><table aria-label="${escapeHTML(group+' · '+title)}"><thead><tr><th scope="col">Group</th>${header}</tr></thead><tbody>${body}</tbody></table></section>`;
  });
  const legend=headers.map((h,i)=>colors[i]?`<span><i style="background:${escapeHTML(colors[i])}"></i>${escapeHTML(h)}</span>`:'').join('');
  return `<article class="panel matrix-panel"><div class="section-top"><h2>${escapeHTML(title)}</h2>${controls}</div><p class="axis-unit">${escapeHTML(unit)}</p><div class="matrix-grid matrix-facets">${groupBlocks.join('')}</div><div class="matrix-legend">${legend}</div></article>`;
}
