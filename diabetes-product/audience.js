import {barList,dataTable,lineChart,matrix,measures,sourcesFooter,escapeHTML} from './charts.js';
import {links} from './evidence.js';
import {heading,card,pair} from './epidemiology.js';
import {personas,sources} from './data.js';
const therapyColors=[null,'#13796f','#5147b5','#985524'];
const cgStudy='https://pmc.ncbi.nlm.nih.gov/articles/PMC10387903/';
const deviceCount='https://storage.googleapis.com/investably-app-documents/iYqh7TjYLZSij5q7l1Qh/documents/MODD_InvestorPresentation_September2026.pdf';
export const cgmSources=[['BRFSS · CGM and fingerstick monitoring study',cgStudy],['BRFSS · Annual survey data','https://www.cdc.gov/brfss/annual_data/annual_data.htm'],['ADA · Claims by payer, Figure 6','https://diabetes.org/sites/default/files/2025-06/ADA-CGM-Covg-Report-Patient-and-HCP-Experience-of-Access-and-Choice-6-17-25.pdf'],['Modular Medical · 2024 U.S. estimates attributed to Seagrove Partners',deviceCount]];
export const cgmMedicare={title:'CGM use among adults with type 2 diabetes on insulin',unit:'% of insulin-treated members in the Medicare Advantage study',format:'percent',labels:[2021,2022,2023],series:[['Used a CGM',[4.8,10.2,13.7]]],source:'https://pubmed.ncbi.nlm.nih.gov/41760572/'};
export const cgmHistory={title:'Continuous glucose monitoring in BRFSS',unit:'Reported use per 10,000 surveyed adults with diagnosed diabetes',format:'rate',labels:[2014,2015,2016,2017,2018,2019,2020],series:[['Reported CGM use',[1.31,4.37,.30,6.12,4.28,16.55,7.29]]],source:cgStudy};
function monitor(){
  return card('Who uses a continuous glucose monitor?',measures([['≈3.7M','U.S. users with type 1 or type 2 diabetes · 2024'],['50.3 years','Mean age of CGM users in the historical BRFSS study']])+
    `<div class="matrix-grid">${[['Sex',[['Women',50.4],['Men',49.6]]],['Education',[['Less than high school',9.4],['High school',15.3],['Beyond high school',75.4]]],['Household income',[['Below $75,000',51.5],['$75,000 or more',48.5]]],['Race and ethnicity',[['White',71],['Black',12.5],['Hispanic',11.7],['Asian American, Native Hawaiian or Pacific Islander',4],['Multiracial or other',0.7]]]].map(([g,rows])=>`<section><h3>${g}</h3>${barList(rows)}</section>`).join('')}</div><p class="reading">In the 2014–20 study, 48.5% of CGM users reported income of at least $75,000, versus 22.0% of frequent fingerstick users.</p>`)+
    lineChart(cgmMedicare)+lineChart(cgmHistory)+pair(
    card('CGM users across survey periods',dataTable(['Characteristic','2014–16','2017–20','Pooled'],[['Respondents','35','196','231'],['Women','33.2%','53.9%','51.4%'],['Mean age, years','53.3','48.7','49.3'],['Beyond high school','81.8%','70.9%','72.2%']])+'<p class="reading">Survey-weighted reconstruction. The earlier period contains 35 respondents.</p>'),
    card('Public payers for CGM claims',`<p class="axis-unit">Share of claims across the three public programs · 2022</p>${barList([['Traditional Medicare',52],['Medicare Advantage',23],['Medicaid',25]])}`))+
    card('CGM and frequent fingerstick users',dataTable(['Characteristic','CGM','Fingerstick'],[['Mean age','50.3 years','56.1 years'],['Employed','59.6%','30.6%'],['Household income of $75,000+','48.5%','22.0%'],['Insured','99.7%','95.4%']]));
}
export function patientProfile(nhis,scope){
  const p=nhis.profiles[scope];
  const controls=`<div class="scope-controls" aria-label="Patient population">${Object.keys(nhis.profiles).map(k=>`<button data-scope="${k}" aria-pressed="${scope===k}">${k}</button>`).join('')}</div>`;
  return heading('Patient profile')+matrix('Patient characteristics and treatment use',`NHIS 2025 · ${(p.weightedAdults/1e6).toFixed(1)} million U.S. adults in the selected population. Patient share describes who makes up the population. Treatment percentages are within each row.`,Object.entries(p.groups),['Patient share','Insulin','Oral medication','Other injectables'],therapyColors,controls)+
    monitor()+sourcesFooter([['NHIS · Sample Adult questionnaires and public-use data',links.nhis],...cgmSources,['Medicare Advantage · CGM claims in insulin-treated type 2 diabetes',cgmMedicare.source]],[
      'Patient composition uses WTFA_A among valid responses to each characteristic. Therapy estimates use each group’s valid yes/no responses. Therapies may overlap. Therapy estimates with fewer than 30 valid responses and patient shares based on fewer than ten respondents are suppressed. AI/AN means American Indian or Alaska Native. Income uses the federal poverty threshold. Geography uses the four Census regions.',
      'The CGM market count is an industry estimate for 2024. It cannot supply national demographic counts by applying older survey percentages. CGM panels below the patient table describe the populations specified in their labels for both diabetes types.',
      'The BRFSS study compared 231 CGM users with 11,822 people checking glucose by fingerstick 4–15 times daily. Across 2014–20, 5.6 per 10,000 respondents with diagnosed diabetes reported CGM. Each annual point uses the study’s survey-count metric. Different states participated each year. The separate Medicare Advantage claims study followed an insurer’s members with type 2 diabetes and evidence of insulin use in each year. The demographic charts use the study’s weighted Table 1. The separate period table pools annual weights adjusted by the share of eligible respondents. Its pooled results differ slightly from the published analysis. Public-payer shares count claims, and an individual can generate several.'
    ]);
}
export function caregiverProfile(){
  return heading('Caregiver profile')+card('Who supported adults with diabetes?',measures([['59%','cared for a parent or parent-in-law'],['46%','lived with the person receiving care'],['64%','were employed'],['70%','were women']])+'<p class="reading">Among 1,002 U.S. unpaid caregivers surveyed in 2009, the average age was 45.5 years. Practical support often began with getting to appointments and bringing food home.</p>')+
    pair(card('Tasks reported by adult caregivers',barList([['Transportation',86],['Grocery shopping',84],['Preparing meals',71],['Helping with medicines or injections',68],['Checking glucose by fingerstick',48]])),
    card('How childhood type 1 diabetes affected families',barList([['Over $1,000 in annual medical expenses',41],['Financial impact',38],['Cut back or stopped work',35],['At least 11 hours of care per week',24],['At least 11 school absences per year',20]])+'<p class="reading">U.S. families of 583 children with type 1 diabetes · 2005–06.</p>'))+
    sourcesFooter([['National Alliance for Caregiving · Diabetes caregiver survey',links.caregivers],['Family impact of type 1 diabetes · U.S. national survey',links.families]],[ 'The adult-caregiver survey used a nonprobability panel. The childhood study sampled families of children with special health care needs. Tasks and impacts can overlap, and neither study provides a current national number of caregivers.' ]);
}
const stages = [
  ['Awareness','Could this affect me?','Curiosity','Recognize a reason to ask about screening.','Should I bring this up?','Concern','Ask what prompted the concern and what help the person wants.'],
  ['Symptoms','Should I get this checked?','Unease','Describe changes or follow up on a routine test when symptoms are absent.','Which changes should I mention?','Uncertainty','Help recall when changes started and arrange a visit if invited.'],
  ['Diagnosis','What does this result mean?','Overwhelm','Ask about the diagnosis, diabetes type and next appointment.','What support do they want?','Protectiveness','Join the conversation if invited and write down questions.'],
  ['Starting treatment','How will this fit my day?','Apprehension','Work out how to get medication, supplies and training.','Who can help with supplies?','Vigilance','Help navigate the pharmacy, insurance questions and appointments.'],
  ['Crisis care','What should I do if something goes wrong?','Fear','Follow the urgent-care plan agreed with the care team.','Where is our urgent-care plan?','Fear','Know where the agreed plan is and how to contact help.'],
  ['Ongoing management','Is my treatment working for me?','Frustration or confidence','Review glucose patterns, costs and missed doses with the care team.','When do reminders help?','Fatigue','Agree on reminders and practical help that the patient welcomes.'],
  ['Lifestyle changes','What can I sustain?','Hope','Adapt meals, movement and monitoring to work and home routines.','What can we change together?','Encouragement','Plan shared meals and activities around the person’s preferences.'],
  ['Longer-term effects','How has diabetes changed my daily life?','Concern about independence','Discuss effects on health, work and independence.','How should our roles change?','Concern about independence','Revisit time, responsibilities and support for both people.']
];
export function journey(group){
  const patient=group==='patients',n=patient?1:4;
  return heading(patient?'Patient journey':'Caregiver journey')+`<p class="journey-context">${patient?'Living with type 2 diabetes':'Supporting an adult with type 2 diabetes'}</p><ol class="journey-path">${stages.map((s,i)=>`<li><div class="waypoint">${i+1}</div><div><h2>${s[0]}</h2><p class="journey-question">${s[n]}</p><dl><div><dt>Feeling</dt><dd>${s[n+1]}</dd></div><div><dt>Action</dt><dd>${s[n+2]}</dd></div></dl></div></li>`).join('')}</ol>`+sourcesFooter([['CDC · Living with diabetes','https://www.cdc.gov/diabetes/living-with/index.html'],['CDC · Family support',sources.family.url]],['This is a research synthesis. Questions and feelings are prompts to explore with participants.']);
}
export function personaPage(group){
  const people=personas.filter(p=>p.audience===group).sort((a,b)=>Number(b.type==='t2')-Number(a.type==='t2'));
  return heading(group==='patients'?'Patient personas':'Caregiver personas')+`<div class="persona-deck">${people.map((p,i)=>`<article class="persona-tile tone-${i%3}"><div class="persona-cover"><span>${p.tags[0]}</span><h2>${p.label}</h2><p>${p.context}</p></div><dl>${[['Everyday task',p.task],['Friction to explore',p.friction],['Tools and support',p.device]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></article>`).join('')}</div>`+sourcesFooter([...new Set(people.map(p=>p.source))].map(id=>[sources[id].title,sources[id].url]),['These role-based profiles synthesize secondary research. The situations are hypotheses for interviews.']);
}
export function routine(group,nhis){
  if(group==='caregivers')return heading('Caregiver routines')+card('Overnight care for children with type 1 diabetes',measures([['69%','often or always checked glucose after bedtime'],['51%','slept fewer than seven hours'],['53%','met criteria for poor sleep quality']])+
    '<p class="reading">Parents reported an average of 6.5 hours of sleep. The study surveyed families of children ages 2–12 at 50 U.S. clinics.</p>')+
    card('How support is shared',`<div class="organ-list">${[['Home','Agree on reminders, shopping and the care tasks the person welcomes.'],['School and work','Coordinate supplies and contacts across settings.'],['Appointments','Decide who attends and who tracks questions or next visits.'],['Transitions','Revisit responsibilities as independence or treatment changes.']].map(([k,v])=>`<section><h3>${k}</h3><p>${v}</p></section>`).join('')}</div>`)+sourcesFooter([['Parents’ sleep and overnight monitoring · U.S. clinic registry',links.sleep],['CDC · Family support',sources.family.url]],['This 2015 parent survey had a 22% response rate. Denominators varied from 501 to 515 by item. The support situations are research prompts.']);
  const t=nhis.type2Routine;
  return heading('Patient care routines')+pair(
    card('Feeling overwhelmed by type 2 diabetes',`<p class="axis-unit">U.S. adults with type 2 diabetes · past month · 2025</p>${barList(t.distress)}`),
    card('When adults with type 2 diabetes last had an A1C test',`<p class="axis-unit">U.S. adults with type 2 diabetes · 2025</p>${barList(t.a1c)}`))+
    pair(card('Everyday care and health',`<p class="axis-unit">U.S. adults with diagnosed diabetes · 2021–23</p>${barList([['Managing or losing weight to reduce risk',51.6],['At least 150 minutes of leisure activity weekly',36.4],['A1C above 9%',19.5],['Current smoking',15.2]])}`),card('Diabetes-related distress',`<p class="axis-unit">U.S. adults with diagnosed diabetes · NHIS 2021</p>${barList([['None',49.3],['Mild',19.9],['Moderate',24.3],['Severe',6.6]])}`))+
    sourcesFooter([['NHIS · 2025 adult microdata and questionnaire',links.nhis],['CDC · National Diabetes Statistics Report',links.cdc],['NHIS · Diabetes distress',sources.distress.url]],['The two type 2 charts use 2025 NHIS Sample Adult weights among respondents reporting physician-diagnosed type 2 diabetes who answered the relevant question. The 2021 distress scale covers all diagnosed diabetes and uses different response categories.']);
}
export function questions(group){
  const data={
    patients:[['Making sense of readings','What does this number mean for my next meal or appointment?'],['Treatment access','What will I pay when I refill my medication or replace a sensor?'],['Daily routines','How do I make this work on a night shift or away from home?']],
    caregivers:[['Autonomy','What help does the person want me to offer?'],['Shared tasks','Who handles meals, appointments or supplies this week?'],['Urgent situations','Where can I find the care plan if something changes?']],
    public:[['Diabetes types','How are type 1, type 2 and prediabetes different?'],['Personal risk','Can someone have high blood glucose without symptoms?'],['Devices','What does a glucose sensor tell me that a single reading cannot?']]
  };
  return heading(group==='public'?'Public questions':(group==='patients'?'Patient':'Caregiver')+' questions')+`<div class="question-list">${data[group].map(([k,v])=>`<article><span>${k}</span><h2>${escapeHTML(v)}</h2></article>`).join('')}</div>`+sourcesFooter([['CDC · Diabetes basics','https://www.cdc.gov/diabetes/about/']],['These questions are editorial interview prompts, informed by the source.']);
}
