import { painData } from './pain-data.js';
import { escapeHTML, lineChart, measures, sourcesFooter } from './charts.js';
import { card, heading } from './epidemiology.js';

const scopes = ['Type 2', 'Type 1', 'Prediabetes only', 'All diagnosed'];
const populations = {
  'Type 2': 'adults with type 2 diabetes',
  'Type 1': 'adults with type 1 diabetes',
  'Prediabetes only': 'adults with reported prediabetes and no diagnosed diabetes',
  'All diagnosed': 'adults with diagnosed diabetes of any type'
};
const sites = Object.keys(painData.labels);
const markers = { lower: [98, 228], back: [228, 111], upper: [110, 88], head: [228, 35], abdomen: [77, 140], jaw: [77, 48] };
const pct = v => v == null ? '—' : `${v.toFixed(1)}%`;
const ci = row => row.ci ? `${pct(row.ci[0])}–${pct(row.ci[1])}` : 'withheld';
const count = v => v.toLocaleString('en-US');

const head = 'M-13 18Q-13 4 0 4Q13 4 13 18L12 26Q12 32 7 37Q3 41 0 41Q-4 41 -8 37Q-12 33 -12 26Z';
const body = 'M-7 36Q-7 44 -12 46L-24 50Q-31 51 -34 60L-38 75Q-40 88 -42 99L-50 127L-54 142Q-58 149 -58 154L-57 164Q-56 166 -55 163L-54 156L-54 168Q-53 171 -51 168L-49 155L-49 165Q-48 167 -47 162L-45 152L-44 144Q-44 141 -46 140L-44 134L-32 107L-25 83Q-24 78 -22 73Q-19 89 -18 99Q-17 111 -20 125Q-22 136 -22 147Q-22 168 -19 184L-16 212Q-18 221 -17 237L-14 264L-13 278L-18 285Q-23 289 -21 292Q-19 295 -8 293L-4 291Q-3 284 -4 279L-3 263L0 232L0 215L2 187L4 158Q5 151 7 151Q9 151 10 158L12 187L13 215L13 232L16 263L17 279Q15 286 17 291L22 293Q30 295 35 292Q36 289 31 285L25 278L26 264L29 237Q30 221 28 212L31 184Q34 167 33 147Q32 134 27 123Q24 111 23 101Q23 85 25 73L32 103L43 131L47 142Q44 145 46 151L48 162Q50 166 50 162L50 156L53 168Q55 171 55 167L55 156L58 164Q59 166 60 163L58 153Q58 149 54 143L53 137L47 116L42 98L39 77Q38 68 35 59Q33 53 24 50L13 46Q7 45 7 36Z';

// Matching front and back outlines keep the numbered regions comparable between views.
function silhouette(rear) {
  const landmarks = rear
    ? '<path d="M-18 61Q-10 67 -6 77M19 61Q11 67 8 77M1 57Q-1 85 2 113M-16 137Q-6 147 6 143Q17 147 28 138M-14 206Q-9 210 -5 207M16 207Q21 210 26 206"/>'
    : '<path d="M-10 47Q-7 55 0 56Q8 55 12 48M-20 56Q-8 55 -3 59M20 56Q10 55 4 59M-14 83Q-8 86 -1 82M18 83Q11 86 4 83M-17 131Q-3 137 6 149Q15 136 25 132M-12 211Q-8 216 -5 211M17 211Q21 216 25 211M-9 279L-15 284M20 279L24 285"/><path d="M-7 22H-3M4 22H8M0 22L-1 28L1 28M-4 32Q0 34 4 32"/><circle cx="3" cy="120" r="1.1"/>';
  const zones = rear
    ? `<g data-region="back" class="pain-area"><path d="M-20 58Q-12 57 0 64Q11 58 23 59L19 89Q16 108 21 125Q3 132 -15 125Q-12 106 -15 93Z"/></g>
       <g data-region="head" class="pain-area"><path d="M-11 20Q-12 6 0 6Q12 6 12 20L10 29Q0 34 -10 29Z"/></g>`
    : `<g data-region="upper" class="pain-area"><path d="M-23 51Q-33 52 -35 69L-40 96L-37 99L-29 78L-24 67Z M22 51Q32 51 35 64L40 94L36 97L29 76L24 66Z"/><path d="M-40 102L-47 132M40 102L48 133" class="pain-limb"/><ellipse cx="-51" cy="149" rx="3" ry="7"/><ellipse cx="51" cy="149" rx="3" ry="7"/></g>
       <g data-region="lower" class="pain-area"><ellipse cx="-16" cy="146" rx="5" ry="10"/><ellipse cx="27" cy="146" rx="5" ry="10"/><ellipse cx="-10" cy="214" rx="5" ry="8"/><ellipse cx="21" cy="214" rx="5" ry="8"/><path d="M-13 283L-18 289L-9 290L-5 286M22 282L29 289L20 290L18 286"/></g>
       <g data-region="abdomen" class="pain-area"><path d="M-12 103Q1 108 18 104Q15 119 21 130Q13 137 6 145Q-1 136 -13 131Q-9 118 -12 103Z"/></g>
       <g data-region="jaw" class="pain-area"><path d="M-10 28Q0 35 11 28Q8 36 2 38Q-3 39 -8 33Z"/></g>`;
  return `<g transform="translate(${rear ? 228 : 77} 14)"><path class="pain-silhouette" d="${body}"/><path class="pain-silhouette" d="${head}"/>${zones}<g class="pain-landmarks">${landmarks}</g></g>`;
}

