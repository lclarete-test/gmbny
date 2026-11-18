import {writeFileSync} from 'node:fs';
import {stakeholders,mapSizes} from '../ecosystem.js';

const ink='#252940', secondary='#4d5870', paper='#fff';
const palette={
  community:{ink:'#65508d',pale:'#f1ebf7',line:'#9a86b7'},
  care:{ink:'#335f84',pale:'#eaf2f8',line:'#7698b1'},
  supply:{ink:'#925827',pale:'#fbefe5',line:'#bb936f'}
};
const symbols={
  patients:'<path d="M-15 2h7l3-9 6 15 4-9h10"/>',
  caregivers:'<path d="M-15 5l7-6c2-1 4 2 3 3l-3 3h8l7-5c3-2 5 1 3 3L3 12H-7l-5 2m6-18c-7-5-5-12-1-12 3 0 4 2 4 3 1-2 2-3 5-3 6 1 4 8-4 13"/>',
  clinicians:'<path d="M-11-12v8a6 6 0 0012 0v-8m-14 0h4m8 0h4M-5 3v5a7 7 0 0014 0V4"/><circle cx="9" cy="1" r="3"/>',
  organizations:'<path d="M-12 2h8v10h-8zM4 2h8v10H4zM-7 2v-5H7v5m-7-5v-4"/><circle cx="0" cy="-10" r="4"/>',
  media:'<path d="M-12-5h6l12-6V8L-6 3h-6zm6 9l2 7h-5l-2-7m20-7 5-3m-5 7h5"/>',
  payers:'<path d="M0-13l12 4v9c0 7-6 11-12 14C-6 11-12 7-12 0v-9zM-5 0l4 4 7-8"/>',
  fda:'<path d="M-12-7L0-13l12 6zm0 17h24m-26 4h28M-9-4v11m6-11v11m6-11v11m6-11v11"/>',
  industry:'<path d="M-10 7a6 6 0 010-8l8-8a6 6 0 018 8l-8 8a6 6 0 01-8 0zm2-10l8 8M3 11h12V0H7"/>',
  retail:'<path d="M-11-9h22l3 7h-28zm1 8v12h20V-1M-4 5h8m-4-4v8"/>'
};
const copy={
  caregivers:{short:'Family caregivers',lines:['Adult care mainly for diabetes','2025 national report'],mobile:['adult care mainly','for diabetes · 2025']},
  clinicians:{short:'Clinicians & educators',lines:['U.S. board-certified endocrine','subspecialists · 2026'],mobile:['U.S. endocrine','subspecialists · 2026']},
  organizations:{short:'Patient organizations',lines:['ADA-recognized education sites','2025 annual report'],mobile:['ADA education sites','recognized · 2025']},
  media:{short:'Media & peer voices',lines:['Campaign risk tests completed','by March 2026'],mobile:['campaign risk tests','by March 2026']},
  payers:{short:'Insurance plans',lines:['Medicare / private share of diabetes','treatment payments · 2021–22'],mobile:['Medicare / private','treatment $ · 2021–22']},
  fda:{short:'FDA',lines:['Connected devices reviewed','2018 to October 2026'],mobile:['on selected devices','2018 to Oct 2026']},
  industry:{short:'Manufacturers',lines:['Dexcom U.S. company revenue','2024'],mobile:['Dexcom U.S. revenue','2024']},
  retail:{short:'Pharmacies & suppliers',lines:['Treated adults used prescribed','medicines for diabetes · 2021–22'],mobile:['treated adults used','Rx drugs · 2021–22']}
};
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function text(x,y,label,size,{color=ink,weight=450,anchor='middle',spacing='0',halo=false}={}){
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${spacing}" ${halo?'paint-order="stroke" stroke="white" stroke-width="7" stroke-linejoin="round"':''}>${xml(label)}</text>`;
}
function icon(id,x,y,r,color){
  return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${color.pale}" stroke="${color.ink}" stroke-opacity=".25"/><g transform="scale(${r/22})" fill="none" stroke="${color.ink}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${symbols[id]}</g></g>`;
}
function path(d,group,both=false){
  return `<path d="${d}" fill="none" stroke="${palette[group].line}" stroke-width="1.8" marker-end="url(#arrow-${group})"${both?' marker-start="url(#arrow-'+group+')"':''}/>`;
}
function edge(d,group,label,x,y,both=false){
  return path(d,group,both)+text(x,y,label,14,{color:palette[group].ink,halo:true,weight:550});
}
function wide(){
  let out=[
    edge('M563 48 H202','community','campaigns',385,42),
    edge('M638 48 H996','care','training & referrals',818,42,true),
    edge('M160 179 V239','community','peer stories',208,216),
    edge('M600 178 V222','community','education',647,204),
    edge('M930 167 Q817 184 683 259','care','diagnose & treat',819,201),
    edge('M210 271 Q365 268 501 305','community','help at home',368,274),
    edge('M986 271 Q827 268 699 305','care','cover treatment',827,274),
    edge('M1037 409 V485','care','pay claims',1081,455),
    edge('M944 488 Q815 458 679 394','supply','dispense & deliver',812,443),
    edge('M197 520 H560','supply','review devices',381,514),
    edge('M638 520 H998','supply','supply',816,514)
  ].join('');
  for(const n of stakeholders){
    if(n.id==='patients')continue;
    const [left,top,w]=n.wide,x=Math.round(left+w/2),c=palette[n.color],item=copy[n.id];
    const y=top<100?48:top<400?269:520;
    out+=icon(n.id,x,y,27,c)+text(x,y+51,n.name,22,{weight:640,spacing:'-.4'})+
      text(x,y+84,n.stat,31,{weight:670,color:c.ink,spacing:'-.8'})+
      text(x,y+108,item.lines[0],16,{color:secondary})+text(x,y+129,item.lines[1],16,{color:secondary});
  }
  return out+`<circle cx="600" cy="328" r="100" fill="#f2eef8" stroke="#d9cfea"/><circle cx="600" cy="328" r="91" fill="#50416f"/>`+
    icon('patients',600,270,16,{ink:'#fff',pale:'#6b5a86'})+
    text(600,324,'40.1M',43,{color:paper,weight:680,spacing:'-2'})+
    text(600,350,'people living',18,{color:paper})+text(600,374,'with diabetes',18,{color:paper})+
    text(600,397,'U.S. · 2023',13,{color:'#e5ddec'});
}
function mobile(){
  let out=`<rect x="17" y="12" width="356" height="99" rx="20" fill="#50416f"/>`+
    icon('patients',61,63,23,{ink:'#fff',pale:'#6b5a86'})+
    text(99,58,'40.1M',39,{color:paper,weight:690,anchor:'start',spacing:'-1.5'})+
    text(100,82,'people living with diabetes · U.S. 2023',13.6,{color:paper,anchor:'start'});
  out+=`<path d="M195 111v22M100 155v-16q0-6 6-6h177q6 0 6 6v16" stroke="#a79ab9" stroke-width="2" fill="none"/>`+
    text(99,150,'Care & information',13.5,{color:palette.community.ink,halo:true,weight:600})+
    text(289,150,'Treatment & access',13.5,{color:palette.care.ink,halo:true,weight:600});
  // The community strand ends at public voices. Regulators and manufacturers form a separate lower path.
  out+='<path d="M98 160H18v295h39M289 160h82v438h-28" fill="none" stroke="#c1b7cb" stroke-width="1.5"/>';
  for(const n of stakeholders){
    if(n.id==='patients')continue;
    const [left,top,w]=n.mobile,x=Math.round(left+w/2),item=copy[n.id],c=palette[n.color],cy=top+22;
    const rail=left<100?18:371,side=left<100?x-21:x+21;
    out+=(n.id==='fda' ? edge('M122 596 H265','supply','reviews devices',195,584) : `<path d="M${rail} ${cy}H${side}" stroke="${c.line}" stroke-width="1.5" fill="none"/>`)+
      icon(n.id,x,cy,19,c)+text(x,top+60,item.short,item.short.length>19?13.7:15,{weight:650,spacing:'-.2'})+
      text(x,top+84,n.stat,22,{color:c.ink,weight:680,spacing:'-.5'})+
      text(x,top+105,item.mobile[0],13.4,{color:secondary})+text(x,top+122,item.mobile[1],13.4,{color:secondary});
  }
  return out;
}
for(const [size,[w,h]] of Object.entries(mapSizes)) {
  const definitions=Object.entries(palette).map(([key,c])=>
    `<marker id="arrow-${key}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1l5 2-5 2" fill="none" stroke="${c.line}" stroke-width="1.4"/></marker>`).join('');
  const description=stakeholders.map(n=>n.alt).join(' ');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d" font-family="Arial,Helvetica,sans-serif"><title id="t">The U.S. diabetes care ecosystem</title><desc id="d">${xml(description)}</desc><defs>${definitions}</defs><rect width="100%" height="100%" fill="#fff"/>${size==='wide'?wide():mobile()}</svg>\n`;
  writeFileSync(new URL('../media/atlas/ecosystem-'+size+'.svg',import.meta.url),svg);
}
