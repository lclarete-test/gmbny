import {ecosystemPage} from './ecosystem.js';
import {publicCoverage,privateCoverage,payerRows} from './system-pages.js';
import {sources,demographics} from './data.js';
import {histories,links,complications} from './evidence.js';
import {resetCharts,mountCharts,currentSeries} from './charts.js';
import {epidemiology,comparisonHistory} from './epidemiology.js';
import {introduction,biology,clinicalProfile,amputationHistory,crisisHistory} from './clinical.js';
import {healthcare,medicaidTrend} from './healthcare.js';
import {cgmHistory,cgmMedicare} from './audience.js';
import {patientProfile,treatmentPage,populationHistory,segmentHistory} from './patient-research.js';
import {patientJourney} from './patient-journey.js';
import {patientRoutines} from './patient-routines.js';
import {caregiverProfile,caregiverJourney,caregiverQuestions} from './caregiver-pages.js';
import {hcpProfile,hcpJourney,hcpRelationship,patientQuestions} from './professionals.js';
import {physicianRows} from './physician-workforce.js';
import {organizationsPage,orgExportRows} from './organizations.js';
import {publicOverview,searchInterest,voices,publicSearchHistories} from './public-discussion.js';
import {marketOverview,policyPage,industryExportRows} from './industry-pages.js';
import {productEvolution,milestoneById,updateChallenge,readExploredStops,recordExploredStop} from './treatment-evolution.js';
import {catalogPage,compareCatalog,deviceById,deviceTasks,connectionDiagram,refreshDeviceResults} from './device-catalog.js';
import {searchHistory} from './market-signals.js';
import {stateNames} from './map-data.js';
import {painProfile} from './patient-pain.js';