function bodyMap() {
  const pins = sites.map((site, i) => {
    const [x, y] = markers[site];
    return `<label for="pain-site-${site}" class="pain-pin" aria-hidden="true" data-region="${site}" style="left:${x/306*100}%;top:${y/331*100}%" title="${escapeHTML(painData.labels[site])}">${i+1}</label>`;
  }).join('');
  return `<figure class="pain-figure"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306 331" role="img" aria-labelledby="pain-body-title pain-body-desc">
    <title id="pain-body-title">Front and back views of the six surveyed pain locations</title>
    <desc id="pain-body-desc">Markers correspond to the six labeled rows beside the figure. Hips, knees and feet form one survey item. Hands, arms and shoulders form another.</desc>
    ${silhouette(false)}${silhouette(true)}
    <g class="pain-view-label"><text x="77" y="325">Front</text><text x="228" y="325">Back</text></g>
    </svg>${pins}</figure>`;
}

function siteExplorer(profile) {
  const radios = sites.map((site, i) => {
    const {any, aLot} = profile.sites[site];
    const name = `${painData.labels[site]}. Any pain ${pct(any.pct)}. Bothered a lot ${aLot.pct == null ? 'withheld' : pct(aLot.pct)}.`;
    return `<input class="pain-choice" id="pain-site-${site}" type="radio" name="patient-pain-site" aria-label="${escapeHTML(name)}" aria-controls="pain-detail-${site}" aria-describedby="pain-detail-${site}" ${i===0?'checked':''}>`;
  }).join('');
  const row = (site, i) => {
    const label = painData.labels[site], {any, aLot} = profile.sites[site];
    return `<label class="pain-row" for="pain-site-${site}" data-region="${site}"><span class="pain-region-label"><span class="pain-number">${i+1}</span>${escapeHTML(label)}</span><span class="pain-rate">${pct(any.pct)}</span><span class="pain-rate">${pct(aLot.pct)}</span></label>`;
  };
  const notes = sites.map(site => {
    const {any, aLot} = profile.sites[site];
    return `<div class="pain-site-note" id="pain-detail-${site}" data-region="${site}"><strong>${escapeHTML(painData.labels[site])}</strong><span>Any pain, 95% CI ${ci(any)}. ${aLot.ci ? `Bothered a lot, 95% CI ${ci(aLot)}.` : 'The estimate for pain that bothered people a lot was withheld for precision.'} ${count(any.n)} survey respondents with a known result.</span></div>`;
  }).join('');
  return `<fieldset class="pain-atlas"><legend class="pain-sr">Select a pain location</legend>${radios}<div class="pain-layout">${bodyMap()}<div class="pain-results"><div class="pain-row pain-columns" aria-hidden="true"><span>Survey location</span><span>Any pain</span><span>Bothered a lot</span></div>${sites.map(row).join('')}<div class="pain-site-details" aria-live="polite">${notes}</div></div></div></fieldset>`;
}

