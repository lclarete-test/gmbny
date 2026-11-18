import {dataTable, escapeHTML} from './charts.js';

const workforce = 'https://bhw.hrsa.gov/sites/default/files/bureau-health-workforce/data-research/State-of-US-Health-Care-Workforce-2025.pdf';
const primaryCare = 'https://bhw.hrsa.gov/sites/default/files/bureau-health-workforce/data-research/State-of-the-Primary-Care-Workforce-2025.pdf';
const familyBoard = 'https://www.theabfm.org/become-certified/initial-training-requirements/';
const medicineBoard = 'https://www.abim.org/certification/policies/internal-medicine-subspecialty-policies/internal-medicine/';
const endocrineBoard = 'https://www.abim.org/certification/policies/internal-medicine-subspecialty-policies/endocrinology-diabetes-and-metabolism/';
const pediatrics = 'https://www.nichd.nih.gov/about/org/dir/osd/tp/peitp';
const pediatricFellowship = 'https://pedsendo.org/careers/certification/';
const nrmp = 'https://www.nrmp.org/wp-content/uploads/2026/05/SMS_Results_and_Data_2026_Revised-20260522.pdf';

const areas = [
  {name:'Primary care', active:340319, patientCare:297979},
  {name:'Endocrinology', active:8758, patientCare:7011}
];
const specialties = [
  {name:'General internal medicine', active:130483, patientCare:112544, women:39.6, older:22.1},
  {name:'Family medicine', active:124049, patientCare:112316, women:43.6, older:22.0},
  {name:'Pediatrics', active:79356, patientCare:67757, women:64.6, older:18.1},
  {name:'Geriatrics', active:6431, patientCare:5362, women:56.5, older:15.5}
];
const paths = [
  {name:'Family physician', residency:'Family medicine', years:3, source:familyBoard},
  {name:'General internist', residency:'Internal medicine', years:3, source:medicineBoard},
  {name:'Adult endocrinologist', residency:'Internal medicine', years:3, source:medicineBoard,
    fellowship:'Adult endocrinology', extra:2, nextSource:endocrineBoard, offered:398, filled:389},
  {name:'Pediatric endocrinologist', residency:'Pediatrics', years:3, source:pediatrics,
    fellowship:'Pediatric endocrinology', extra:3, nextSource:pediatricFellowship, offered:106, filled:51}
];
const schoolMix = [
  {name:'International medical schools', matched:219},
  {name:'U.S. MD schools', matched:105},
  {name:'U.S. DO schools', matched:65}
];
const count = value=>value.toLocaleString('en-US');
const pct = value=>value.toFixed(1)+'%';
const ratio = (n,d)=>100*n/d;

export const physicianSources = [
  ['HRSA · U.S. physician workforce by specialty and patient care activity, 2023, tables 1a and 1b',workforce],
  ['HRSA · Demographics of primary care physicians and county availability, 2023, table 2',primaryCare],
  ['American Board of Family Medicine · Family medicine residency requirements',familyBoard],
  ['American Board of Internal Medicine · Standard internal medicine residency',medicineBoard],
  ['American Board of Internal Medicine · Endocrinology, diabetes and metabolism certification',endocrineBoard],
  ['NIH · Pediatric residency and endocrinology fellowship pathway',pediatrics],
  ['Pediatric Endocrine Society · Pediatric endocrinology fellowship requirements',pediatricFellowship],
  ['NRMP · Fellowship Match for July 2026 appointments, revised May 2026, tables 1 and 2',nrmp]
];
export const physicianNotes = [
  'HRSA uses the American Medical Association’s 2023 Physician Professional Data. The counts include active MDs and DOs and exclude residents. Direct patient care is a subset of professional activity. The data cover the full specialty workforce across all diagnoses. HRSA’s primary care group comprises family medicine, general internal medicine, geriatrics and pediatrics. Some internal medicine and pediatric subspecialties are included under the source definitions. Sex and age percentages use active physicians in each specialty with a known value for that measure.',
  'The care-team illustration uses encounter proportions in a traditional Medicare cohort and a separate ABMS count of physicians holding endocrinology, diabetes and metabolism certification in June 2026. Those measures and the 2023 HRSA practice counts have different dates and eligibility criteria.',
  'Training durations describe standard U.S. pathways after medical school. Adult endocrine certification requires internal medicine certification and qualifying fellowship training. The ABIM fellowship minimum is 24 months including 12 clinical months. The displayed routes omit combined and research pathways.',
  'The fellowship figures describe positions offered and filled in the NRMP Match for July 2026 appointments. The international medical school group combines 76 U.S. citizens and 143 non-U.S. citizens who graduated from international schools. School shares use all 389 matched adult fellowship positions as the denominator. Matching does not establish eventual graduation, certification or clinical practice.'
];

