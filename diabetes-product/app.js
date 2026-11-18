import {sources,products,demographics} from './data.js';
import {histories,links,complications} from './evidence.js';
import {resetCharts,mountCharts} from './charts.js';
import {introduction,epidemiology,comparisonHistory} from './epidemiology.js';
import {healthcare} from './healthcare.js';
import {patientProfile,caregiverProfile,personaPage,journey,routine,questions,cgmHistory,cgmMedicare} from './audience.js';
import {market,innovation,catalog,compareProducts,online,painMap,influencers,publicProfile,searchHistory} from './market-signals.js';
import {stateNames} from './map-data.js';

const $=id=>document.getElementById(id);
const view={state:null,period:2000,costMode:0,costState:null,patientScope:'Type 2',search:'',deviceType:'t2',category:'all',selected:new Set(),theme:'food'};
const audienceGroups={patients:'Patients',caregivers:'Caregivers',public:'General public'};
const chapters=[['intro','Introduction'],['epidemiology','Epidemiology'],['healthcare','Healthcare system']];
const audiencePages=[['profile','Profile'],['personas','Personas'],['journey','Journey'],['routine','Care routine'],['questions','Questions']];
const signals=[['signals/search','Google Trends'],['signals/pain','Pain map'],['signals/voices','Influencers']];
const industry=[['industry/market','Market overview'],['industry/companies','Innovation timeline'],['industry/products','Devices and products']];
const aliases={overview:'epidemiology',people:'patients/profile',family:'caregivers/profile',journey:'patients/journey',personas:'patients/personas',life:'patients/routine',products:'industry/products',industry:'industry/market',market:'industry/market',online:'signals/search',influencers:'signals/voices','public/online':'signals/search','public/influencers':'signals/voices',introduction:'intro',patients:'patients/profile',caregivers:'caregivers/profile',public:'public/profile'};
const main=$('main-content');
let data,route='';
async function loadData(){
  const assets={svg:'us-map.svg',states:'data/state-series.json',profiles:'data/state-profile.json',nhis:'data/nhis.json',coverage:'data/coverage.json'};
  return Object.fromEntries(await Promise.all(Object.entries(assets).map(async([key,url])=>{
    const response=await fetch(url);
    if(!response.ok)throw new Error('Failed to load '+url);
    return [key, key==='svg'?await response.text():await response.json()];
  })));
}
function navLink(path,name,group=''){
  const current=path===route;
  return `<a href="#${path}" class="${current?'active':group && route.startsWith(group+'/')?'in-section':''}" ${current?'aria-current="page"':''}>${name}</a>`;
}
function navigation(){
  const group=(name,html)=>`<section class="nav-cluster" aria-label="${name}"><h2>${name}</h2>${html}</section>`;
  const audience=Object.entries(audienceGroups).map(([id,label])=>{
    const active=route.startsWith(id+'/');
    const tabs=id==='public'?[['profile','Profile'],['questions','Questions']]:audiencePages;
    return navLink(id+'/profile',label,id)+(active?`<div class="audience-pages">${tabs.filter(([slug])=>slug!=='profile').map(([slug,text])=>navLink(id+'/'+slug,text)).join('')}</div>`:'');
  }).join('');
  $('navigation').innerHTML=chapters.map(([k,n])=>navLink(k,n)).join('')+
    group('Audience',audience)+group('Digital signals',signals.map(([k,n])=>navLink(k,n)).join(''))+
    group('Industry & market',industry.map(([k,n])=>navLink(k,n)).join(''));
}
function currentRoute(){
  const raw=decodeURIComponent(location.hash.slice(1))||'intro';
  return aliases[raw]||raw;
}
function content(){
  const [group,part]=route.split('/');
  if(route==='intro')return introduction();
  if(route==='epidemiology')return epidemiology(data,view);
  if(route==='healthcare')return healthcare(data,view);
  if(route==='industry/market')return market();
  if(route==='industry/companies')return innovation();
  if(route==='industry/products')return catalog(view);
  if(route==='signals/search')return online(view.theme);
  if(route==='signals/pain')return painMap();
  if(route==='signals/voices')return influencers();
  if(group in audienceGroups){
    if(part==='profile')return group==='patients'?patientProfile(data.nhis,view.patientScope):group==='caregivers'?caregiverProfile():publicProfile();
    if(part==='questions')return questions(group);
    if(group!=='public'){
      if(part==='personas')return personaPage(group);
      if(part==='journey')return journey(group);
      if(part==='routine')return routine(group,data.nhis);
    }
  }
  route='intro';
  return introduction();
}
function render(){
  resetCharts();
  main.innerHTML=content()+`<footer class="report-footer"><span>Perspective · Research edition</span><button id="export" type="button">Export data ↓</button></footer>`;
  navigation();
  document.title=(main.querySelector('h1')?.textContent||'Diabetes')+' · Perspective';
  mountCharts(main);
  comparisonBar();
}
function activateRoute(){
  if(location.hash==='#main-content'){main.focus();return;}
  route=currentRoute();
  document.body.classList.remove('menu-open');$('menu-toggle').setAttribute('aria-expanded','false');
  render();window.scrollTo(0,0);
}
function selection(action,anchor) {
  const ref=anchor?.closest('.atlas'),before=ref?.getBoundingClientRect().top;
  action();render();
  if(before!=null){
    const map=main.querySelector('.atlas');
    if(map){window.scrollBy(0,map.getBoundingClientRect().top-before);if(anchor.matches('select')||anchor.matches(':focus')) map.querySelector('select')?.focus({preventScroll:true});}
  }
}
function comparisonBar(){
  const bar=$('compare-bar');
  bar.hidden=route!=='industry/products'||!view.selected.size;
  if(!bar.hidden)bar.innerHTML=`<span>${view.selected.size} of 3 selected</span><button data-compare-now ${view.selected.size<2?'disabled':''}>Compare</button><button data-compare-clear>Clear</button>`;
}
function dialog(content){
  $('dialog-body').innerHTML=content;
  if(!$('dialog').open)$('dialog').showModal();
}
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-state],[data-cost-state],.skip-link');
  if(!t)return;
  if(t.matches('.skip-link')){e.preventDefault();main.focus();return;}
  if(t.id==='menu-toggle'){const open=document.body.classList.toggle('menu-open');t.setAttribute('aria-expanded',String(open));return;}
  if(t.id==='close'){$('dialog').close();return;}
  if(t.id==='export'){exportData();return;}
  const d=t.dataset;
  if(d.state){selection(()=>{view.state=d.state},t);return;}
  if(d.costState){selection(()=>{view.costState=d.costState},t);return;}
  if(d.costMode!==undefined){selection(()=>{view.costMode=Number(d.costMode)},t);return;}
  if(d.period){view.period=Number(d.period);render();return;}
  if(d.scope){view.patientScope=d.scope;render();return;}
  if(d.theme){view.theme=d.theme;render();return;}
  if(t.hasAttribute('data-compare-clear')){view.selected.clear();render();return;}
  if(t.hasAttribute('data-compare-now'))dialog(compareProducts(view.selected));
});
document.addEventListener('keydown',e=>{
  const target=e.target.closest('.atlas-state');
  if(target && ['Enter',' '].includes(e.key)){e.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
document.addEventListener('change',e=>{
  const t=e.target, d=t.dataset;
  if(d.picker){selection(()=>{if(d.picker==='geo')view.state=t.value||null;else view.costState=t.value||null},t);return;}
  if(t.id==='device-type'){view.deviceType=t.value;render();return;}
  if(t.id==='category'){view.category=t.value;render();return;}
  if(d.compare){if(t.checked&&view.selected.size>=3){t.checked=false;dialog('<h2>Compare up to three products</h2><p>Remove one selection to add another.</p>');return;}t.checked?view.selected.add(d.compare):view.selected.delete(d.compare);comparisonBar();}
});
document.addEventListener('input',e=>{
  if(e.target.id!=='product-search')return;
  const position=e.target.selectionStart;
  view.search=e.target.value;render();
  $('product-search').focus();$('product-search').setSelectionRange(position,position);
});
function exportData(){
  const rows=[['Section','Measure','Group or period','Value','Unit / population','Source']];
  for(const series of [...Object.values(histories),comparisonHistory(data.nhis),cgmHistory,cgmMedicare,searchHistory]){
    for(const [seriesName,values] of series.series)series.labels.forEach((period,i)=>rows.push([series.title,seriesName,period,values[i],series.unit,series.source]));
  }
  for(const d of Object.values(demographics))for(const [label,v,ci] of d.rows)rows.push(['Epidemiology',d.label,label,v,d.scope+' · % (95% CI '+ci+')',sources[d.source].url]);
  for(const [dim,groups] of Object.entries(data.nhis.comparison))for(const [label,...values] of groups)values.forEach((v,i)=>rows.push(['Condition comparison · 2025',data.nhis.labels[i],dim+' / '+label,v,'% of adults in group',links.nhis]));
  for(const [scope,profile] of Object.entries(data.nhis.profiles))for(const [dim,list] of Object.entries(profile.groups))for(const [group,...vs] of list)vs.forEach((v,i)=>rows.push(['Patient profile · '+scope,['Patient share','Insulin','Oral medication','Other injectables'][i],dim+' / '+group,v,i?'% of patient group':'% of selected population',links.nhis]));
  for(const [key,list] of Object.entries(data.nhis.type2Routine))for(const [label,v] of list)rows.push(['Patient care routines',key==='a1c'?'Last A1C check':'Felt overwhelmed in the past month',label,v,'% of adults with type 2 diabetes · 2025',links.nhis]);
  for(const rec of data.states)rows.push(['Geography','Age-adjusted diagnosed diabetes',rec.year+' / '+(stateNames[rec.state]||'U.S. state median'),rec.estimate,'%',links.states]);
  for(const [id,rec] of Object.entries(data.profiles))for(const [dim,groups] of Object.entries(rec.groups))for(const [group,v] of Object.entries(groups))rows.push(['State profile · 2024',stateNames[id],dim+' / '+group,v,'%',links.states]);
  for(const [condition,a,b] of complications)for(const [year,v] of [[2020,a],[2021,b]])rows.push(['Hospital care',condition,year,v*1000,'Discharges',links.cdc]);
  for(const p of products)rows.push(['Industry',p.name,p.cat,p.access,p.audience,sources[p.source].url]);
  const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='perspective-us-diabetes.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
try{data=await loadData();window.addEventListener('hashchange',activateRoute);activateRoute();}
catch(error){main.innerHTML='<h1>Research data could not load</h1><p>Reload the page to try again.</p>';console.error(error);}

