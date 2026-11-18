import {atlasFigure} from './atlas-figures.js';
import {barList, escapeHTML, lineChart, measures, sourcesFooter} from './charts.js';
import {card, heading, pair} from './epidemiology.js';

const source = {
  brfss: ['CDC · 2025 BRFSS microdata, questionnaire and codebook', 'https://www.cdc.gov/brfss/annual_data/annual_2025.html'],
  weights: ['CDC · 2025 optional modules by state and required survey weight', 'https://www.cdc.gov/brfss/questionnaires/modules/category2025.htm'],
  national: ['AARP and National Alliance for Caregiving · Caregiving in the US 2025, figures 1 and 6', 'https://www.caregivingintheus.org/wp-content/uploads/2026/03/caregiving-in-us-2025.doi_.10.26419-2fppi.00373.001.pdf'],
  adult: ['National Alliance for Caregiving and The Hormone Foundation · Diabetes Caregivers Needs Assessment Survey, 2009', 'https://www.caregiving.org/wp-content/uploads/2020/05/NAC_Diabetes-Caregivers-Needs-Assessment-Survey_Executive-Summary-3-25-10_Final.pdf'],
  household: ['Novak et al. · Family members living with a person with type 2 diabetes, 2023', 'https://doi.org/10.1177/13591053221115326'],
  child: ['Katz et al. · Family finances, time and work in childhood type 1 diabetes, 2005–06', 'https://pubmed.ncbi.nlm.nih.gov/22133424/'],
  sleep: ['Jaser et al. · Overnight monitoring and sleep in the T1D Exchange, 2015', 'https://pubmed.ncbi.nlm.nih.gov/29157581/'],
  distress: ['Patton et al. · Diabetes-related distress over six months in parents and children, 2025', 'https://drc.bmj.com/content/13/3/e004964'],
  newOnset: ['Noser et al. · Parental depression and diabetes-specific distress after a child’s type 1 diagnosis, 2019', 'https://pubmed.ncbi.nlm.nih.gov/30570283/'],
  parents: ['Parent perspectives on education after a child’s type 1 diagnosis · Interviews and card sorting, 2021', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8178719/'],
  family: ['CDC · Helping friends and family with diabetes', 'https://www.cdc.gov/diabetes/caring/index.html'],
  symptoms: ['CDC · Symptoms of diabetes', 'https://www.cdc.gov/diabetes/signs-symptoms/'],
  voices: ['Roddy et al. · U.S. adults with type 2 diabetes describe family help, 2025', 'https://doi.org/10.1007/s10865-025-00594-7']
};

const brfssNote = 'The 2025 Behavioral Risk Factor Surveillance System asked U.S. adults whether they had regularly helped a family member or friend in the past 30 days. The denominator here is 1,643 respondents who answered yes and named diabetes as that person’s main health problem. Care recipients could be any age. The survey did not identify their diabetes type. Estimates pool the 31 participating states and represent those states only.';
const weightNote = 'The analysis used the CDC’s final main-file weights in 26 states, the version 1 weight in Maine, and the version 2 weight in Maryland, Massachusetts, Nebraska and New York. Puerto Rico was excluded. Each state appears once. Estimates use valid item responses. Taylor standard errors account for strata and primary sampling units.';
const adultNote = 'The 2009 needs assessment recruited 1,002 U.S. adults from an opt-in online panel. Each provided unpaid help to an adult relative or friend with diabetes and assisted with at least one daily task. The survey included different diabetes types. Its percentages describe the respondents.';
const pediatricNote = 'The 2005–06 National Survey of Children with Special Health Care Needs used a national probability sample. The study identified type 1 diabetes from reported diabetes and insulin use and excluded selected major comorbidities. Its weighted estimates describe families of 583 children.';
const bars = (rows, options = {}) => barList(rows, {format: value => value + '%', ...options});
const unit = text => '<p class="axis-unit">' + escapeHTML(text) + '</p>';
const reading = text => '<p class="reading">' + escapeHTML(text) + '</p>';

function facets(items) {
  return '<div class="care-facets">' + items.map(([label, rows]) =>
    '<section><h3>' + escapeHTML(label) + '</h3>' + bars(rows) + '</section>'
  ).join('') + '</div>';
}

export function caregiverProfile() {
  const demographics = [
    ["Age", [["18–34 years", 28.0], ["35–49 years", 25.9], ["50–64 years", 23.8], ["65 and older", 22.3]]],
    ["Education", [["Less than high school", 9.4], ["High school graduate", 28.6], ["Some college or technical school", 36.9], ["College or technical graduate", 25.1]]],
    ["Annual household income", [["Under $25,000", 17.8], ["$25,000–49,999", 29.9], ["$50,000–99,999", 27.5], ["$100,000 or more", 24.7]]],
    ["Race and ethnicity", [["White, non-Hispanic", 54.4], ["Black, non-Hispanic", 14.1], ["Hispanic, any race", 22.0], ["Other or multiracial, non-Hispanic", 9.5]]]
  ];
  return heading('Caregiver profile') + atlasFigure('caregivers') +
    '<article class="panel care-count"><div class="care-count-value"><strong>≈2.4M</strong><span>U.S. family caregivers</span></div><div><h2>When diabetes is the main reason for care</h2>' +
    reading('In the 2025 national report, 4% of the 59 million people who cared for an adult in the past year named diabetes as the main reason that person needed help. Families managing diabetes alongside another primary illness fall outside this estimate.') + '</div></article>' +
    card('Who provided care in the past month?', unit('31-state BRFSS · 2025 · diabetes was the recipient’s main condition') +
      measures([['60.7%','of caregivers were female'], ['39.3%','were male'], ['21.6%','reported at least 14 days of poor mental health in the past month'], ['33.3%','had provided care for at least five years']]) +
      facets(demographics)) +
    pair(
      card('Employment among caregivers', unit('31-state BRFSS · 2025 · 1,632 valid employment responses') +
        bars([["Employee", 49.6], ["Self-employed", 8.6], ["Retired", 20.5], ["Unable to work", 5.0], ["Out of work, student or homemaker", 16.3]]) +
        reading('Employment describes the caregiver’s own work. This survey did not ask whether they were paid to provide care.')),
      card('Who lived with an adult with type 2?', unit('U.S. household study · 446 adult relatives · published 2023') +
        bars([['Partner', 60.3], ['Parent of the person with diabetes', 18.6], ['Adult child', 13.7], ['Sibling', 7.4]]) +
        reading('Relatives averaged 48.7 years of age. The study included 221 women and 225 men. All shared a home with the person who had type 2 diabetes.'))
    ) +
    card('Who received their help?', unit('31-state BRFSS · 2025 · 1,633 valid relationship responses') +
      bars([["Parent or parent-in-law", 35.3], ["Grandparent", 8.2], ["Spouse or partner", 20.9], ["Child or grandchild", 6.7], ["Sibling or other relative", 18.1], ["Friend or nonrelative", 10.9]])) +
    card('The financial impact of childhood type 1', unit('U.S. families of children with insulin-treated diabetes · 2005–06') +
      bars([['Over $1,000 in annual out-of-pocket medical costs', 41], ['Child’s condition caused financial problems', 38], ['A family member reduced hours or stopped working', 35], ['At least 11 hours of care or coordination per week', 24], ['Child missed at least 11 school days in a year', 20]])) +
    sourcesFooter([['CDC · 2023 U.S. diabetes population','https://www.cdc.gov/diabetes/php/data-research/index.html'], source.national, source.brfss, source.weights, ['2025 BRFSS · Weighted estimates, sample sizes and uncertainty','data/caregiver-profile.json'], ['Reproduce the caregiver analysis','analysis/brfss_caregivers.py'], source.household, source.child], [
      'The national estimate multiplies the rounded 4% in figure 6 (6,549 survey respondents caring for an adult) by 59.0 million family caregivers of adults in figure 1. The survey was fielded in August–October 2024 and published in 2025. It includes paid and unpaid family caregivers and asks about the main recipient. The survey does not identify diabetes type in this question.',
      brfssNote + ' The valid sample sizes were 1,643 for sex, 1,627 for age, 1,642 for education, 1,400 for income, 1,618 for race and ethnicity, and 1,578 for care duration and 1,618 for poor mental health days. The grouped race/ethnicity categories are mutually exclusive. Percentages may differ from 100% by rounding.',
      weightNote,
      'The separate type 2 household study enrolled U.S. English-speaking adults through an online panel. Relationship shares use 269 partners, 83 parents, 61 adult children and 33 siblings. The study required participants to live with the person with diabetes.',
      pediatricNote + ' Amounts are dollars of the survey period. The same family can report more than one impact.'
    ]);
}

const careHours = [
  {name:'Under 20 hours', share:72.4, nursing:30.7, personal:18.9, work:60.7, mental:20.7},
  {name:'20–39 hours', share:12.2, nursing:29.1, personal:39.6, work:55.0, mental:11.4},
  {name:'40 hours or more', share:15.4, nursing:56.1, personal:61.2, work:52.3, mental:33.6}
];

export function caregiverSegments() {
  const strips = careHours.map((segment, i) => '<i class="care-tone-' + i + '" style="flex:' + segment.share + '"></i>').join('');
  const segments = careHours.map((s, i) => '<section class="care-segment"><div><i class="care-key care-tone-' + i + '" aria-hidden="true"></i><strong>' + s.share + '%</strong></div><h3>' + s.name + '</h3><p>of care per week</p><dl>' +
    [['Helped with nursing or medical tasks', s.nursing], ['Helped with personal care', s.personal], ['Employed or self-employed', s.work], ['14+ days of poor mental health', s.mental]].map(([key, value]) => '<div><dt>' + key + '</dt><dd>' + value.toFixed(1) + '%</dd></div>').join('') + '</dl></section>').join('');
  return heading('Caregiver segments') +
    card('How much of the week goes to care?', unit('31-state BRFSS · 2025 · 1,588 caregivers who reported hours · percentages inside each group') +
      '<div class="care-distribution" aria-hidden="true">' + strips + '</div><div class="care-segments care-three">' + segments + '</div>' +
      reading('Among people giving at least 40 hours of care each week, 61.2% helped with personal care such as bathing or eating, and 52.3% also held a paid job.')) +
    card('Who carried all the diabetes care?', unit('U.S. survey of 1,002 unpaid caregivers of adults · 2009') +
      bars([['Diabetes was the main condition, shared care', 51], ['Another condition came first, shared care', 32], ['Diabetes was the main condition, all care', 10], ['Another condition came first, all diabetes care', 7]]) +
      reading('In the last group, one caregiver handled all diabetes care while another condition was the person’s main health problem. Half of that group reported providing around-the-clock care.')) +
    card('Involvement and burden in type 2 households', unit('Mean Zarit caregiver burden score, 0–88 · 446 U.S. co-resident relatives · published 2023') +
      barList([['Least involved and concerned', 14.37], ['Moderately involved, less concerned', 22.27], ['Moderate concern, involvement and distress', 45.14], ['Highest concern, involvement and distress', 67.72]], {max:88, color:'#405783', format:n=>n.toFixed(1)}) +
      reading('The investigators grouped relatives by how they viewed diabetes, how involved they were and how they felt. Higher scores indicate greater burden.')) +
    sourcesFooter([source.brfss, source.weights, ['2025 BRFSS · Weighted estimates, sample sizes and uncertainty','data/caregiver-profile.json'], ['Reproduce the caregiver analysis','analysis/brfss_caregivers.py'], source.adult, source.household], [
      brfssNote + ' The weekly-hour groups contain 1,142, 218 and 228 respondents. Groups are mutually exclusive. Their shares total 100%. The measures within each group use valid responses to the relevant item. Poor mental health refers to the caregiver’s own report for the past 30 days.',
      weightNote + ' All within-group estimates shown had at least 45 positive respondents and a relative standard error under 23%.',
      adultNote + ' The 2009 responsibility groups reproduce table 3. Shared care means the caregiver provided most or some of the diabetes care.',
      'The separate type 2 household study reports mean scores on the 22-item Zarit Burden Interview, table 2. This measures perceived burden. None of these measures provides a national burnout prevalence.'
    ]);
}

const caregiverPath = [
  {phase:'Awareness', title:'Notice a reason to ask', place:'At home', action:'Ask what prompted the concern and whether the person would like help arranging a visit.', barrier:'Type 2 can develop with few noticeable changes. A family may first hear about it after a routine test.'},
  {phase:'Symptoms', title:'Make the appointment possible', place:'Home → primary care', action:'If invited, help the person describe changes and get to the appointment.', barrier:'Travel and mobility can make attending harder.', datum:'86% helped with transportation in the adult-caregiver survey.'},
  {phase:'Diagnosis', title:'Agree who joins the conversation', place:'Clinic → home', action:'Ask which conversations the person wants to share and which questions they want answered first.', barrier:'Families and patients may want different levels of involvement.', datum:'80% of surveyed caregivers went along to medical appointments.'},
  {phase:'Starting treatment', title:'Set up the first refill', place:'Clinic → pharmacy', action:'Agree who will collect prescriptions and who will ask the pharmacist or clinician about supplies.', barrier:'A new medication adds another task to the household schedule.', datum:'80% of surveyed caregivers picked up prescriptions.'},
  {phase:'Crisis', title:'Use the agreed emergency plan', place:'Home → emergency care', action:'Find the care team’s written plan, emergency contact and medication list. Follow the plan if the situation arises.', barrier:'Recognizing a low or explaining what happened can be frightening.', datum:'42% had ever rushed the person to hospital or called an ambulance for a diabetes complication.', branch:true},
  {phase:'Ongoing management', title:'Agree what a check-in looks like', place:'Home ↔ diabetes care team', action:'Ask whether a reminder, help with a reading or time alone would be most welcome.', barrier:'Adults in type 2 interviews described both useful support and unwanted reminders.', datum:'63% of surveyed caregivers helped monitor blood glucose.'},
  {phase:'Lifestyle changes', title:'Work out what fits a shared meal', place:'Store → kitchen', action:'Ask which groceries, meal or shared activity the person wants to plan together.', barrier:'The person managing diabetes and the household may have different food preferences.', datum:'71% of surveyed caregivers prepared meals.'},
  {phase:'Longer-term effects', title:'Revisit responsibilities as needs change', place:'Home ↔ clinical team', action:'Discuss changes in mobility or vision and who can cover appointments and daily care.', barrier:'Several conditions can compete for the same time and attention.', datum:'71% of surveyed caregivers helped with at least one diabetes complication.'}
];

export function caregiverJourney() {
  const stages = caregiverPath.map((s, i) => '<li class="care-step' + (s.branch ? ' care-step-branch' : '') + '"><span class="care-node" aria-hidden="true">' + (i+1) + '</span><div class="care-step-body"><div class="care-step-meta"><span>' +
    escapeHTML(s.phase) + (s.branch ? ' · if needed' : '') + '</span><span>' + escapeHTML(s.place) + '</span></div><h2>' + escapeHTML(s.title) +
    '</h2><p>' + escapeHTML(s.action) + '</p><dl><div><dt>Barrier</dt><dd>' + escapeHTML(s.barrier) + '</dd></div>' +
    (s.datum ? '<div><dt>In the survey</dt><dd>' + escapeHTML(s.datum) + '</dd></div>' : '') + '</dl></div></li>').join('');
  return heading('Caregiver journey') +
    '<p class="care-intro">Supporting an adult, from the first concern to changes in long-term care.</p><ol class="care-path">' + stages + '</ol>' +
    card('How parents’ distress changed over six months', unit('Parents of children aged 8–12 with type 1 diabetes · two U.S. clinics · study published 2025') +
      bars([['Distress decreased', 31], ['Remained stable', 55], ['Distress increased', 14]]) +
      reading('A lower group average hid a different experience for some parents. About one in seven reported a meaningful increase in diabetes-related distress.')) +
    sourcesFooter([source.adult, source.family, source.symptoms, source.voices, source.distress], [
      'The adult route organizes care decisions. Its percentages come from different questions in one 2009 survey and do not estimate transitions from one stage to the next. The crisis question asks whether a caregiver had ever taken the person to hospital or called an ambulance. People can enter at diagnosis, skip crisis care and return to earlier decisions.',
      adultNote + ' Interview findings about wanted and unwanted involvement refer specifically to adults with type 2 diabetes in a U.S. family intervention. The wording of care decisions is editorial.',
      'The separate pediatric study followed 132 parent–child pairs. Parents completed the PAID-PR distress questionnaire at baseline and six months. Change groups use the study’s minimum clinically important difference. The measure assesses diabetes-related distress.'
    ]);
}

export function caregiverRoutine() {
  return heading('Caregiver routines') +
    '<p class="journey-context">Care can start with a ride to an appointment or shopping for shared meals. In households where a child uses insulin, it can continue overnight. The surveys below trace the work families do and how it affects their own sleep, time and health.</p>' +
    card('What regular care involved', unit('31-state BRFSS · 2025 · caregivers helping someone whose main condition was diabetes') +
      bars([['Household tasks such as rides, shopping or money management', 79.1], ['Nursing or medical tasks such as injections or wound care', 34.2], ['Personal care such as bathing, eating or using the bathroom', 27.9]]) +
      reading('Household help was the most common task. The same caregiver could manage the household and also provide medical or personal care.')) +
    pair(
      card('An ordinary week of adult diabetes care', unit('Unpaid caregivers who reported each task · 2009') +
        bars([['Shopping for groceries', 84], ['Monitoring diet', 77], ['Managing household finances', 75], ['Helping monitor glucose', 63], ['Supporting exercise', 60], ['Inspecting hands or feet', 54]]) +
        reading('Among 547 caregivers whose recipient used insulin, 67% helped make sure the prescribed dose was taken. Among 657 whose recipient took oral medication, 55% helped divide the doses.')),
      card('What the caregiver gave up', unit('Share of the same 1,002 unpaid caregivers · 2009') +
        bars([['Less time with friends or other family', 68], ['Gave up vacations, hobbies or social activities', 61], ['Less time to exercise', 53], ['Worse personal mental health', 36], ['Worse personal physical health', 33]]))
    ) +
    card('What happens after a child goes to bed?', unit('Parents of children aged 2–12 with type 1 diabetes · 50 U.S. clinics · 2015') +
      measures([['69%','reported a caregiver often or always checked glucose after bedtime'], ['53%','met the study threshold for poor sleep quality']]) +
      reading('Of 515 families, 355 reported frequent overnight checks. Of 501 parents who completed the sleep questionnaire, 266 scored above its poor-sleep threshold.')) +
    lineChart({
      title:'How daily management distress changed over one year',
      unit:'Mean parental distress score · children aged 5–9 with a recent type 1 diagnosis · U.S. study, 2019',
      labels:['Study entry', '6 months', '12 months'],
      digits:1,
      series:[
        ['Elevated depressive symptoms at entry', [27.70, 20.96, 21.47]],
        ['Below the screening threshold at entry', [31.76, 15.71, 16.77]]
      ],
      note:'Daily distress eased most in the first six months. In a separate measure, worries about future complications peaked at six months among parents with elevated depressive symptoms (31.0 at entry, 35.7 at six months, 33.1 at one year).'
    }) +
    sourcesFooter([source.brfss, source.weights, ['2025 BRFSS · Weighted estimates, sample sizes and uncertainty','data/caregiver-profile.json'], ['Reproduce the caregiver analysis','analysis/brfss_caregivers.py'], source.adult, source.sleep, source.newOnset], [
      brfssNote + ' The household, medical and personal care questions had 1,620, 1,636 and 1,628 valid responses. Each question refers to the prior 30 days.', weightNote,
      adultNote + ' Respondents could report several activities or impacts. Dosing and oral-medication percentages come from figure 10 and use the medication-specific bases.',
      'The 2015 T1D Exchange survey had a 22% response rate. Poor sleep was defined as a Pittsburgh Sleep Quality Index score above 5. The survey measured sleep quality and monitoring frequency.',
      'Noser and colleagues followed 126 enrolled families. There were 125 participants at entry, 102 at six months and 89 at twelve months. The subgroup analyses in the study’s table 2 had 32 and 92 at entry, 26 and 74 at six months, and 23 and 64 at twelve months. Study entry averaged 4.6 months after diagnosis. Daily distress and long-term worries are separate scales. Read each row across time. Elevated depressive symptoms were identified using a screening questionnaire.'
    ]);
}

const adultQuestions = [
  ['What has changed in diabetes treatment?', 76],
  ['What can we do about long-term complications?', 68],
  ['How do we manage diabetes alongside another condition?', 64],
  ['How do meals and glucose checks fit together?', 62],
  ['How can I support their emotional health?', 61],
  ['How can I look after my own health?', 57],
  ['What should I know about a medical emergency?', 54],
  ['Where can I find support for myself?', 43]
];

export function caregiverQuestions() {
  const concerns = [
    ['First month', 'How do I recognize a high or low, including at night?', 'Parents wanted to practice immediate care tasks. In interviews, they described worry about lows while a child slept.'],
    ['Months 1–3', 'What changes when my child is sick or back at school?', 'Parents wanted to adapt routines to daily life. They described returning to school as an anxious handoff.'],
    ['Months 3–6', 'How can I help another adult feel ready to take over?', 'Families wanted to teach teachers or relatives, handle fears and talk about the load at home.'],
    ['Six months onward', 'Which tasks can my child start taking on?', 'Parents wanted guidance on independence, trusting others and coping with exhaustion or burnout.']
  ];
  return heading('Caregiver questions') +
    card('What adult caregivers wanted to understand', unit('Share rating information on each topic useful or very useful · 1,002 U.S. caregivers · 2009') +
      bars(adultQuestions)) +
    card('When parents wanted answers after a type 1 diagnosis', '<div class="care-question-grid">' +
      concerns.map(([period, question, basis]) => '<section><span>' + escapeHTML(period) + '</span><h3>' + escapeHTML(question) + '</h3><p>' + escapeHTML(basis) + '</p></section>').join('') + '</div>') +
    sourcesFooter([source.adult, source.parents], [
      adultNote + ' The chart rephrases selected topics from prompted question 30 as reader questions. The rates measure perceived usefulness of information. Each respondent could value several topics.',
      'In the pediatric study, 13 parents at a Midwestern pediatric clinic network sorted 55 topics by the time they would have wanted to learn them. Eleven completed interviews. Timing comes from the published card sort and the questions paraphrase those themes. Burnout appeared as a requested education topic. Neither study measured search volumes.'
    ]);
}
