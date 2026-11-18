import {card, heading, pair} from './epidemiology.js';
import {barList, dataTable, lineChart, measures, sourcesFooter} from './charts.js';
import {links} from './evidence.js';

const references = [
  ['NHIS · Diet, activity and weight-loss programs in prediabetes', 'https://link.springer.com/article/10.1186/s12889-025-24551-w'],
  ['NHIS · Referral to and participation in diabetes prevention programs', 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2733168'],
  ['CDC · National Diabetes Prevention Program participation', 'https://www.cdc.gov/nccdphp/priorities/diabetes-interventions.html'],
  ['Cleveland Clinic · Referrals and completed nutrition visits', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8041989/'],
  ['NIDDK · National Diabetes Survey, 2016', 'https://www.niddk.nih.gov/-/media/Files/Health-Information/National-Diabetes-Education-Program-National-Diabetes-Survey-NNDS-2016-Final-Report.pdf'],
  ['Healthy People 2030 · Formal diabetes education', 'https://odphp.health.gov/healthypeople/objectives-and-data/browse-objectives/diabetes/increase-proportion-people-diabetes-who-get-formal-diabetes-education-d-06'],
  ['CDC · National Diabetes Statistics Report', links.cdc],
  ['T1D Exchange · Timing of mealtime insulin', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5851213/'],
  ['NHIS · 2024 adult public-use data and questionnaire', 'https://www.cdc.gov/nchs/nhis/documentation/2024-nhis.html'],
  ['NHIS · 2025 adult public-use data and questionnaire', links.nhis],
  ['NCHS · Measuring GLP-1 injectable use', 'https://www.cdc.gov/nchs/products/databriefs/db537.htm'],
  ['NHIS · Diabetes distress in 2021', 'https://www.cdc.gov/pcd/issues/2025/24_0287.htm'],
  ['FDA · Lingo glucose monitoring system', 'https://www.accessdata.fda.gov/cdrh_docs/pdf23/K233655.pdf'],
  ['Abbott · U.S. over-the-counter launch', 'https://abbott.mediaroom.com/2024-09-05-Abbotts-Lingo-TM-Continuous-Glucose-Monitor-for-Health-and-Wellness-Now-Available-in-the-U-S'],
  ['Abbott · Lingo user survey, p. 16', 'https://bynder.abbott.com/m/611ba80c96b97b83/original/Glucose-Gap-US-Download.pdf#page=16']
];

const methods = [
  'The 2016–17 NHIS diet and activity estimates cover 4,310 adults who reported a prediabetes diagnosis. Eating, movement and program participation could overlap. The referral study used a narrower group with diagnosed prediabetes and elevated BMI (at least 23 for Asian American adults and 25 for other adults). The survey did not establish CDC recognition for the programs respondents attended. CDC’s cumulative participation count comes from the National DPP itself.',
  'The Cleveland Clinic followed primary-care patients with newly identified prediabetes-range A1C and BMI of at least 25 during 2011–18. Follow-up ranged up to eight years. The completed visits were recorded within the health system. In the separate 2016 National Diabetes Survey of adults age 35 and older, 62% of respondents with diabetes received management advice or counseling in the prior year. Respondents could identify more than one source.',
  'Healthy People D-06 uses BRFSS responses from participating states and age-adjusts the estimates to the 2000 U.S. population. CDC’s physical activity, weight, smoking and measured A1C figures come from NHANES, August 2021–August 2023. The T1D Exchange study surveyed patients or their parents in a U.S. clinic registry. Published mealtime percentages are rounded.',
  'The two type 2 care charts use 2025 NHIS adult weights among respondents reporting diagnosed type 2 diabetes who answered the relevant question. A separate 2021 study of all diagnosed diabetes reported adjusted distress levels of 49.3% none, 19.8% mild, 24.3% moderate and 6.6% severe. Its categories and population differ from the 2025 chart.',
  'For the injectable estimates, each year uses the NHIS adult weight (WTFA_A) among valid responses to DIBGLP_A. Type 2 uses a reported diabetes diagnosis and type 2 classification. Prediabetes only requires reported prediabetes and no diagnosed diabetes. The question covers non-insulin injections taken to lower glucose or lose weight. NCHS uses it to estimate GLP-1 injectable use in diagnosed diabetes. Specific drugs, prescribing indications and out-of-pocket payments are unavailable in this measure.',
  'The Lingo panel uses an Abbott survey of 845 existing U.S. members conducted November 15–December 16, 2024. Members reported their own changes. The survey does not establish how many Americans with prediabetes bought a sensor, the share who paid for one themselves, or an effect attributable to the sensor.'
];

const integerPercent = {format: value => `${value}%`};

export function patientRoutines(nhis) {
  const {a1c, distress} = nhis.type2Routine;

  const dailyChanges = card('What adults with prediabetes changed',
    '<p class="axis-unit">U.S. adults who knew they had prediabetes · 2016–17</p>' +
    barList([
      ['Cutting fat or calories', 61.8],
      ['Increasing physical activity', 61.5],
      ['Taking part in a weight-loss program', 11.4]
    ])
  );

  const dietitian = card('Who reached a dietitian?',
    '<p class="axis-unit">Cleveland Clinic patients with newly identified prediabetes · 2011–18</p>' +
    dataTable(['Step', 'Patients', 'Share of cohort'], [
      ['Eligible patients in the study', '16,713', '100%'],
      ['Received a nutrition referral', '1,881', '11.3%'],
      ['Completed a nutrition visit', '140', '0.8%']
    ], 'Nutrition referrals and visits in the Cleveland Clinic cohort') +
    '<p class="reading">Among the patients referred, 7.4% completed a recorded visit.</p>'
  );

  const preventionProgram = card('Taking part in diabetes prevention',
    measures([['900,000+', 'adults had participated in the CDC National Diabetes Prevention Program’s lifestyle change program by April 2026']]) +
    '<p class="reading">In 2016–17, 4.9% of U.S. adults with diagnosed prediabetes and elevated BMI reported a prevention program referral. Among those referred, 39.6% said they took part.</p>'
  );

  const diabetesEducation = card('Learning to manage diagnosed diabetes',
    measures([['47.8%', 'of adults with diagnosed diabetes had ever taken a formal diabetes education course in 2024']]) +
    '<p class="reading">Among U.S. adults age 35 and older who received counseling for diagnosed diabetes in 2016, 33% named a registered dietitian and 41% a diabetes educator.</p>'
  );

  const dailyCare = card('Everyday health habits with diagnosed diabetes',
    '<p class="axis-unit">U.S. adults with diagnosed diabetes · 2021–23</p>' +
    barList([
      ['Managed or lost weight to lower disease risk', 51.6],
      ['Did at least 150 minutes of leisure activity a week', 36.4],
      ['Currently smoked cigarettes', 15.2]
    ]) +
    '<p class="reading">In a 2016 U.S. survey of adults age 35 and older with diabetes, 57% followed a diabetes meal plan and 52% exercised regularly in the previous four weeks.</p>'
  );

  const mealtimeInsulin = card('When young people with type 1 took mealtime insulin',
    '<p class="axis-unit">4,768 U.S. registry participants under age 26 · study published in 2018</p>' +
    barList([
      ['Several minutes before eating', 21], ['Immediately before eating', 44],
      ['During the meal', 10], ['After the meal', 24]
    ], integerPercent)
  );

  const injectionUse = lineChart({
    title: 'Non-insulin injections for blood glucose or weight loss',
    unit: 'Adults reporting current use within each group · U.S. annual estimates',
    format: 'percent', labels: [2024, 2025],
    series: [
      ['Type 2 diabetes', [28.5246, 31.8509]],
      ['Prediabetes only', [6.1265, 8.9240]]
    ],
    note: 'In 2025, about 7.0 million adults with type 2 and 2.5 million with prediabetes alone reported taking these medicines. NHIS uses this question to track GLP-1 injectables.'
  });

  const sensorUse = card('What Lingo glucose sensor users changed',
    '<p class="axis-unit">845 U.S. Lingo members surveyed by Abbott · 2024</p>' +
    barList([
      ['Ate less sugar', 52], ['Ate more protein', 51],
      ['Ate fewer carbohydrates', 50], ['Moved more after meals', 36]
    ], integerPercent) +
    '<p class="reading">Lingo went on sale without a prescription in September 2024 for adults who do not use insulin. Abbott did not publish a purchase rate for people with prediabetes in this survey.</p>'
  );

  const lastTest = card('When adults with type 2 last had an A1C test',
    '<p class="axis-unit">U.S. adults with diagnosed type 2 diabetes · 2025</p>' + barList(a1c) +
    '<p class="reading">Across all diagnosed diabetes types, 19.5% of adults had a measured A1C above 9% in 2021–23.</p>'
  );

  const dailyBurden = card('How often type 2 diabetes felt overwhelming',
    '<p class="axis-unit">U.S. adults with diagnosed type 2 diabetes · previous month · 2025</p>' + barList(distress)
  );

  const initiative = `<article class="panel routine-lead"><div><h2>What people changed at home</h2><p>Adults with prediabetes described changing what they ate, moving more or joining a program. Many acted even when they recalled no advice from a clinician. After a diabetes diagnosis, daily decisions can also include when to take medicine and what to do with a glucose reading.</p></div><div><p class="axis-unit">Took at least one action to reduce diabetes risk · U.S. adults with diagnosed prediabetes and elevated BMI, 2016–17</p>${barList([['No advice or referral',62.3],['Received advice or a referral',85.8]],{color:'#6754a7'})}</div></article>`;
  return heading('Patient care routines') + initiative +
    pair(dailyChanges, dietitian) +
    pair(preventionProgram, diabetesEducation) +
    pair(dailyCare, mealtimeInsulin) +
    pair(injectionUse, sensorUse) +
    pair(lastTest, dailyBurden) +
    sourcesFooter(references, methods);
}
