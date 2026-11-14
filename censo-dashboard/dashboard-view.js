import {distributionCard} from './charts.js?v=complete-20261112';
import {healthFields} from './analytics.js?v=complete-20261112';
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}),pf=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const n=v=>nf.format(v),pct=v=>Number.isFinite(v)?pf.format(v)+'%':'—';
export function compactGeoCategories(section,limit=5){
  const known=section.categories.filter(c=>!c.missing).sort((a,b)=>b.weight-a.weight),unknown=section.categories.filter(c=>c.missing);
  const top=known.slice(0,limit),rest=known.slice(limit);
  if(rest.length)top.push({key:'_other',label:'Outras localidades',n:rest.reduce((t,c)=>t+c.n,0),weight:rest.reduce((t,c)=>t+c.weight,0),percent:rest.reduce((t,c)=>t+c.percent,0)});
  return [...top,...unknown];
}
export function healthOverview(p){
  return '<article class="distribution-card health-board" data-profile-card="limitacoes"><header><div><h3>Limitações funcionais</h3><span>Pessoas que relatam dificuldade · percentuais ponderados</span></div><span class="chart-method">PERWT</span></header><div class="health-board-rows">'+healthFields.map(field=>{const s=p.byId[field.id],yes=s.categories.find(c=>c.key==='2'),v=s.weight?(yes?.percent??0):null;return '<div class="health-row" data-health-field="'+field.id+'" title="'+h(field.description)+' · base: '+n(s.weight)+' pessoas estimadas, n='+s.n+'"><div><strong>'+h(field.label)+'</strong><small>'+h(s.universe)+' · '+n(yes?.weight??0)+' pessoas estimadas com dificuldade</small></div><div class="health-mini-track"><i style="width:'+(v??0)+'%"></i></div><b>'+pct(v)+'</b></div>';}).join('')+'</div><footer>As condições podem se sobrepor; cada linha usa sua população elegível.</footer></article>';
}
export function renderOverview(p){
  if(!p.n)return '<div class="dashboard-empty"><strong>Nenhum registro neste recorte</strong><p>Amplie os filtros para visualizar o perfil.</p></div>';
  const card=id=>{const s=p.byId[id],visible=['cidade','metropolitana'].includes(id)?{...s,categories:compactGeoCategories(s)}:s;return distributionCard(visible,p.indicators);};
  const group=(id,title,note,ids,cols=4,extra='')=>'<section class="overview-section" id="overview-'+id+'"><div class="overview-section-heading"><h2>'+h(title)+'</h2><p>'+h(note)+'</p></div><div class="overview-row cols-'+cols+'">'+ids.map(card).join('')+extra+'</div></section>';
  return '<div class="complete-overview">'+
    group('people','Pessoas e família','Sexo, idade, escolaridade e composição familiar. A base de cada indicador aparece no cartão.',['sexo','idade','escolaridade','familia'])+
    group('work','Trabalho, renda e inglês','Rendas anuais em US$. Renda familiar por pessoa = renda da família ÷ número de familiares corresidentes.',['emprego','renda_pessoal','renda_per_capita','ingles'])+
    group('location','Onde vivem','Estados, municípios e áreas metropolitanas do mesmo recorte, apresentados juntos.',['estado','cidade','metropolitana'],3)+
    '<p class="geography-explanation"><strong>Por que há município não identificável?</strong> Os microdados públicos informam áreas chamadas PUMAs, que podem reunir várias cidades. O IPUMS só atribui uma cidade quando a correspondência é suficientemente precisa. “Não identificável” permanece no total e não significa que a pessoa esteja sem residência. Mesmo as cidades identificadas são aproximações. <a href="https://usa.ipums.org/usa/volii/cities.shtml" target="_blank" rel="noreferrer">Entenda a geografia no IPUMS ↗</a></p>'+
    group('citizen','Cidadania, filhos e trajetória','Naturalização, cidadania ao nascer e não cidadania são categorias distintas. Filhos próprios de qualquer idade presentes no domicílio.',['cidadania','filhos','tempo_eua','renda_familiar'])+
    group('income','Renda do trabalho e condições econômicas','Renda do trabalho inclui salários e negócio próprio. A renda pessoal total também inclui outras fontes.',['renda_trabalho','pobreza'],2)+
    group('health','Saúde e acesso','Seguro e dificuldades funcionais disponíveis na ACS. São informações declaradas; as dificuldades podem ocorrer juntas.',['cobertura','seguro'],4,healthOverview(p))+
    '</div>';
}