const sourceLinks = [
  ['CDC / NCHS · 2025 NHIS Sample Adult file, questionnaire and survey design', 'https://www.cdc.gov/nchs/nhis/documentation/2025-nhis.html'],
  ['NCHS · Sample Adult codebook, chronic pain module', 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Dataset_Documentation/NHIS/2025/adult-codebook.pdf'],
  ['CDC / NCHS · Previous annual NHIS files', 'https://www.cdc.gov/nchs/nhis/documentation/'],
  ['NCHS Data Brief 415 · Body location definitions and 2019 population estimates', 'https://www.cdc.gov/nchs/products/databriefs/db415.htm'],
  ['Hicks and colleagues · Foot sensation in two US cohorts', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8476511/'],
  ['NIDDK · Peripheral neuropathy', 'https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/nerve-damage-diabetic-neuropathies/peripheral-neuropathy']
];

export function painProfile(scope = 'Type 2') {
  if (!scopes.includes(scope)) scope = 'Type 2';
  const profile = painData.profiles[scope];
  const selector = `<div class="scope-controls" aria-label="Pain survey population">${scopes.map(s =>
    `<button type="button" data-cohort="painScope" data-value="${s}" aria-pressed="${scope===s}">${s}</button>`).join('')}</div>`;
  const selected = sites.map(site => `
    #pain-site-${site}:checked ~ .pain-layout [data-region="${site}"]{--pain-selected:block;--pain-row:#f0f2ff;--pain-pin:#40398b;--pain-stroke:#5145a2;--pain-shade:#b2aaed}
    #pain-site-${site}:focus-visible ~ .pain-layout label[for="pain-site-${site}"]{outline:2px solid #4537a5;outline-offset:2px}
  `).join('');
  return `<style>${selected}</style>` + heading('Pain map') +
    `<article class="panel pain-panel"><div class="section-top"><h2>Where was pain reported?</h2>${selector}</div><p class="axis-unit">US ${populations[scope]} · previous three months · 2025</p>
    ${siteExplorer(profile)}</article>` +
    card('How often did pain affect daily life?', measures([
      [pct(profile.any.pct), 'Experienced pain on at least some days'],
      [pct(profile.chronic.pct), 'Had pain on most or every day'],
      [pct(profile.highImpact.pct), 'Had frequent pain that also limited life or work on most or every day']
    ])) +
    lineChart({title:'Pain in the three most frequently reported locations',unit:`US ${populations[scope]} reporting any pain at that location (%)`,format:'percent',digits:1,labels:painData.years,
      series:['lower','back','upper'].map(key=>[painData.labels[key],profile.trend[key]])}) +
    card('When diabetes affects sensation in the feet', '<p>Peripheral neuropathy can cause burning, tingling or loss of sensation. In a separate US examination survey in 1999–2004, 28.4% of adults aged 40 or older with diabetes had reduced foot sensation on a monofilament test. The pain map records symptoms from any cause and combines hips, knees and feet in one question.</p>') +
    sourcesFooter(sourceLinks, [
      `The 2025 sample contained ${count(profile.populationN)} ${populations[scope]}. ${count(profile.screenN)} answered how often they had experienced pain. These are unweighted sample counts. Percentages describe the US civilian noninstitutionalized population aged 18 or older and use the annual Sample Adult weights.`,
      'NHIS asked everyone about pain frequency. Only adults reporting pain on some, most or every day were asked how much each site had bothered them. An explicit answer of never on the initial question counts as no pain at each site. Refused, unknown and missing responses are excluded. The denominator for each site includes all adults in the selected group with a known result. A person can report several sites.',
      'Any pain includes a little, a lot and the intermediate category. Bothered a lot is a subset with the same denominator. The six anatomical groups follow the questionnaire. NHIS did not establish the cause or distinguish individual joints within a grouped item.',
      'Frequent pain means pain on most or every day in the prior three months. The final measure also requires limits to life or work on most or every day. The different survey years are independent cross-sections. The 2025 file excludes the December sample.',
      'Type is self-reported. Prediabetes only means a prior clinician diagnosis of prediabetes and no reported diagnosis of diabetes. All diagnosed includes other and unknown types. The estimates are unadjusted for age and other differences between these groups.',
      'Confidence intervals use Taylor linearization with NHIS strata and primary sampling units, a logit transformation and a t critical value. A dash marks an estimate with a denominator below 30, fewer than 10 observations on either side, or a relative standard error above 30%.'
    ]);
}
