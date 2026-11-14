import {populationProfile} from './profile.js?v=complete-20261112';
import {healthFields} from './analytics.js?v=complete-20261112';
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}),pf=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const n=v=>nf.format(v),pct=v=>Number.isFinite(v)?pf.format(v)+'%':'—';
const names={S1:'Sem ocupação, quase todos sem seguro',S2:'Sem ocupação, com seguro privado',S3:'Mais velhos, fora da força de trabalho',S4:'Não cidadãos, com seguro público',S5:'Ocupados, quase todos sem seguro',S6:'Cidadãos ocupados, cobertura pública ou ausente',S7:'Não cidadãos ocupados, com seguro privado',S8:'Cidadãos ocupados, com seguro privado'};
const colors=['#208f80','#648bb6','#9b88b8','#bf9359','#c17d6d','#79a4a5','#6f9a76','#6886a8'];
const share=(s,id,keys)=>{const d=s.profile.byId[id];return d.weight?d.categories.filter(c=>keys.includes(c.key)).reduce((t,c)=>t+c.percent,0):null;};
const fact=(s,id)=>s.profile.indicators.find(i=>i.id===id)?.value??null;
export function segmentProfiles(model,rows){
  const adults=rows.filter(r=>model.number(r,'AGE')>=18),adultWeight=model.total(adults),minors=rows.filter(r=>model.number(r,'AGE')<18);
  const profiles=Object.entries(names).map(([id,name])=>{const group=adults.filter(r=>r.segment[0]===id),p=populationProfile(model,group),f=Object.fromEntries(p.indicators.map(i=>[i.id,i]));const s={id,name,n:group.length,population:p.population,share:adultWeight?100*p.population/adultWeight:null,profile:p};
    Object.assign(s,{age:f.idade_mediana.value,income:f.renda_pessoal_mediana.value,familyIncome:f.renda_familiar_mediana.value,perCapita:f.renda_per_capita_mediana.value,earnedIncome:f.renda_trabalho_mediana.value,englishLimited:f.ingles_limitado.value,uninsured:f.sem_seguro.value,naturalized:f.naturalizados.value,family:f.familia_mediana.value,years:f.tempo_eua_mediano.value,female:f.mulheres.value,degree:f.superior_completo.value,children:f.com_filhos.value,employed:share(s,'emprego',['1'])});return s;});
  return {profiles,adultN:adults.length,adultPopulation:adultWeight,minorN:minors.length,minorPopulation:model.total(minors)};
}
export function segmentComparisonRows(){
  const rows=[],metric=(group,id,label,note,unit,read,section=null)=>rows.push({group,id,label,note,unit,read,section});
  const f=(group,id,label,note,unit='percent')=>metric(group,id,label,note,unit,s=>fact(s,id));
  const c=(group,id,key,label,note='Adultos do segmento')=>metric(group,id+'_'+key,label,note,'percent',s=>share(s,id,[key]),id);
  const dem='Demografia e família';
  f(dem,'idade_mediana','Idade mediana','Anos','years');f(dem,'mulheres','Sexo feminino','Adultos do segmento');f(dem,'superior_completo','Bacharelado ou pós','25 anos ou mais');f(dem,'familia_mediana','Tamanho mediano da família','Inclui a própria pessoa','people');f(dem,'com_filhos','Com filhos próprios no domicílio','Filhos de qualquer idade');f(dem,'tempo_eua_mediano','Tempo mediano nos EUA','Anos entre adultos','years');
  const job='Trabalho e inglês';
  for(const [key,label] of [['1','Empregados'],['2','Desempregados, buscando trabalho'],['3','Fora da força de trabalho']])c(job,'emprego',key,label);
  for(const [key,label] of [['1','Não fala inglês'],['6','Não fala bem inglês'],['5','Fala bem inglês'],['4','Fala muito bem inglês'],['3','Só inglês em casa']])c(job,'ingles',key,label);
  const money='Renda anual · US$';
  f(money,'renda_pessoal_mediana','Renda pessoal total · mediana','Todas as fontes · inclui zero','usd');f(money,'renda_trabalho_mediana','Renda do trabalho · mediana','Salários e negócio próprio · inclui zero','usd');f(money,'renda_familiar_mediana','Renda familiar total · mediana','Ponderação por pessoas','usd');f(money,'renda_per_capita_mediana','Renda familiar por pessoa · mediana','FTOTINC ÷ FAMSIZE','usd');f(money,'renda_per_capita_media','Renda familiar por pessoa · média','FTOTINC ÷ FAMSIZE','usd');
  const citizen='Cidadania';for(const [key,label] of [['2','Naturalizados'],['3','Não cidadãos americanos'],['1','Cidadãos americanos ao nascer']])c(citizen,'cidadania',key,label);
  const health='Saúde e acesso';c(health,'cobertura','2','Com algum seguro');for(const [key,label] of [['none','Sem seguro'],['private','Somente seguro privado'],['public','Somente seguro público'],['both','Seguro privado e público']])c(health,'seguro',key,label);
  for(const field of healthFields)c(health,field.id,'2','Dificuldade: '+field.label.toLowerCase(),'Condições podem se sobrepor');
  const geo='Localização';for(const [key,label] of [['36','Nova York'],['34','Nova Jersey'],['09','Connecticut']])c(geo,'estado',key,label);
  for(const [id,label] of [['cidade','Município identificável mais frequente'],['metropolitana','Região metropolitana mais frequente']])metric(geo,id+'_principal',label,'Participação no total do segmento','text',s=>{const d=s.profile.byId[id],top=[...d.categories].filter(c=>!c.missing).sort((a,b)=>b.weight-a.weight)[0];return top?top.label+' · '+pct(top.percent):null;},id);
  metric(geo,'municipio_nao_identificavel','Município não identificável','Incluído no denominador','percent',s=>{const d=s.profile.byId.cidade;return d.weight?100*d.missingWeight/d.weight:null;},'cidade');
  return rows;
}
const formatted=(v,unit)=>v===null||v===undefined?'—':unit==='percent'?pct(v):unit==='usd'?'US$ '+n(v):unit==='years'?n(v)+' anos':unit==='people'?n(v)+' pessoas':h(v);
export function renderSegmentCards(result){
  if(!result.adultN)return '<div class="dashboard-empty"><strong>Sem adultos neste recorte</strong><p>Os perfis S1–S8 se aplicam a pessoas de 18 anos ou mais. Ajuste os filtros para compará-los.</p></div>';
  const profiles=result.profiles,metrics=segmentComparisonRows();let group='';
  const body=metrics.map(row=>{const heading=row.group!==group?'<tr class="segment-section"><th colspan="9">'+h(row.group)+'</th></tr>':'';group=row.group;return heading+'<tr data-segment-metric="'+row.id+'"><th scope="row">'+h(row.label)+'<small>'+h(row.note)+'</small></th>'+profiles.map((s,i)=>{const v=s.n?row.read(s):null,section=row.section?s.profile.byId[row.section]:null;const title=section?'Base: '+n(section.weight)+' pessoas estimadas · n='+section.n:'Indicador ponderado por PERWT; base indicada na linha';return '<td data-segment="'+s.id+'" class="'+(row.unit==='text'?'location-value':'')+'" title="'+h(title)+'" style="--segment-color:'+colors[i]+'">'+(row.unit==='percent'&&v!==null?'<div class="comparison-percent"><strong>'+formatted(v,row.unit)+'</strong><span><i style="width:'+v+'%"></i></span></div>':'<strong>'+formatted(v,row.unit)+'</strong>')+'</td>';}).join('')+'</tr>';}).join('');
  return '<div class="segment-comparison-wrap"><table class="segment-comparison" aria-label="Comparação completa dos oito segmentos"><thead><tr><th scope="col"><span class="eyebrow">PERFIS PONDERADOS</span><strong>Compare os segmentos</strong><small>Uma coluna por perfil.<br>Valores do recorte atual.</small></th>'+profiles.map((s,i)=>'<th scope="col" data-segment-card="'+s.id+'" style="--segment-color:'+colors[i]+'"><span class="segment-badge">'+s.id+'</span><h3>'+h(s.name)+'</h3><strong class="segment-share">'+pct(s.share)+'</strong><small>dos adultos do recorte</small><div class="segment-header-base">'+n(s.population)+' pessoas<br>n = '+n(s.n)+'</div></th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div><p class="segment-reading-note">Percentuais e rendas usam PERWT. A escolaridade usa 25 anos ou mais; os demais indicadores são descritos entre os adultos de cada grupo, com informação válida. Renda familiar por pessoa usa todos os familiares corresidentes, mesmo os que não são brasileiros. As limitações funcionais podem se sobrepor. Os perfis são exploratórios e mantêm o modelo nacional de 2024.</p>';
}