const $=id=>document.getElementById(id);
const view={state:null,period:2000,costMode:0,costState:null,patientScope:'Type 2',profileMetric:'Population',treatmentScope:'Type 2',painScope:'Type 2',search:'',deviceType:'all',category:'all',deviceAccess:'all',openProduct:null,systemExample:'omni',sensorExample:null,selected:new Set(),milestone:null,explored:readExploredStops(),timelineQuiz:{index:0,answer:null},theme:'types',voiceRole:'all'};
const science=[['intro','Introduction'],['biology','Diabetes biology'],['epidemiology','Epidemiology'],['clinical','Clinical profile']];
const system=[['healthcare','Costs and care use'],['healthcare/public','Public coverage'],['healthcare/private','Private insurance'],['healthcare/policy','Public policy']];
const audiences=[['patients/profile','Patients'],['caregivers/profile','Caregivers'],['hcp/profile','Healthcare professionals'],['organizations','Organizations']];
const discussion=[['discussion','Public discussion'],['discussion/search','Search interest'],['discussion/voices','Public voices']];
const industry=[['industry/market','Market overview'],['industry/companies','Treatment evolution'],['industry/products','Devices and products']];
const sections={
  patients:[['profile','Profile'],['journey','Journey'],['routine','Care routine'],['treatment','Treatment and technology'],['pain','Pain map'],['questions','Questions']],
  caregivers:[['profile','Profile'],['journey','Journey'],['questions','Questions']],
  hcp:[['profile','Profile'],['journey','Journey'],['relationship','Patient relationship']]
};
const mergedSections={
  'patients/segments':['patients/profile','patient-coverage'],
  'patients/personas':['patients/profile','patient-coverage'],
  personas:['patients/profile','patient-coverage'],
  'caregivers/segments':['caregivers/profile','caregiver-hours'],
  'caregivers/personas':['caregivers/profile','caregiver-hours'],
  'caregivers/routine':['caregivers/profile','caregiver-daily'],
  'hcp/segments':['hcp/profile','educator-background'],
  'industry/market/treatment':['industry/market','treatment-payments'],
  'industry/market/labs':['industry/market','glucose-prices']
};
const aliases={overview:'epidemiology',people:'patients/profile',family:'caregivers/profile',journey:'patients/journey',life:'patients/routine',products:'industry/products',industry:'industry/market',market:'industry/market',online:'discussion/search',influencers:'discussion/voices','signals/search':'discussion/search','signals/pain':'patients/pain','signals/voices':'discussion/voices','public/online':'discussion/search','public/influencers':'discussion/voices','public/profile':'discussion','public/questions':'discussion/search',introduction:'intro',patients:'patients/profile',caregivers:'caregivers/profile',hcp:'hcp/profile',public:'discussion',policy:'healthcare/policy','epidemiology/clinical':'clinical'};
const main=$('main-content'),data={},requests=new Map();
let route='',generation=0;
const assetPaths={svg:'us-map.svg',states:'data/state-series.json',profiles:'data/state-profile.json',nhis:'data/nhis.json',coverage:'data/coverage.json',segments:'data/coverage-segments.json',caregivers:'data/caregiver-profile.json'};
async function loadData(keys=Object.keys(assetPaths)){
  await Promise.all(keys.map(key=>{
    if(data[key])return;
    if(!requests.has(key)){
      const url=assetPaths[key]+'?v=us-health-atlas-v1';
      const task=fetch(url).then(response=>{
        if(!response.ok)throw new Error('Failed to load '+url);
        return key==='svg'?response.text():response.json();
      }).then(value=>{data[key]=value}).finally(()=>requests.delete(key));
      requests.set(key,task);
    }
    return requests.get(key);
  }));
}
const pages={
  intro:[introduction],biology:[biology],epidemiology:[()=>epidemiology(data,view),'svg','states','profiles','nhis'],clinical:[()=>clinicalProfile(data.nhis),'nhis'],
  healthcare:[()=>healthcare(data,view),'svg','coverage'],'healthcare/public':[publicCoverage],'healthcare/private':[privateCoverage],'healthcare/policy':[policyPage],audience:[ecosystemPage],
  'patients/profile':[()=>patientProfile(data.nhis,data.segments,view),'nhis','segments'],
  'patients/journey':[()=>patientJourney(data.nhis),'nhis'],'patients/routine':[()=>patientRoutines(data.nhis),'nhis'],
  'patients/treatment':[()=>treatmentPage(data.nhis,view.treatmentScope),'nhis'],'patients/pain':[()=>painProfile(view.painScope)],'patients/questions':[patientQuestions],
  'caregivers/profile':[caregiverProfile],'caregivers/journey':[caregiverJourney],'caregivers/questions':[caregiverQuestions],
  'hcp/profile':[hcpProfile],'hcp/journey':[hcpJourney],'hcp/relationship':[hcpRelationship],organizations:[organizationsPage],
  discussion:[publicOverview],'discussion/search':[()=>searchInterest(view.theme)],'discussion/voices':[()=>voices(view.voiceRole)],
  'industry/market':[marketOverview],'industry/companies':[()=>productEvolution(view)],'industry/products':[()=>catalogPage(view)]
};
function navLink(path,name,active=path===route){
  return `<a href="#${path}" class="${active?'active':''}" ${path===route?'aria-current="page"':''}>${name}</a>`;
}
function linksFrom(rows){return rows.map(([path,name])=>navLink(path,name)).join('')}
function navigation(){
  const family=route.split('/')[0];
  const group=(name,html,path)=>`<section class="nav-cluster" aria-label="${name}"><h2>${path?navLink(path,name):name}</h2>${html}</section>`;
  const childLinks=prefix=>(sections[prefix]||[]).map(([slug,name])=>[prefix+'/'+slug,name]);
  const audienceHtml=audiences.map(([path,name])=>{
    const prefix=path.split('/')[0],active=prefix===family;
    if(active&&sections[prefix]){
      return `<a href="#${path}" class="in-section">${name}</a><div class="audience-pages">${linksFrom(childLinks(prefix))}</div>`;
    }
    return navLink(path,name);
  }).join('');
  $('navigation').innerHTML=linksFrom(science)+group('Healthcare system',linksFrom(system))+group('Audience',audienceHtml,'audience')+
    group('Public discussion',linksFrom([['discussion','Knowledge and campaigns'],...discussion.slice(1)]))+
    group('Industry & market',linksFrom(industry));
  const isAudience=Object.hasOwn(sections,family)||family==='organizations'||family==='audience';
  const mobile=[['intro','Introduction'],['biology','Biology'],['epidemiology','Epidemiology'],['clinical','Clinical profile'],['healthcare','Healthcare'],['audience','Audience'],['discussion','Public discussion'],['industry/market','Market']];
  const activeKey=isAudience?'audience':family==='industry'?'industry/market':['discussion','healthcare'].includes(family)?family:route;
  const sub=isAudience?audiences.map(([p,n])=>[p,p.startsWith('hcp/')?'HCPs':n]):family==='industry'?industry:family==='discussion'?[['discussion','Knowledge and campaigns'],...discussion.slice(1)]:family==='healthcare'?system:[];
  $('mobile-navigation').innerHTML=`<div class="mobile-chapters">${mobile.map(([p,n])=>navLink(p,n,p===activeKey)).join('')}</div>`+
    (sub.length?`<div class="mobile-sub">${sub.map(([p,n])=>navLink(p,n,isAudience?p.split('/')[0]===family:p===route)).join('')}</div>`:'')+
    (sections[family]?`<div class="mobile-topics">${linksFrom(childLinks(family))}</div>`:'');
}
function render(){
  resetCharts();
  main.innerHTML=pages[route][0]()+`<footer class="report-footer"><span>Perspective · Research edition</span><button id="export" type="button">Export data ↓</button></footer>`;
  navigation();
  document.title=(main.querySelector('h1')?.textContent||'Diabetes')+' · Perspective';
  mountCharts(main);comparisonBar();
}
async function activateRoute(){
  if(location.hash==='#main-content'){main.focus();return;}
  let raw;
  try{raw=decodeURIComponent(location.hash.slice(1))}catch{raw=''}
  const prior=route, focused=document.activeElement;
  const cameFromMap=!!focused?.closest('.ev-map');
  const cameFromPager=!!focused?.closest('.ev-pager');
  const cameFromChallenge=!!focused?.closest('.ev-challenge');
  const merged=Object.hasOwn(mergedSections,raw)?mergedSections[raw]:null;
  const parts=raw.split('/');
  let target=merged?.[1], detailRoute=false;
  route=merged?.[0]||aliases[raw]||raw||'intro';
  if(parts[0]==='industry'&&parts[1]==='companies'){
    route='industry/companies';
    const stop=parts.length===3?milestoneById.get(parts[2]):null;
    view.milestone=stop?.id||milestoneById.keys().next().value;
    recordExploredStop(view.explored,view.milestone);
    detailRoute=!!stop;
    if(stop&&prior===route&&(cameFromPager||cameFromChallenge))target='evolution-story';
  }
  if(parts[0]==='industry'&&parts[1]==='products'){
    route='industry/products';
    const path=parts.length===4&&parts[2]==='task'&&Object.hasOwn(deviceTasks,parts[3])?parts[3]:null;
    const product=parts.length===4&&parts[2]==='item'?deviceById.get(parts[3]):null;
    const previousCategory=view.category;
    view.category=product?.path||path||'all';
    view.openProduct=product?.id||null;
    if(product||prior!==route||!path||view.category!==previousCategory){
      view.search='';view.deviceType='all';view.deviceAccess='all';
    }
    if(product)target='catalog-'+product.id;
    detailRoute=!!(product||path);
  }
  if(!Object.hasOwn(pages,route))route='intro';
  if(raw&&raw!==route&&!detailRoute&&!(merged&&route==='industry/market'))history.replaceState(null,'','#'+route);
  const request=++generation;
  navigation();
  const needed=pages[route].slice(1);
  if(needed.some(k=>!data[k]))main.innerHTML='<p class="loading-message" role="status">Loading research data…</p>';
  try{
    await loadData(needed);
    if(request!==generation)return;
    render();
    const section=target&&document.getElementById(target);
    if(section){
      section.scrollIntoView({behavior:'instant'});
      if(target==='evolution-story')section.focus({preventScroll:true});
      if(view.openProduct&&route==='industry/products')section.querySelector('summary')?.focus({preventScroll:true});
    }else if(prior===route&&cameFromMap&&view.milestone){
      const links=[...main.querySelectorAll('.ev-map a[aria-current="step"]')];
      links.find(link=>link.getClientRects().length)?.focus({preventScroll:true});
    }else window.scrollTo(0,0);
  }catch(error){
    if(request!==generation)return;
    main.innerHTML='<h1>Research data could not load</h1><button type="button" data-retry>Retry</button>';
    console.error(error);
  }
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
  if(t.hasAttribute('data-retry')){activateRoute();return;}
  if(t.id==='close'){$('dialog').close();return;}
  if(t.id==='export'){exportData();return;}
  const d=t.dataset;
  if(t.hasAttribute('data-quiz-answer')||d.quizAction){updateChallenge(view.timelineQuiz,t);return;}
  if(t.hasAttribute('data-clear-device-filters')){
    view.search='';view.deviceType='all';view.deviceAccess='all';view.openProduct=null;
    $('product-search').value='';$('device-type').value='all';$('device-access').value='all';
    refreshDeviceResults(view);$('product-search').focus();return;
  }
  if(d.state){selection(()=>{view.state=d.state},t);return;}
  if(d.costState){selection(()=>{view.costState=d.costState},t);return;}
  if(d.costMode!==undefined){selection(()=>{view.costMode=Number(d.costMode)},t);return;}
  if(d.period){view.period=Number(d.period);render();return;}
  if(d.cohort){
    if(['patientScope','treatmentScope','painScope'].includes(d.cohort)&&['Type 1','Type 2','All diagnosed','Prediabetes only'].includes(d.value)){
      view[d.cohort]=d.value;render();main.querySelector('[data-cohort="'+d.cohort+'"][aria-pressed="true"]')?.focus({preventScroll:true});
    }
    return;
  }
  if(d.voiceRole){view.voiceRole=d.voiceRole;render();return;}
  if(d.theme){view.theme=d.theme;render();return;}
  if(t.hasAttribute('data-compare-clear')){view.selected.clear();render();return;}
  if(t.hasAttribute('data-compare-now'))dialog(compareCatalog(view.selected));
});
document.addEventListener('keydown',e=>{
  const target=e.target.closest('.atlas-state');
  if(target && ['Enter',' '].includes(e.key)){e.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
document.addEventListener('change',e=>{
  const t=e.target, d=t.dataset;
  if(d.picker){selection(()=>{if(d.picker==='geo')view.state=t.value||null;else view.costState=t.value||null},t);return;}
  if(t.id==='profile-dimension'){view.profileMetric=t.value;const top=t.getBoundingClientRect().top;render();const next=$('profile-dimension');window.scrollBy(0,next.getBoundingClientRect().top-top);next.focus({preventScroll:true});return;}
  if(t.id==='device-type'||t.id==='device-access'){
    view[t.id==='device-type'?'deviceType':'deviceAccess']=t.value;view.openProduct=null;
    refreshDeviceResults(view);return;
  }
  if(t.id==='dv-system'||t.id==='dv-sensor'){
    if(t.id==='dv-system'){view.systemExample=t.value;view.sensorExample=null;}
    else view.sensorExample=t.value;
    $('device-system').innerHTML=connectionDiagram(view.systemExample,view.sensorExample);
    $(t.id).focus({preventScroll:true});return;
  }
  if(d.compare){if(t.checked&&view.selected.size>=3){t.checked=false;dialog('<h2>Compare up to three products</h2><p>Remove one selection to add another.</p>');return;}t.checked?view.selected.add(d.compare):view.selected.delete(d.compare);comparisonBar();}
});
document.addEventListener('input',e=>{
  if(e.target.id!=='product-search')return;
  view.search=e.target.value;view.openProduct=null;refreshDeviceResults(view);
});
async function exportData(){
  try{await loadData()}catch{dialog('<h2>Download interrupted</h2><p>Try Export data again when the connection returns.</p>');return;}
  const rows=[['Section','Measure','Group or period','Value','Unit / population','Source']];
  const seriesByTitle=new Map();
  for(const series of [...Object.values(histories),comparisonHistory(data.nhis),cgmHistory,cgmMedicare,searchHistory,...publicSearchHistories,crisisHistory,amputationHistory,medicaidTrend,...currentSeries()]){
    seriesByTitle.set(series.title+' / '+series.unit,series);
  }
  for(const series of seriesByTitle.values()){
    for(const [seriesName,values] of series.series)series.labels.forEach((period,i)=>rows.push([series.title,seriesName,period,values[i],series.unit,series.source]));
  }
  for(const d of Object.values(demographics))for(const [label,v,ci] of d.rows)rows.push(['Epidemiology',d.label,label,v,d.scope+' · % (95% CI '+ci+')',sources[d.source].url]);
  for(const [dim,groups] of Object.entries(data.nhis.comparison))for(const [label,...values] of groups)values.forEach((v,i)=>rows.push(['Condition comparison · 2025',data.nhis.labels[i],dim+' / '+label,v,'% of adults in group',links.nhis]));
  for(const [scope,profile] of Object.entries(data.nhis.profiles))for(const [dim,list] of Object.entries(profile.groups))for(const [group,...vs] of list)vs.forEach((v,i)=>rows.push(['Patient profile · '+scope,['Patient share','Insulin','Oral medication','Other injectables'][i],dim+' / '+group,v,i?'% of patient group':'% of selected population',links.nhis]));
  for(const [key,list] of Object.entries(data.nhis.type2Routine))for(const [label,v] of list)rows.push(['Patient care routines',key==='a1c'?'Last A1C check':'Felt overwhelmed in the past month',label,v,'% of adults with type 2 diabetes · 2025',links.nhis]);
  for(const rec of data.states)rows.push(['Geography','Age-adjusted diagnosed diabetes',rec.year+' / '+(stateNames[rec.state]||'U.S. state median'),rec.estimate,'%',links.states]);
  for(const [id,rec] of Object.entries(data.profiles))for(const [dim,groups] of Object.entries(rec.groups))for(const [group,v] of Object.entries(groups))rows.push(['State profile · 2024',stateNames[id],dim+' / '+group,v,'%',links.states]);
  for(const [condition,a,b] of complications)for(const [year,v] of [[2020,a],[2021,b]])rows.push(['Hospital care',condition,year,v*1000,'Discharges',links.cdc]);
  for(const scope of Object.keys(data.nhis.profiles)){
    for(const dimension of Object.keys(data.nhis.profileTrends[scope])){
      const trend=populationHistory(data.nhis,scope,dimension);
      for(const [name,values] of trend.series)values.forEach((v,i)=>rows.push(['Profile trend · '+scope,dimension+' / '+name,trend.labels[i],v,trend.unit,links.nhis]));
    }
    const st=segmentHistory(data.segments,scope);
    for(const [name,values] of st.series)values.forEach((v,i)=>rows.push(['Coverage segments · '+scope,name,st.labels[i],v,st.unit,links.nhis]));
    const seg=data.segments.scopes[scope];
    for(const key of seg.order)for(const [trait,v] of Object.entries(seg.segments[key].traits))rows.push(['Within coverage segment · '+scope,data.segments.segmentLabels[key],data.segments.traitLabels[trait],v,'% · 2025',links.nhis]);
  }
  for(const [name,...values] of data.nhis.clinical)values.forEach((value,i)=>rows.push(['Clinical profile',name,['All diagnosed','Type 1','Type 2','Prediabetes only','No reported diabetes or prediabetes'][i],value,'% · NHIS 2025',links.nhis]));
  const caregiverSource='https://www.cdc.gov/brfss/annual_data/annual_2025.html';
  const caregiverUnit='% of caregivers with valid responses in 31 states, BRFSS 2025';
  for(const [measure,item] of Object.entries(data.caregivers.rows)){
    for(const estimate of item.estimates)rows.push(['Caregiver profile',measure,estimate.label,estimate.pct,caregiverUnit,caregiverSource]);
  }
  const hourGroups=data.caregivers.rows.hours.estimates;
  data.caregivers.hoursSubgroups.forEach((group,index)=>{
    for(const [measure,estimate] of Object.entries(group))rows.push(['Caregiver profile by weekly hours',measure,hourGroups[index].label,estimate.p,caregiverUnit,caregiverSource]);
  });
  rows.push(...industryExportRows(),...payerRows(),...physicianRows(),...orgExportRows());
  const pageSource=location.href;
  main.querySelectorAll('article table').forEach(table=>{
    const title=table.closest('article')?.querySelector('h2')?.textContent||document.title;
    const headers=[...table.querySelectorAll('thead th')].map(h=>h.textContent.trim());
    for(const tr of table.querySelectorAll('tbody tr')){
      const cells=[...tr.children].map(c=>c.textContent.trim());
      cells.slice(1).forEach((v,i)=>rows.push(['Current page · '+document.title,title,cells[0]+' / '+headers[i+1],v,'See source notes on page',pageSource]));
    }
  });
  const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='perspective-us-diabetes.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
window.addEventListener('hashchange',activateRoute);
activateRoute();
