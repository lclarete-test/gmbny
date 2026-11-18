import {lineChart,barList,dataTable,measures,sourcesFooter,escapeHTML} from './charts.js';
import {histories,milestones,links} from './evidence.js';
import {heading,card} from './epidemiology.js';
import {products,sources,creators,themes,publicContent} from './data.js';
const deviceEstimate='https://storage.googleapis.com/investably-app-documents/iYqh7TjYLZSij5q7l1Qh/documents/MODD_InvestorPresentation_September2026.pdf';
export function market(){
  return heading('U.S. diabetes market')+card('Where treatment spending goes',`<div class="measure-call"><b>$123.0B</b><p>Estimated annual spending on prescribed medicines linked to diabetes treatment. Medicines accounted for 80.3 cents of every treatment dollar in the 2021–22 U.S. household survey.</p></div>${barList([['Prescription medicines',80.3],['Office visits',10.3],['Home health',5],['Inpatient stays',2.4],['Hospital outpatient visits',1.7],['Emergency visits',0.3]])}`)+
    card('Glucose monitoring and insulin delivery',measures([['3.70M','U.S. continuous glucose monitor users'],['891,000','insulin pump users'],['740,000','people using both a pump and a CGM']])+'<p class="reading">These 2024 industry estimates overlap. A sensor measures glucose. A pump delivers insulin. Compatible systems use sensor readings to adjust dosing.</p>')+
    lineChart(histories.devices)+card('The latest reported quarter for Dexcom',measures([['$969.8M','U.S. revenue · Q3 2026'],['$851.9M','U.S. revenue · Q3 2025']]))+
    sourcesFooter([['AHRQ MEPS · Diabetes-linked treatment spending',links.meps],['Seagrove device estimates cited by Modular Medical',deviceEstimate],['Dexcom · 2022 annual filing',links.dex22],['Dexcom · 2025 annual filing',links.dex25],['Insulet · 2022 annual filing',links.omni22],['Insulet · 2024 annual filing',links.omni24],['Insulet · 2025 annual filing',links.omni25],['Dexcom · Q3 2026',sources.dexrev.url]],[
      'Prescription spending is 80.3% of $153.2 billion in annual MEPS condition-linked payments, rounded. It measures expenditure, not total manufacturer revenue. The US device series compare Dexcom’s geographic revenue and Insulet’s Omnipod US product revenue. They are company-specific measures and cannot establish industry size or market shares.'
    ]);
}
export function innovation(){
  const all=[...milestones,['Mar 2025','Tandem Control-IQ+','U.S. launch','Compatible Tandem pumps offered automated delivery for eligible adults with type 2 diabetes.',sources.tandem.url],['Aug 2025','MiniMed 780G','Expanded indication','The FDA expanded use to adults with insulin-requiring type 2 diabetes.',sources.med.url],['Jun 2026','Stelo','Expanded indication','Over-the-counter sensing expanded to eligible children ages two and older who do not use insulin.',sources.stelo.url]];
  return heading('Diabetes product milestones')+`<ol class="product-history">${all.map(([date,name,event,change])=>`<li><time>${date}</time><article><small>${event}</small><h2>${name}</h2><p>${change}</p></article></li>`).join('')}</ol>`+
    sourcesFooter(all.filter((r,i,a)=>a.findIndex(x=>x[4]===r[4])===i).map(r=>[r[1]+' · '+r[0],r[4]]),['Dates distinguish U.S. commercial launches, regulatory decisions and expansions to an additional population.']);
}
export function catalog(view){
  const list=products.filter(p=>(view.deviceType==='all'||p.type.includes(view.deviceType))&&(view.category==='all'||p.cat===view.category)&&(p.name+' '+p.brand).toLowerCase().includes(view.search.toLowerCase()));
  return heading('Devices and products')+`<div class="catalog-filters"><label>Find a product<input id="product-search" type="search" value="${escapeHTML(view.search)}" placeholder="Product or manufacturer"></label>
    <label>Category<select id="category">${[['all','All devices'],['CGM','Glucose monitors'],['AID','Insulin delivery']].map(([v,k])=>`<option value="${v}" ${view.category===v?'selected':''}>${k}</option>`).join('')}</select></label>
    <label>Population<select id="device-type">${[['all','All populations'],['t1','Type 1'],['t2','Type 2'],['gest','Gestational'],['pre','Prediabetes']].map(([v,k])=>`<option value="${v}" ${view.deviceType===v?'selected':''}>${k}</option>`).join('')}</select></label></div>
    <div class="product-grid">${list.map(p=>`<article class="product-card"><span class="product-maker">${p.brand} · ${p.cat}</span><h2>${p.name}</h2><p>${p.use}</p><div class="tags"><span class="tag">${p.access}</span><span class="tag">${p.wear}</span></div><p>${p.audience}</p><label><input type="checkbox" data-compare="${p.id}" ${view.selected.has(p.id)?'checked':''}> Compare product</label></article>`).join('')||'<p class="empty">No products match these filters.</p>'}</div>`+
    sourcesFooter(products.map(p=>[p.name+' · indications and specifications',sources[p.source].url]),['Eligible combinations and indications are specific to each device and software version.']);
}
export function compareProducts(ids) {
  const ps=products.filter(p=>ids.has(p.id));
  return '<h2>Compare products</h2>'+dataTable(['Feature',...ps.map(p=>p.name)],[['Manufacturer','brand'],['Category','cat'],['Audience','audience'],['Access','access'],['Wear or system','wear'],['Role','use']].map(([k,f])=>[k,...ps.map(p=>p[f])]));
}
const campaignSources=[['CDC · Campaign update, 2021',links.campaign21],['CDC · Campaign update, 2023',links.campaign23],['CDC · Diabetes program outcomes, 2025',links.campaign25],['CDC · Ten-year campaign results',links.campaign]];
export function publicProfile(){
  return heading('General public')+card('People checking their diabetes risk',`<div class="measure-call"><b>33.7M+</b><p>Prediabetes risk tests completed online or by video during the U.S. <i>Do I Have Prediabetes?</i> campaign, from January 2016 through March 2026.</p></div>${dataTable(['Campaign update','Cumulative risk tests'],[['November 2021','3.7 million'],['November 2023','More than 12.7 million'],['June 2025','26.9 million'],['March 2026','More than 33.7 million']])}`)+
    card('What people did on the campaign website',measures([['9.09M+','unique U.S. website visits'],['329,000+','clicks to find a prevention program']]))+sourcesFooter(campaignSources,['These are cumulative campaign measures from different systems. Test completions can include repeat actions. A click does not establish a diabetes diagnosis or enrollment.']);
}
export const searchHistory={
  title:'U.S. Google searches for Ozempic',unit:'Monthly mean of weekly relative interest · 0–100 index',format:'rate',
  labels:['Dec 2021','Jan 2022','Feb 2022','Mar 2022','Apr 2022','May 2022','Jun 2022','Jul 2022','Aug 2022','Sep 2022','Oct 2022','Nov 2022','Dec 2022','Jan 2023','Feb 2023'],
  series:[['Ozempic',[10.3,12.6,16,16.8,17.8,21.2,25,26,28.5,29,37.4,42.8,45.8,76.2,84.8]]],
  note:'The largest monthly rise in this window came between December 2022 and January 2023, from 45.8 to 76.2. February 2023 had the highest monthly mean.',
  source:'https://academic.oup.com/view-large/449686611'
};
export function online(theme){
  const t=themes.find(t=>t.id===theme)||themes[0];
  return heading('Search interest')+lineChart(searchHistory)+
    card('When Americans searched for “diabetes”',`<p>A separate U.S. study grouped 261 weeks of searches for <b>diabetes</b> by calendar month. Interest was highest in March and lowest in August over February 2005 to January 2010.</p>`)+
    card('Explore current searches',`<div class="topic-picks">${themes.map(x=>`<button data-theme="${x.id}" aria-pressed="${theme===x.id}">${x.name}</button>`).join('')}</div><p>${t.description}</p>${t.queries.map(q=>`<div class="query-row"><span>${q}</span><a href="https://trends.google.com/trends/explore?geo=US&amp;date=today%205-y&amp;q=${encodeURIComponent(q)}" target="_blank" rel="noopener">Google Trends ↗</a><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" rel="noopener">YouTube ↗</a></div>`).join('')}`)+
    (publicContent.some(c=>c.topic===theme)?card('Published accounts on this topic',publicContent.filter(c=>c.topic===theme).map(c=>`<p><a href="${c.url}" target="_blank" rel="noopener">${c.title}</a><br><small>${c.creator} · ${c.format}</small></p>`).join('')):'')+
    sourcesFooter([['Oxford Academic · Monthly U.S. search indices, Table 1',searchHistory.source],['U.S. Google searches for diabetes · seasonal analysis','https://pmc.ncbi.nlm.nih.gov/articles/PMC3557852/'],['Google · How Trends data are normalized','https://support.google.com/trends/answer/4365533']],['The Ozempic study normalized weekly U.S. search interest over March 2018–February 2023. The chart reproduces the monthly means published for December 2021–February 2023. The index reflects relative interest, not numbers of searches, users, prescriptions or diagnoses. Searches may also concern weight loss. Links under current searches open a separate, live Google Trends query.']);
}
export function painMap(){
  return heading('Pain map')+`<article class="panel pending-evidence"><h2>Where people report pain</h2><p>The U.S. pain-report dataset is pending. A body-region breakdown will appear here once the reports have been collected and coded.</p></article>`;
}
export function influencers(){
  return heading('People talking about diabetes')+`<div class="creator-grid">${creators.map(c=>`<article class="creator-card"><div class="creator-mini"><div class="avatar">${c.initials}</div><div><h2>${c.name}</h2><p>${c.brand}</p></div></div><p>${c.profile}</p><div class="tags">${c.themes.map(k=>`<span class="tag">${k}</span>`).join('')}</div><dl><dt>Format</dt><dd>${c.format}</dd></dl><a href="${sources[c.source].url}" target="_blank" rel="noopener">Official profile ↗</a></article>`).join('')}</div>`+sourcesFooter(creators.map(c=>[c.name,sources[c.source].url]),['This is a curated sample of public voices. Audience counts, engagement and commercial relationships have not been audited.']);
}
