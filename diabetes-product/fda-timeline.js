import {dataTable, escapeHTML} from './charts.js';
import {decisions, throughDate} from './fda-decisions.js';

const bulkFile = 'https://www.fda.gov/medical-devices/510k-clearances/downloadable-510k-files';
const applicationBase = 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/';
const families = [
  {name:'Prescription and professional CGMs', short:'Prescription / professional CGMs', codes:['QBJ','QDK','QDL','QII','QLG'], color:'#6151a6'},
  {name:'Over-the-counter CGMs', short:'OTC CGMs', codes:['SAF','SBH'], color:'#88536e'},
  {name:'Connected insulin pumps', short:'Connected pumps', codes:['QFG'], color:'#3e708a'},
  {name:'Automated dosing controllers', short:'Dosing controllers', codes:['QJI','QJS'], color:'#94602c'}
];
const familyOf = new Map(families.flatMap((group,index)=>group.codes.map(code=>[code,index])));
const lastYear = Number(throughDate.slice(0,4));
const lastMonthName = new Intl.DateTimeFormat('en-US',{month:'short',timeZone:'UTC'}).format(new Date(throughDate+'T00:00:00Z'));
const partial = throughDate.slice(5) !== '12-31';
const firstYear = Math.min(...decisions.map(([when])=>Number(when.slice(0,4))));
const years = Array.from({length:lastYear-firstYear+1},(_,index)=>firstYear+index);
const byYear = new Map(years.map(year=>[year, families.map(()=>0)]));
const totals = families.map(()=>0);
let grants = 0;
for(const [date,number,code] of decisions){
  const family = familyOf.get(code);
  totals[family]++;
  byYear.get(Number(date.slice(0,4)))[family]++;
  if(number.startsWith('DEN'))grants++;
}
const sum = values=>values.reduce((a,b)=>a+b,0);
const periodLabel = year=>year===lastYear && partial ? `Jan–${lastMonthName} ${year}` : String(year);
const portal = id=>applicationBase+(id.startsWith('DEN')?'denovo':'pmn')+'.cfm?ID='+id;
const otcByName = new Map();
for(const [date,id,code,device] of decisions){
  if(!families[1].codes.includes(code)) continue;
  if(!otcByName.has(device)) otcByName.set(device,{name:device,first:date,firstId:id,latest:date,count:0});
  const system=otcByName.get(device);
  system.count++;
  system.latest=date;
}
const otcSystems=[...otcByName.values()];
const monthYear = date=>new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
const milestones = [
  ['Mar 2018','A sensor could share readings','Dexcom G6 established the integrated CGM category. A compatible device could use its readings, including for automated insulin delivery.'],
  ['2019','Pumps and controllers could connect','The t:slim X2 pump received De Novo authorization in February. Control-IQ dosing software followed in December, linking a compatible sensor to a pump.'],
  ['Mar 2024','Adults could buy a CGM over the counter','Stelo became the first U.S. OTC CGM. Its original clearance covered adults who did not use insulin.'],
  ['Aug 2024','Automated dosing reached type 2','The Omnipod 5 SmartAdjust clearance extended automated insulin dosing to eligible adults with type 2 diabetes.'],
  ['Jun 2026','OTC use extended to children','Stelo’s label expanded to ages 2 and older for people who do not use insulin. Children use the sensor with adult supervision.']
];

function annualChart(){
  const largest = Math.max(...Array.from(byYear.values(),sum));
  const step = Math.max(1,Math.ceil(largest/4));
  const scale = step*4;
  const keys = families.map((family,index)=>
    `<li><i style="--fda-color:${family.color}"></i><span>${family.short}</span><b>${totals[index]}</b></li>`
  ).join('');
  const rows = years.map(year=>{
    const values = byYear.get(year), total = sum(values);
    const bars = values.map((value,i)=>{
      if(!value)return '';
      const description = `${families[i].name}: ${value}`;
      return `<span title="${escapeHTML(description)}" style="width:${100*value/scale}%;--fda-color:${families[i].color}">${value>1?value:''}</span>`;
    }).join('');
    const isPartial = year===lastYear && partial;
    const label = isPartial?`${year}<small>Jan–${lastMonthName}</small>`:year;
    return `<li class="${isPartial?'fda-partial':''}"><span class="fda-year">${label}</span><div class="fda-track">${bars}</div><b>${total}</b></li>`;
  }).join('');
  const axes=[0,1,2,3,4].map(i=>`<span>${i*step}</span>`).join('');
  return `<ul class="fda-key" aria-label="Decisions across the entire period">${keys}</ul>
    <div class="fda-plot" aria-hidden="true"><ol>${rows}</ol><div class="fda-axis"><div>${axes}</div></div></div>
    <details class="chart-values"><summary>Decisions by year and device family</summary>${dataTable(
      ['Period',...families.map(f=>f.name),'All four families'],
      years.map(year=>[periodLabel(year),...byYear.get(year),sum(byYear.get(year))]),
      'FDA decisions by year and device family'
    )}</details>`;
}