function trainingPath(path){
  const residency = `<span class="pw-step"><b>${path.years} years</b> ${escapeHTML(path.residency)} residency</span>`;
  const fellowship = path.fellowship
    ? `<span class="pw-arrow" aria-hidden="true">→</span><span class="pw-step pw-fellow"><b>${path.extra} years</b> ${escapeHTML(path.fellowship)} fellowship</span>`
    : '';
  return `<li><strong>${escapeHTML(path.name)}</strong><div>${residency}${fellowship}</div></li>`;
}

export function physicianWorkforce(){
  const specialtyRows=specialties.map(s=>[s.name,count(s.active),pct(s.women),pct(s.older)]);
  const leads=areas.map(a=>`<div><strong>${count(a.patientCare)}</strong><span>${escapeHTML(a.name)} physicians</span></div>`).join('');
  const positions=paths.filter(p=>p.fellowship).map(p=>`<li><b>${pct(ratio(p.filled,p.offered))}</b><div><strong>${escapeHTML(p.fellowship)}</strong><span>${p.filled} of ${p.offered} positions filled</span></div></li>`).join('');
  const adultMatches=paths.find(p=>p.fellowship==='Adult endocrinology').filled;
  const international=schoolMix[0];
  return `<article class="panel pw-opening"><h2>Physicians in direct patient care</h2>
    <div class="axis-unit">United States · all diagnoses · 2023</div><div class="pw-leads">${leads}</div>
    <p>General internists and family physicians make up the two largest primary care specialties. In 7.2% of U.S. counties, there was no primary care physician.</p>
    <h3>Who works in primary care?</h3>
    ${dataTable(['Specialty','Active physicians','Women','Age 65+'],specialtyRows,'Professionally active U.S. primary care physicians, 2023. Demographic shares within each specialty.')}
    </article><article class="panel pw-training"><h2>Training after medical school</h2>
    <ul class="pw-paths">${paths.map(trainingPath).join('')}</ul>
    <h3>Endocrinology fellowship positions filled in the 2026 Match</h3>
    <ul class="pw-match">${positions}</ul>
    <p>International medical graduates filled ${international.matched} of the ${adultMatches} matched adult endocrinology positions (${pct(ratio(international.matched,adultMatches))}).</p></article>`;
}

export function physicianRows(){
  const rows=[];
  const add=(metric,group,value,unit,source)=>rows.push(['Healthcare professionals',metric,group,value,unit,source]);
  for(const s of [...areas,...specialties]){
    add('Professionally active physicians',s.name,s.active,'U.S. MDs and DOs, 2023',workforce);
    add('Direct patient care physicians',s.name,s.patientCare,'U.S. MDs and DOs, 2023',workforce);
  }
  for(const s of specialties){
    add('Women',s.name,s.women,'% of active U.S. physicians with known sex, 2023',primaryCare);
    add('Age 65 or older',s.name,s.older,'% of active U.S. physicians with known age, 2023',primaryCare);
  }
  add('Counties with no primary care physician','United States',7.2,'% of U.S. counties, 2023',primaryCare);
  for(const p of paths){
    add('Residency training after medical school',p.name,p.years,'years, standard U.S. pathway',p.source);
    if(p.fellowship){
      add('Fellowship training after residency',p.name,p.extra,'years, standard U.S. pathway',p.nextSource);
      add('Fellowship Match positions offered',p.fellowship,p.offered,'positions, July 2026 appointments',nrmp);
      add('Fellowship Match positions filled',p.fellowship,p.filled,'positions, July 2026 appointments',nrmp);
      add('Fellowship Match fill rate',p.fellowship,Number(ratio(p.filled,p.offered).toFixed(1)),'% of positions offered, July 2026 appointments',nrmp);
    }
  }
  const total=schoolMix.reduce((sum,s)=>sum+s.matched,0);
  for(const s of schoolMix){
    add('Matched adult endocrinology medical school background',s.name,s.matched,'matched positions, July 2026 appointments',nrmp);
    add('Matched adult endocrinology medical school share',s.name,Number(ratio(s.matched,total).toFixed(1)),'% of matched adult endocrine positions, July 2026 appointments',nrmp);
  }
  return rows;
}
