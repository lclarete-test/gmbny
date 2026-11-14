const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}),pf=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const n=v=>nf.format(v),pct=v=>Number.isFinite(v)?pf.format(v)+'%':'—';
const palette=['#208f80','#86a8cd','#d6ad70','#aa9bc4','#b9cbd4'];
const amount=(s,c)=>s.sample?c.n:c.weight,unit=s=>s.sample?'registros':'pessoas estimadas';
const categoryColor=(s,c,i)=>c.missing?'#c6c5be':s.id==='sexo'?({'1':'#86a8cd','2':'#208f80'}[c.key]||palette[i%palette.length]):s.id==='cobertura'?({'1':'#d6ad70','2':'#208f80'}[c.key]||palette[i%palette.length]):s.id.startsWith('dificuldade_')?({'1':'#afbfce','2':'#9b89b4'}[c.key]||palette[i%palette.length]):s.id==='seguro'?({none:'#d6ad70',private:'#208f80',public:'#86a8cd',both:'#aa9bc4'}[c.key]||palette[i%palette.length]):palette[i%palette.length];
export function horizontalPlot(s){
  const max=Math.max(1,...s.categories.map(c=>c.percent));
  return '<div class="polished-bars">'+s.categories.map((c,i)=>'<div class="polished-bar-row '+(c.missing?'missing':'')+'" title="'+h(c.label)+' · '+n(c.weight)+' pessoas estimadas · n='+c.n+'"><div class="polished-bar-label"><span>'+h(c.label)+'</span><strong>'+pct(c.percent)+'</strong></div><div class="polished-bar-track"><i style="width:'+(100*c.percent/max).toFixed(4)+'%;--bar-color:'+categoryColor(s,c,i)+'"></i></div><span class="polished-bar-count">'+n(amount(s,c))+' '+unit(s)+'</span></div>').join('')+'</div>';
}
export function ringPlot(s){
  const circumference=2*Math.PI*53;let offset=0;
  const slices=s.categories.map((c,i)=>{const length=c.percent*circumference/100;const arc='<circle cx="72" cy="72" r="53" fill="none" stroke="'+categoryColor(s,c,i)+'" stroke-width="17" stroke-dasharray="'+length+' '+(circumference-length)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 72 72)"/>';offset+=length;return arc;}).join('');
  return '<div class="polished-ring"><div class="ring-figure"><svg viewBox="0 0 144 144" role="img" aria-label="Distribuição '+(s.sample?'amostral':'ponderada')+' de '+h(s.title||'categorias')+'"><circle cx="72" cy="72" r="53" fill="none" stroke="#f0f4f6" stroke-width="17"/>'+slices+'</svg><div class="ring-center"><strong>'+n(s.sample?s.n:s.weight)+'</strong><span>'+unit(s)+'</span></div></div><div class="ring-legend">'+s.categories.map((c,i)=>'<div title="'+h(c.label)+' · n='+c.n+'"><i style="background:'+categoryColor(s,c,i)+'"></i><span>'+h(c.label)+'<small>'+n(amount(s,c))+' '+(s.sample?'registros':'pessoas')+'</small></span><strong>'+pct(c.percent)+'</strong></div>').join('')+'</div></div>';
}
function geoRows(s){
  const known=s.categories.filter(c=>!c.missing).sort((a,b)=>b.weight-a.weight),missing=s.categories.filter(c=>c.missing);
  if(s.id==='metropolitana'&&known.length>7){const rest=known.splice(7);known.push({label:'Outras regiões metropolitanas',n:rest.reduce((t,c)=>t+c.n,0),weight:rest.reduce((t,c)=>t+c.weight,0),percent:rest.reduce((t,c)=>t+c.percent,0)});}
  return [...known,...missing];
}
export function geographicPlot(s){
  return '<div class="polished-geography"><table><thead><tr><th>Localidade</th><th class="numeric">Pop. estimada</th><th class="numeric">% ponderado</th></tr></thead><tbody>'+geoRows(s).map(c=>'<tr class="'+(c.missing?'geo-not-known':'')+'" title="n='+c.n+'"><td>'+h(c.label)+'</td><td class="numeric">'+n(c.weight)+'</td><td class="numeric"><strong>'+pct(c.percent)+'</strong></td></tr>').join('')+'</tbody></table></div>';
}
export function frequencyFigure(s){
  if(!s.n)return '<div class="empty">Sem registros para este recorte.</div>';
  const ringIds=['sexo','cidadania','seguro','cobertura','emprego','estado'];
  return ringIds.includes(s.id)&&s.categories.length<=5?ringPlot(s):horizontalPlot(s);
}
export function distributionCard(s,indicators=[]){
  const facts=Object.fromEntries(indicators.map(i=>[i.id,i]));
  const medianKeys={renda_pessoal:'renda_pessoal_mediana',renda_familiar:'renda_familiar_mediana',familia:'familia_mediana',tempo_eua:'tempo_eua_mediano',renda_trabalho:'renda_trabalho_mediana',renda_per_capita:'renda_per_capita_mediana'};
  const median=facts[medianKeys[s.id]];
  const value=median?.value===null||!median?null:median.unit==='usd'?'US$ '+n(median.value):n(median.value)+' '+median.unit;
  const insight=value?'<div class="chart-insight"><span>Mediana ponderada</span><strong>'+value+'</strong></div>'+(s.id==='renda_per_capita'?'<div class="pc-mean">Média ponderada: <strong>US$ '+n(facts.renda_per_capita_media?.value)+'/ano</strong></div>':''):s.id==='escolaridade'&&Number.isFinite(facts.superior_completo?.value)?'<div class="chart-insight"><span>Bacharelado ou pós-graduação</span><strong>'+pct(facts.superior_completo.value)+'</strong></div>':'';
  const geographic=['cidade','estado','metropolitana'].includes(s.id);
  const missing=s.missingN?(s.includeMissing?'Sem identificação geográfica: '+pct(100*s.missingWeight/s.scopeWeight)+' da população do recorte.':'Sem informação: '+n(s.missingN)+' registros, excluídos deste indicador.'):'';
  return '<article class="distribution-card '+(geographic?'geographic-card':'')+'" data-profile-card="'+h(s.id)+'"><header><div><h3>'+h(s.title)+'</h3><span>'+h(s.universe)+'</span></div><span class="chart-method" title="'+h(s.description)+'">PERWT</span></header>'+insight+(s.n?(geographic?geographicPlot(s):frequencyFigure(s)):'<div class="empty">Sem pessoas elegíveis neste recorte.</div>')+(missing?'<p class="chart-missing">'+h(missing)+'</p>':'')+'<footer>'+n(s.weight)+' pessoas estimadas <span>· n = '+n(s.n)+'</span></footer></article>';
}