export function fdaTimeline(){
  const sameMonths = year=>decisions.filter(([date])=>Number(date.slice(0,4))===year && date.slice(5)<=throughDate.slice(5)).length;
  const partialText = partial ? `From January through ${new Intl.DateTimeFormat('en-US',{month:'long',timeZone:'UTC'}).format(new Date(throughDate+'T00:00:00Z'))}, the FDA issued <b>${sameMonths(lastYear)} decisions in ${lastYear}</b> and <b>${sameMonths(lastYear-1)} in ${lastYear-1}.</b>` : '';
  return `<article class="panel fda-panel">
    <h2>FDA decisions on connected diabetes devices</h2>
    <p class="axis-unit">${firstYear} through ${lastMonthName} ${lastYear} · U.S. marketing authorizations</p>
    <div class="fda-summary">
      <div class="fda-count"><strong>${decisions.length}</strong><span>authorization decisions across four device families</span>
      <dl><div><dt>510(k) clearances</dt><dd>${decisions.length-grants}</dd></div><div><dt>De Novo grants</dt><dd>${grants}</dd></div></dl>
      <p>One product can receive more than one decision as its hardware, software or intended users change.</p></div>
      <div class="fda-annual">${annualChart()}</div>
    </div>${partialText?`<p class="reading">${partialText}</p>`:''}</article>
    <article class="panel fda-access"><h2>How FDA decisions changed access</h2>
    <ol>${milestones.map(([date,title,description])=>`<li><span class="fda-date">${date}</span><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol>
    </article>
    <article class="panel"><h2>How many over-the-counter sensors were authorized?</h2>
    <p class="reading"><strong>${otcSystems.length} named systems</strong> accounted for ${totals[1]} FDA decisions in the two OTC categories through ${lastMonthName} ${lastYear}.</p>
    ${dataTable(['Named system','First clearance','Most recent clearance','Decisions'],otcSystems.map(s=>[s.name,monthYear(s.first),monthYear(s.latest),s.count]),'Over-the-counter glucose monitoring systems in the FDA decisions file')}</article>`;
}

export const fdaSources = [
  ['FDA · Downloadable premarket decisions, 1996 to present',bulkFile],
  ['openFDA · 510(k) database and decision fields','https://open.fda.gov/apis/device/510k/'],
  ['FDA · Dexcom G6 De Novo grant',portal('DEN170088')],
  ['FDA · t:slim X2 interoperable pump De Novo grant',portal('DEN180058')],
  ['FDA · Control-IQ controller De Novo grant',portal('DEN190034')],
  ['FDA · First OTC continuous glucose monitor','https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor'],
  ['FDA · First automated dosing system for adults with type 2 diabetes','https://www.fda.gov/news-events/press-announcements/fda-clears-first-device-enable-automated-insulin-dosing-individuals-type-2-diabetes'],
  ['FDA · Pediatric OTC CGM clearance','https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor-children'],
  ...otcSystems.map(item=>['FDA · '+item.name+' first OTC clearance',portal(item.firstId)]),
  ['Reproduce the FDA decision counts','analysis/fda_decisions.py']
];

export const fdaNotes = [
  'The FDA count uses unique application numbers by decision date in the PMN96CUR public file from January 1, 2018, through October 31, 2026. We verified all 96 identifiers against the openFDA API. Records marked SESE are 510(k) clearances based on substantial equivalence. Records marked DENG are granted De Novo requests that established new device types. The unit is a marketing authorization and can include an update to an existing product.',
  'Each decision uses its primary product code. Prescription and professional integrated CGMs include QBJ, QDK, QDL, QII and QLG. OTC CGMs include SAF and SBH. Alternate controller enabled insulin pumps use QFG. Automated glycemic controllers use QJI or QJS. These are the ten codes under 21 CFR 862.1355, 880.5730 and 862.1356 at the review date. A separate application for a pump and its dosing algorithm counts once in each family. Glucose meters, pens, conventional pumps and devices authorized under other regulations or the PMA pathway are outside this series. The 2026 record covers ten months.',
  'The OTC product count groups the two over-the-counter product codes by the device name as filed. The four names identify authorized systems. Dates denote regulatory decisions, independent of retail availability.',
  'CGM means continuous glucose monitor. FDA labeling sets intended use. The Stelo labeling excludes people with problematic hypoglycemia and people on dialysis. Insurance benefits and payment for a specific use are separate determinations.'
];

export function fdaExportRows(){
  const rows = years.flatMap(year=>byYear.get(year).map((n,i)=>[
    'Public policy','FDA marketing decisions: '+families[i].name,periodLabel(year),n,'unique application numbers',bulkFile
  ]));
  for (const [date,id,code,device] of decisions) rows.push([
    'Public policy · FDA decisions',device,`${date} / ${id} / ${code}`,1,id.startsWith('DEN')?'De Novo grant':'510(k) clearance',portal(id)
  ]);
  for(const s of otcSystems) rows.push(['Public policy · Over-the-counter CGMs',s.name,s.first+' through '+s.latest,s.count,'authorization decisions for this named system',portal(s.firstId)]);
  return rows;
}
