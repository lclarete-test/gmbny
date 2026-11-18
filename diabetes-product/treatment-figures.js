import {chartMark, escapeHTML} from './charts.js';
import {collectionImages} from './collection-data.js';

const dotComparisons={
  'g7-15-day':{axis:'Days per sensor',max:15,rows:[['Original G7',10],['G7 15 Day',15]],caption:'Maximum wear time for the two U.S. models.'},
  awiqli:{axis:'Background insulin injections in one week',max:7,rows:[['Once-daily basal insulin',7],['Once-weekly Awiqli',1]],caption:'Each filled circle represents one scheduled injection.'},
  mounjaro:{axis:'Gut hormone receptors targeted',max:2,rows:[['Semaglutide · GLP-1',1],['Tirzepatide · GLP-1 and GIP',2]],caption:'The second target is the GIP receptor.'}
};

const processes={
  orinase:{steps:[['Tablet','Tolbutamide'],['Pancreas','Releases insulin'],['Blood','Glucose falls']],caption:'How a sulfonylurea lowers glucose when insulin-producing cells still work.'},
  dextrostix:{steps:[['Blood drop','Apply to strip'],['1 minute','Wait for color'],['Color chart','Read the match']],caption:'A Dextrostix result depended on a person matching colors.'},
  novopen:{steps:[['Cartridge','Holds insulin'],['Pen','Measures the dose'],['Needle','Gives the injection']],caption:'The cartridge stayed in the reusable pen between injections.'},
  glucophage:{steps:[['Tablet','Metformin'],['Liver','Releases less glucose'],['Blood','Glucose falls']],caption:'One way metformin lowers glucose in type 2 diabetes.'},
  humalog:{steps:[['Regular human insulin','About 30 min before eating'],['Insulin lispro','Within 15 min before eating or immediately after']],caption:'Mealtime injection windows in the U.S. prescribing information.',comparison:true},
  'minimed-cgms':{steps:[['Wear','Sensor records'],['After up to 72 hours','Clinic downloads'],['Review','Clinician sees the trace']],caption:'Who saw the glucose readings in the original 1999 system.'},
  byetta:{steps:[['Injection','Exenatide'],['Pancreas','More insulin when glucose is high'],['Stomach','Slower emptying']],caption:'Two effects of activating the GLP-1 receptor.',comparison:true},
  'guardian-rt':{steps:[['Wear','Sensor measures'],['While wearing','Readings appear'],['High or low','The wearer gets an alert']],caption:'Glucose information reached the wearer while there was still time to act.'},
  invokana:{steps:[['Tablet','Canagliflozin'],['Kidneys','Return less glucose to blood'],['Urine','Carries more glucose out']],caption:'What blocking the SGLT2 transporter changes.'},
  'minimed-670g':{steps:[['Sensor','Measures glucose'],['Every 5 minutes','Basal rate adjusts'],['At meals','User gives a bolus']],caption:'Background automation and mealtime dosing in the 670G.',comparison:true},
  'dexcom-g6':{steps:[['G6 sensor','Measures glucose'],['Transmitter','Shares readings'],['Compatible device','Receives the data']],caption:'A compatible pump could use the same glucose readings as the display.'},
  rybelsus:{steps:[['Morning','Tablet and plain water'],['30 minutes or more','Wait'],['Then','Food, other drinks or oral medicines']],caption:'How oral delivery changed the morning routine in the original U.S. label.'},
  stelo:{steps:[['2024 clearance','Adults, age 18+'],['2026 expansion','People age 2+'],['Both labels','People who do not use insulin']],caption:'The U.S. over-the-counter label expanded to younger users with adult supervision.',comparison:true},
  'omnipod-type2':{steps:[['2022','U.S. pharmacy launch for type 1'],['2024','Adult type 2 indication'],['Each meal','Wearer gives the dose']],caption:'Who gained access to Omnipod 5 automated insulin delivery.',comparison:true},
  'minimed-780g':{steps:[['Type 2 indication','Insulin-treated adults'],['Between meals','Automatic corrections'],['At meals','User enters carbohydrates']],caption:'The 2025 U.S. indication expanded access to the 780G.',comparison:true}
};

export function milestoneFigure(active) {
  const dots=dotComparisons[active.id];
  if(dots){
    const rows=dots.rows.map(([label,value])=>`<div role="button" tabindex="0" ${chartMark(label,String(value),dots.axis)} class="ev-unit-row"><div><span>${escapeHTML(label)}</span><b>${value}</b></div><div class="ev-units" aria-hidden="true" style="--units:${dots.max}">${Array.from({length:dots.max},(_,i)=>'<i'+(i<value?' class="filled"':'')+'></i>').join('')}</div></div>`).join('');
    return `<figure class="ev-data-figure"><div class="ev-unit-chart"><strong>${escapeHTML(dots.axis)}</strong>${rows}</div><figcaption>${escapeHTML(dots.caption)}</figcaption></figure>`;
  }
  const diagram=processes[active.id];
  if(diagram){
    const steps=diagram.steps.map(([what,does])=>`<li><i aria-hidden="true"></i><div><small>${escapeHTML(what)}</small><b>${escapeHTML(does)}</b></div></li>`).join('');
    return `<figure class="ev-data-figure"><ol class="ev-steps${diagram.comparison?' ev-parts':''}">${steps}</ol><figcaption>${escapeHTML(diagram.caption)}</figcaption></figure>`;
  }
  const art=collectionImages[active.track];
  return `<figure class="ev-object"><img src="media/industry/${art.file}" alt="${escapeHTML(art.alt)}"><figcaption>${escapeHTML(art.caption)}</figcaption></figure>`;
}
