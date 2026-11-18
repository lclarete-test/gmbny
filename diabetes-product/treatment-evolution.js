import {escapeHTML, sourcesFooter} from './charts.js';
import {treatmentMilestones, treatmentMilestoneSources} from './treatment-milestones.js';
import {collectionImages} from './collection-data.js';
import {milestoneFigure} from './treatment-figures.js';

export const tracks = {
  medicine: {name:'Medicines', link:'industry/market/treatment', next:'Explore treatment payments'},
  monitoring: {name:'Glucose monitoring', link:'industry/products/task/sensor', next:'Explore glucose monitors'},
  delivery: {name:'Insulin delivery', link:'industry/products/task/automated', next:'Explore automated systems'}
};
const eras = [[1920,1959],[1960,1989],[1990,2004],[2005,2015],[2016,2026]];
export const milestoneById = new Map(treatmentMilestones.map(stop=>[stop.id,stop]));
const trails = Object.fromEntries(Object.keys(tracks).map(track=>[track,treatmentMilestones.filter(s=>s.track===track)]));
const stopUrl = id => '#industry/companies/'+id;
const catalogStops={stelo:'stelo','omnipod-type2':'omni','minimed-780g':'med','g7-15-day':'g7'};
const progressKey='perspective-treatment-history-v1';

export function readExploredStops(){
  try {
    const ids=JSON.parse(sessionStorage.getItem(progressKey)||'[]');
    if(Array.isArray(ids))return new Set(ids.filter(id=>milestoneById.has(id)));
  }catch{}
  return new Set();
}
export function recordExploredStop(explored,id){
  if(!milestoneById.has(id)||explored.has(id))return;
  explored.add(id);
  try{sessionStorage.setItem(progressKey,JSON.stringify([...explored]));}catch{}
}
function station(stop, active, explored) {
  const current=stop.id===active.id;
  return `<a class="ev-stop${explored.has(stop.id)?' is-visited':''}" href="${stopUrl(stop.id)}" ${current?'aria-current="step"':''} aria-label="${escapeHTML(stop.year+', '+stop.label+', '+tracks[stop.track].name)}" title="${escapeHTML(stop.title)}">
    <time>${stop.year}</time><span>${escapeHTML(stop.label)}</span></a>`;
}

function routeMap(active,explored) {
  const rows=Object.entries(tracks).map(([track,info])=>{
    const stops=trails[track];
    const cells=eras.map(([a,b])=>{
      const slice=stops.filter(s=>s.year>=a&&s.year<=b);
      const running=stops[0].year<=b&&stops.at(-1).year>=a;
      return `<div class="ev-cell${running?' ev-line':''}">${slice.map(s=>station(s,active,explored)).join('')}</div>`;
    }).join('');
    return `<div class="ev-maprow ev-${track}"><a class="ev-lane" href="${stopUrl(stops[0].id)}"><i></i>${escapeHTML(info.name)}</a>${cells}</div>`;
  }).join('');
  const trackLinks=Object.entries(tracks).map(([key,t])=>`<a class="ev-${key}" href="${stopUrl(trails[key][0].id)}" ${active.track===key?'aria-current="true"':''}>${t.name}</a>`).join('');
  return `<nav id="ev-map" class="ev-map" aria-label="Historical milestones by era and track"><div class="ev-wide-map">
      <div class="ev-era-row"><span>U.S. milestones</span>${eras.map(([a,b])=>`<span>${a}–${b}</span>`).join('')}</div>${rows}</div>
    <div class="ev-compact-map"><div class="ev-track-picker">${trackLinks}</div><div class="ev-mobile-stops ev-${active.track}">${trails[active.track].map(s=>station(s,active,explored)).join('')}</div></div>
    <div class="ev-progress"><progress aria-label="Milestones explored" value="${explored.size}" max="${treatmentMilestones.length}"></progress><span>${explored.size} of ${treatmentMilestones.length} explored</span></div></nav>`;
}

function stopStory(active) {
  const trail=trails[active.track], index=trail.indexOf(active);
  const previous=trail[index-1], next=trail[index+1], track=tracks[active.track];
  return `<article class="ev-story ev-${active.track}" id="evolution-story" aria-label="Selected historical milestone" tabindex="-1">
    <div class="ev-story-grid"><div class="ev-copy"><div class="ev-date"><time>${active.year}</time><span>${escapeHTML(active.event)}</span></div>
      <h2>${escapeHTML(active.title)}</h2><span class="ev-product">${escapeHTML(active.product)}</span>
      <p class="ev-change">${escapeHTML(active.change)}</p>
      <dl class="ev-contrast"><div><dt>Before</dt><dd>${escapeHTML(active.before)}</dd></div><div><dt>What still mattered</dt><dd>${escapeHTML(active.remains)}</dd></div></dl>
      ${catalogStops[active.id]?`<a class="ev-catalog-jump" href="#industry/products/item/${catalogStops[active.id]}">View device specifications →</a>`:''}
    </div>${milestoneFigure(active)}</div>
    <div class="ev-pager"><span>${track.name} <b>${index+1} of ${trail.length}</b></span><div>${previous?`<a href="${stopUrl(previous.id)}" aria-label="Previous milestone, ${previous.year}">← ${previous.year}</a>`:''}
      ${next?`<a class="ev-next" href="${stopUrl(next.id)}" aria-label="Next milestone, ${next.year}, ${escapeHTML(next.label)}">Next · ${next.year} →</a>`:`<a class="ev-next" href="#${track.link}">${track.next} →</a>`}</div></div></article>`;
}

