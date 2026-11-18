import { barList, dataTable, escapeHTML, lineChart, measures, sourcesFooter } from './charts.js';
import { card, heading, pair } from './epidemiology.js';

const CDC_TEAM = ['CDC · Your diabetes care team', 'https://www.cdc.gov/diabetes/treatment/diabetes-doctors.html'];
const ADA_TEAM = ['American Diabetes Association · Your health care team', 'https://diabetes.org/health-wellness/diabetes-and-your-health/your-healthcare-team'];
const ADCES_SURVEY = ['ADCES · 2025 National Practice Survey, methods and tables', 'https://journals.sagepub.com/doi/10.1177/26350106251401514'];
const ADCES_SERIES = ['ADCES · National Practice Survey results across three waves', 'https://www.adces.org/docs/default-source/practice/practice-resources/national-practice-survey/164-25_nps_infographic-final.pdf'];
const DSMES = ['Seven-organization consensus · Diabetes self-management education and support for adults with type 2 diabetes', 'https://journals.sagepub.com/doi/10.1177/0145721720930959'];
const REFERRALS = ['CDC · Overcoming barriers to diabetes education referrals', 'https://www.cdc.gov/diabetes-toolkit/php/patient-referral-process/overcoming-referral-barriers.html'];
const UNC = ['University of North Carolina · Electronic referral prompts in six primary care clinics', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13197142/'];
const MEDICATION_TRIAL = ['Minnesota primary care trial · Shared decision making for patients with type 2 diabetes', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3751736/'];
const CONSULTATION_TRIAL = ['New Haven randomized trial · QBSafe conversation cards in type 2 diabetes', 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2855477'];
const DIAGNOSIS = ['US patient and clinician interviews · Immediate concerns at type 2 diabetes diagnosis', 'https://pubmed.ncbi.nlm.nih.gov/41438321/'];
const PORTAL = ['Veterans Health Administration · Content analysis of secure messages in type 2 diabetes', 'https://diabetes.jmir.org/2023/1/e40272/'];
const COMMUNITY = ['Connecticut community health centers · Patient portal messages and nursing follow-up', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12815827/'];
const PREVENTION = ['Two Midwestern practices · Patient perceptions of prediabetes and prevention', 'https://pubmed.ncbi.nlm.nih.gov/27621093/'];
const T1_TRAVEL = ['UCLA Health · Daily experiences of adults using diabetes technology', 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2851862'];
const SURVEY_METHOD = 'ADCES invited 28,807 professional contacts. Its voluntary 2025 survey included 2,455 partial or complete responses. Item denominators vary. Percentages describe survey respondents.';
const wholePercent = { format: v => `${v}%` };

function tiles(entries) {
  return `<div class="organ-list">${entries.map(([title, body]) =>
    `<section><h3>${escapeHTML(title)}</h3><p>${escapeHTML(body)}</p></section>`).join('')}</div>`;
}

export function hcpProfile() {
  const roles = [
    ['Primary care clinicians', 'Family physicians, internists, nurse practitioners and physician associates can provide ongoing diabetes care. The practice reviews glucose and blood pressure, manages medication and coordinates screening and referrals.'],
    ['Endocrinologists', 'These physicians specialize in hormonal conditions. They can help manage type 1 diabetes, complex glucose patterns and intensive insulin therapy with the patient and the primary care team.'],
    ['Registered dietitian nutritionists', 'Dietitians deliver medical nutrition therapy. They work with the patient on meals that fit medication timing, food preferences, budget and work schedules.'],
    ['Diabetes care and education specialists', 'Specialists teach people how to use glucose readings, medication and devices in everyday life. They can come from nursing, dietetics, pharmacy and other disciplines.'],
    ['Pharmacists', 'Pharmacists explain how to take medications and use supplies, check for interactions and help resolve refill or affordability problems.'],
    ['Eye, foot and kidney specialists', 'Eye clinicians screen for retinal disease. Podiatrists assess foot injuries and loss of sensation. Nephrologists help manage kidney disease when a referral is needed.']
  ];
  const team = [
    ['Registered nurse', '64%', '68%'], ['Registered dietitian nutritionist', '57%', '66%'],
    ['Physician', '46%', '61%'], ['Advanced practice nurse', '27%', '45%'],
    ['Pharmacist', '28%', '44%'], ['Social worker', '22%', '33%'],
    ['Physician associate', '15%', '24%'], ['Community health worker', '9%', '17%']
  ];
  return heading('Healthcare professional profile') +
    card('Who does what in diabetes care', tiles(roles)) +
    card('Who works on a diabetes education team?', dataTable(['Role reported on team', '2021', '2025'], team)) +
    sourcesFooter([CDC_TEAM, ADA_TEAM, ADCES_SURVEY], [SURVEY_METHOD,
      'The team question allowed multiple roles. A respondent could report both a physician and a pharmacist on the same team.']);
}

export function hcpSegments() {
  return heading('Healthcare professional segments') +
    lineChart({ title: 'Professional background of diabetes care and education specialists',
      unit: 'Respondents in each ADCES practice survey (%)', format: 'percent', digits: 0,
      labels: [2017, 2021, 2025], series: [
        ['Nursing', [48, 42, 46]], ['Dietetics and nutrition', [38, 34, 39]], ['Pharmacy', [7, 6, 8]]
      ] }) +
    pair(card('Where specialists practiced in 2025', barList([
      ['Hospital outpatient department', 34], ['Telehealth or online', 25],
      ['Hospital inpatient department', 22], ['Endocrinology practice', 20],
      ['Primary care practice', 19], ['Community organization', 8], ['Federally qualified health center', 7]
    ], wholePercent)),
    card('Which populations they served', barList([
      ['People with type 2 diabetes', 97], ['People with type 1 diabetes', 88], ['People with prediabetes', 76]
    ], wholePercent))) +
    sourcesFooter([ADCES_SURVEY, ADCES_SERIES], [SURVEY_METHOD,
      'The time series shows the three largest primary disciplines reported in 2025. Other disciplines were also represented. Care settings and patient populations allowed multiple answers. These results cover the surveyed diabetes education workforce.']);
}

export function hcpJourney() {
  const stages = [
    ['At diagnosis', 'Understand what the diagnosis means to this person.',
      'Primary care and the diabetes education team', 'Ask what the person already knows, agree on one immediate priority and connect them to an education service. Check whether language, cost or work hours will affect the first visit.'],
    ['At the annual review or when goals are unmet', 'Look for what is getting in the way of the agreed plan.',
      'Primary care, pharmacist and diabetes educator', 'Bring glucose results and the medication list into the same conversation. Ask about side effects, access to refills and the fit with daily routines. Renew the education referral if needs have changed.'],
    ['When complications or new challenges emerge', 'Revisit care when physical health, emotional health or living circumstances change.',
      'Treating clinician with the relevant specialist', 'Address the new concern and adapt the self-management plan. For example, vision changes can alter how a person reads a meter or administers medication.'],
    ['During a transition in life or care', 'Make sure the next team and the patient share the same plan.',
      'Sending and receiving teams', 'After hospital discharge or a change of clinician, reconcile medications and supplies, identify the next contact and check whether the follow-up appointment happened.']
  ];
  const path = `<ol class="journey-path">${stages.map(([title, prompt, team, steps], i) =>
    `<li><div class="waypoint" aria-hidden="true">${i + 1}</div><div><h2>${escapeHTML(title)}</h2><p class="journey-question">${escapeHTML(prompt)}</p><dl><div><dt>Care team</dt><dd>${escapeHTML(team)}</dd></div><div><dt>Handoff</dt><dd>${escapeHTML(steps)}</dd></div></dl></div></li>`).join('')}</ol>`;
  return heading('Healthcare professional journey') + path +
    card('What changed when the visit included a referral prompt?',
      barList([['Eligible visits with a prompt', 12.9], ['Eligible visits in usual care', 1.2]]) +
      '<p>The study compared orders for diabetes education across six North Carolina primary care clinics, with 2,526 eligible encounters in the intervention group and 1,444 in usual care.</p>') +
    sourcesFooter([DSMES, REFERRALS, UNC], [
      'The four moments follow the consensus guidance for adults with type 2 diabetes. Handoffs illustrate how a team can apply that guidance. A person can return to any moment.',
      'The North Carolina study measured referral orders at eligible visits in participating practices in 2023–2024. The endpoint was an order placed during the visit.'
    ]);
}

export function hcpRelationship() {
  return heading('Patient and clinician relationship') +
    card('What changes when adults with type 2 diabetes choose medication with their clinician?',
      measures([['77%', 'Reported discussing medications with a decision aid'], ['45%', 'Reported discussing medications in usual care']]) +
      '<p>In a Minnesota primary care trial, decision aids made it easier to discuss medication choices during the visit. The trial included 103 adults and 41 clinicians.</p>') +
    pair(card('Let the patient choose the agenda',
      '<p>In a New Haven trial, adults with type 2 diabetes chose up to three concerns for their visit. At six months, average A1C was 8.8% with the tool and 9.1% with usual care. The adjusted difference was −0.2 percentage points (95% CI −0.9 to +0.5). The uncertainty interval includes both improvement and worsening.</p>'),
    card('Carry the conversation beyond the appointment',
      '<p>In a Connecticut community health center pilot, 11 of 22 participants with type 2 diabetes needed referrals to specialists or social or behavioral services. Nurses and community health workers used messages to coordinate next steps, from arranging appointments to resolving questions about medication.</p>')) +
    card('What newly diagnosed adults wanted explained', tiles([
      ['What caused this?', 'Newly diagnosed adults wanted to understand the roles of family history and lifestyle. An explanation of the diagnosis can address this concern before introducing a treatment plan.'],
      ['Do I need medication?', 'Participants described uncertainty about starting medication and what a change in daily habits might achieve. That is a concrete decision to discuss during the visit.']
    ])) +
    sourcesFooter([MEDICATION_TRIAL, CONSULTATION_TRIAL, COMMUNITY, DIAGNOSIS], [
      'The Minnesota trial studied decision aids for glucose-lowering medication or statins. The New Haven trial enrolled 143 adults with type 2 diabetes and an A1C above 8%. The Connecticut portal pilot involved 22 adults across two community health centers.',
      'The diagnosis interviews included 18 recently diagnosed adults and eight clinicians. Interview topics identify concerns in that study and have no population frequency.'
    ]);
}

const ORGANIZATIONS = [
  ['American Diabetes Association', 'Rights and navigation', 'People with all types of diabetes, families and school teams',
    'The information center connects people to diabetes resources. Safe at School helps families resolve barriers to diabetes care during the school day.',
    [['Information center', 'https://diabetes.org/about-us/center-information'], ['School rights and support', 'https://diabetes.org/advocacy/safe-at-school-state-laws/resolving-challenges']]],
  ['Breakthrough T1D', 'Type 1 diabetes research and support', 'People with type 1 diabetes and their caregivers',
    'Newly diagnosed guides and care kits help families get oriented. The clinical trials service connects people interested in participating with type 1 diabetes research.',
    [['Newly diagnosed resources', 'https://www.breakthrought1d.org/newly-diagnosed/'], ['Clinical trial finder', 'https://www.breakthrought1d.org/clinical-trials/']]],
  ['Beyond Type 1', 'Peer resources and insulin access', 'People with type 1 or type 2 diabetes, including people who need insulin',
    'Beyond Type 2 offers newly diagnosed resources and peer support. The GetInsulin.org service helps people in the US identify insulin affordability options.',
    [['Insulin access', 'https://getinsulin.org/about/'], ['Type 2 resources', 'https://beyondtype1.org/newly-diagnosed-with-type-2/']]],
  ['The diaTribe Foundation', 'Independent diabetes education', 'People with diabetes or prediabetes and people who support them',
    'The nonprofit publication explains diabetes research, medications and devices through free articles and a newsletter for people making everyday care decisions.',
    [['About diaTribe', 'https://diatribe.org/about-diatribe'], ['Foundation programs', 'https://diatribe.org/foundation']]],
  ['Association of Diabetes Care & Education Specialists', 'Local education programs', 'People seeking education, referring clinicians and diabetes care and education specialists',
    'The program finder helps people locate accredited diabetes self-management education and support. Clinicians can use the same directory when making a referral.',
    [['Find an education program', 'https://www.adces.org/program-finder']]]
];

export function organizations() {
  const cards = ORGANIZATIONS.map(([name, role, audience, work, links]) =>
    `<article class="creator-card"><h2>${escapeHTML(name)}</h2><dl><div><dt>${escapeHTML(role)}</dt><dd>${escapeHTML(work)}</dd></div><div><dt>Audience</dt><dd>${escapeHTML(audience)}</dd></div></dl><p>${links.map(([label, url]) =>
      `<a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`).join(' · ')}</p></article>`);
  return heading('Diabetes organizations') + `<div class="creator-grid">${cards.join('')}</div>` +
    sourcesFooter(ORGANIZATIONS.map(([name, , , , links]) => [name, links[0][1]]),
      ['Roles and services come from each organization’s own materials. The directory focuses on support, advocacy, education and research available to people in the United States.']);
}

export function patientQuestions() {
  return heading('Patient questions') +
    card('What did adults with type 2 diabetes message their care team about?',
      barList([['Prescription refills or renewals', 90.7], ['Appointments or referrals', 81.4],
        ['Medication or equipment', 63.5], ['Health issues', 29.7], ['Test results', 25.1],
        ['Testing issues', 24.5], ['Sharing their readings', 20.7], ['Technology issues', 11.1]]) +
      '<p>The percentages show how many of the 323 US veterans who initiated a diabetes-related exchange raised each topic at least once.</p>') +
    card('Questions adults raised in portal messages', tiles([
      ['Where can I get a replacement meter?', 'A veteran reported that a new battery had failed to fix a meter that could no longer read blood samples.'],
      ['Who can help me schedule my eye exam?', 'A veteran followed up with the team about a pending eye exam after receiving lab results.'],
      ['Why is my glucose higher in the morning?', 'A Connecticut patient asked the team to explain a pattern of high morning readings.'],
      ['Would my A1C results change my medication?', 'A Connecticut patient messaged the team about whether a new result should affect a proposed medication change.']
    ])) +
    card('How questions change with a person’s situation', tiles([
      ['New type 2 diagnosis', 'What does family history have to do with my diagnosis, and how much can changing my habits help? These concerns came up in interviews with 18 newly diagnosed adults.'],
      ['Prediabetes', 'What is my risk of diabetes, and could I try a lifestyle program before medication? Researchers interviewed 35 adults with prediabetes in two Midwestern primary care practices.'],
      ['Travel with type 1 diabetes', 'How do I keep enough supplies with me, and what happens if equipment needs replacing away from home? Travel logistics and device replacement came up in a UCLA Health study with written responses from 535 adults about living with type 1 diabetes technology.']
    ])) +
    sourcesFooter([PORTAL, COMMUNITY, DIAGNOSIS, PREVENTION, T1_TRAVEL], [
      'Questions are editorial paraphrases of issues patients raised in the cited studies. The VA study coded 2,240 message threads from 448 veterans across all topics. Topic percentages use 323 frequent portal users who initiated a diabetes-related thread as their denominator. A participant could raise multiple topics, and a caregiver could send a message on the patient’s behalf.',
      'The Connecticut study included 22 adults with type 2 diabetes at two community health centers. The diagnosis, prediabetes and travel studies used separate samples. Their questions have no national search-frequency estimate.'
    ]);
}