const questions=[
  {prompt:'Which monitor let the person see a high or low glucose alert while wearing it?',stop:'guardian-rt',answer:1,choices:['Ames Dextrometer','Guardian RT','Original MiniMed CGMS'],
    feedback:['A fingerstick meter gave a reading when a person tested. It could not send an alert between checks.','The Guardian RT displayed sensor readings and alarms in real time in 2005.','The original 1999 CGMS recorded a trace for a clinician to review after wear.']},
  {prompt:'Which advance allowed a pump to adjust background insulin using sensor readings?',stop:'minimed-670g',answer:2,choices:['A refillable insulin pen','A pump with preset rates','A hybrid closed-loop system'],
    feedback:['A pen lets a person give a dose. It receives no stream of sensor data.','A preset schedule follows the rates a person programs. Changing glucose can call for a different rate.','The MiniMed 670G could adjust background insulin every five minutes. People still gave mealtime doses.']},
  {prompt:'Which medicine for type 2 diabetes acts on both GIP and GLP-1 receptors?',stop:'mounjaro',answer:0,choices:['Tirzepatide','Metformin','Human insulin'],
    feedback:['Tirzepatide, approved in 2022 as Mounjaro, acts on both receptors.','Metformin reduces glucose production in the liver.','Human insulin replaces a hormone the body normally makes.']}
];

export function challengeContent(state) {
  if(state.index>=questions.length) {
    return `<h2>Timeline challenge</h2><p class="ev-finished" role="status">You matched all three advances to what they changed in care.</p><button type="button" data-quiz-action="restart">Play again</button>`;
  }
  const q=questions[state.index], picked=state.answer, correct=picked===q.answer;
  return `<div class="ev-ch-head"><h2>Timeline challenge</h2><span>Question ${state.index+1} of ${questions.length}</span></div><p class="ev-prompt">${q.prompt}</p>
    <div class="ev-choices">${q.choices.map((name,i)=>`<button type="button" data-quiz-answer="${i}" aria-pressed="${picked===i}" class="${i===picked?(correct?'is-right':'try-again'):''}" ${correct?'disabled':''}>${escapeHTML(name)}</button>`).join('')}</div>
    <div class="ev-feedback" role="status">${picked===null?'':`<b>${correct?'Correct.':'Try again.'}</b> ${escapeHTML(q.feedback[picked])}`}</div>
    ${correct?`<div class="ev-ch-actions"><a href="${stopUrl(q.stop)}">View the ${milestoneById.get(q.stop).year} milestone</a><button type="button" data-quiz-action="next">${state.index===questions.length-1?'Finish':'Next question'} →</button></div>`:''}`;
}

export function updateChallenge(state, button) {
  const q=questions[state.index], action=button.dataset.quizAction;
  if(action==='restart'){state.index=0;state.answer=null;}
  else if(action==='next'&&q&&state.answer===q.answer){state.index+=1;state.answer=null;}
  else if(button.hasAttribute('data-quiz-answer')&&q&&state.answer!==q.answer) {
    const n=Number(button.dataset.quizAnswer);
    if(!Number.isInteger(n)||n<0||n>=q.choices.length)return;
    state.answer=n;
  }else return;
  const box=button.closest('.ev-challenge');
  box.innerHTML=challengeContent(state);
  const focus=box.querySelector('[data-quiz-action]')||box.querySelector('[aria-pressed="true"]')||box.querySelector('button');
  focus?.focus({preventScroll:true});
}

export function productEvolution(view={}) {
  const active=milestoneById.get(view.milestone)||treatmentMilestones[0];
  const explored=view.explored||new Set([active.id]);
  const photos=Object.values(collectionImages);
  return `<header class="pagehead explore-head"><h1>Treatment evolution</h1><p>Insulin reached U.S. patients in 1923. Follow the advances in medicines, glucose monitoring and insulin delivery that changed what people could do at home.</p></header>
    <section class="ev-exhibit">${routeMap(active,explored)}${stopStory(active)}</section>
    <section class="panel ev-challenge" aria-label="Timeline challenge">${challengeContent(view.timelineQuiz||{index:0,answer:null})}</section>`+
    sourcesFooter([...treatmentMilestoneSources,...photos.map(p=>[p.source,p.url])],[
      'Each stop marks the named event in the United States. A regulatory decision and a commercial launch may occur in different years. The timeline includes selected advances and gives the original indication when relevant.',
      'The photographs illustrate each historical track. Captions give the dates of the objects or photographs when known.',
      ...photos.map(p=>p.source+'. '+p.credit+' '+p.license+'.')
    ]);
}

export function milestoneRows() {
  return treatmentMilestones.map(s=>['Treatment evolution',s.title,s.product,s.year,s.event+' · '+tracks[s.track].name,s.url]);
}
