const years = ['2021', '2022', '2023', '2024'];
const ages = ['Ages 18+', 'Ages 18–25', 'Ages 26–49', 'Ages 50+'];
const nsduh = '2024 · NSDUH · U.S. adults';
const meps = '2019 · MEPS Household Component · U.S. adults';
const facilities = '2024 · N-SUMHSS · U.S. mental health treatment facilities';
const caregiver = '2015 · National Alliance for Caregiving survey · 1,601 respondents';
const chart = (title, period, source, rows, unit = '%', note = '') => ({title, period, source, rows, unit, note});
const table = (title, period, source, headers, rows, note = '') => ({title, period, source, headers, rows, note});
const trend = (title, source, series, note) => ({title, source, labels: years, series, period:'2021–2024 · NSDUH · U.S. adults', unit:'%', note});
const prevalence = [
  [23.0, 23.1, 22.8, 23.4], [34.5, 36.2, 33.8, 33.2], [28.5, 29.4, 29.2, 29.7], [15.0, 13.9, 14.1, 15.2],
];
const depression = [[8.5,8.8,8.5,8.2],[19.3,20.1,17.5,15.9],[9.6,9.7,10.2,10.0],[4.5,4.6,4.5,4.4]];
const byAge = series => ages.map((label, i) => [label, series[i]]);
const ageTrend = trend('Any mental illness over time', 'nsduh', byAge(prevalence), 'Figure 51. SAMHSA found no statistically significant 2021–2024 change in these age groups.');
const depressionTrend = trend('Major depressive episode over time', 'nsduh', byAge(depression), 'Figure 49. The estimate for ages 18–25 declined from 19.3% in 2021 to 15.9% in 2024.');
const payer = [['Private insurance',33.87],['Medicaid',27.61],['Medicare',20.38],['Out of pocket',15.62],['Other sources',9.06]];
const channels = [['Any treatment',22.9],['Prescription medication',16.7],['Telehealth',12.8]];
const uptake = [
  ['Any mental illness','61.5 million','32.0 million','52.1%','29.5 million'],
  ['Serious mental illness','14.6 million','10.3 million','70.8%','4.3 million'],
  ['Major depressive episode','21.4 million','13.8 million','64.4%','7.6 million'],
];
const uptakeTable = table('Who received treatment?', nsduh, 'nsduh',
  ['Past-year measure','Adults meeting criteria','Received treatment','Share receiving treatment','No treatment'], uptake,
  'NSDUH Tables A.61–A.67. These groups overlap. Receiving treatment and meeting the condition criteria are both measured over the prior year.');
const settingTable = table('Where facilities deliver care', facilities, 'facilities',
  ['Level of care','Facilities','Share of 14,091 reporting facilities'],
  [['Outpatient','12,015','85.3%'],['Residential','2,460','17.5%'],['Hospital inpatient','1,288','9.1%']],
  'Table A.3. Facilities can offer multiple levels of care.');
const telehealth = chart('Facilities offering telehealth therapy', facilities, 'facilityTables',
  [['All reporting facilities',79.4],['Outpatient facilities',89.1],['Community mental health centers',92.1],['Certified community clinics',92.8],['Psychiatric hospitals',49.5]],
  '%','Table MH14b. Percentages use the facilities in each row as the denominator.');
const caregiverProfile = table('Who provides unpaid care?', caregiver, 'caregiver',
  ['Respondent characteristic','Estimate'],
  [['Mean age','54 years'],['Ages 45–64','54%'],['Caring for a relative','88%'],['Caring for an adult son or daughter','45%'],['Living with the person receiving care','45%']],
  'A targeted survey of caregivers of adults with moderate to serious mental health issues. These are sample estimates.');
const unmet = chart('Perceived unmet need among untreated adults with mental illness', nsduh,'nsduh',
  [['Ages 18+',21.0],['Ages 18–25',33.5],['Ages 26–49',23.9],['Ages 50+',8.0]],
  '%','Figure 78. The denominator is adults with any mental illness who received no mental health treatment. About 6.1 million reported unmet need.');
const treatmentByAge = table('Treatment reach by age and condition', nsduh, 'nsduh',
  ['Age','Any mental illness','Serious mental illness','Major depressive episode'],
  [['18–25','49.9%','71.3%','61.4%'],['26–49','53.0%','69.0%','63.3%'],['50+','52.0%','74.4%','69.6%']],
  'Figure 77 and Table A.61B. Each cell uses adults in that age group who met the corresponding past-year criteria.');
const cohort = table('Mental illness and substance use overlap', nsduh,'nsduh',
  ['Past-year group','Estimated adults'],
  [['Mental illness only','40.3 million'],['Both mental illness and substance use disorder','21.2 million'],['Substance use disorder only','25.1 million'],['Either condition','86.6 million']],
  'Figure 57. The groups in the first three rows are mutually exclusive. Substance use disorder alone is outside the AMI definition.');
const service = [['Ambulatory visits',44.21],['Prescribed medicines',31.78],['Other services',30.54]];
const shortage = table('Where shortage designations apply', 'March 31, 2026 · HRSA','hrsaQuarter',
  ['Designation type','Count'],
  [['Geographic area','1,166'],['Population group','893'],['Facility','4,900'],['Total','6,959']],
  'Table 5. HRSA estimated 7,393 additional practitioners were needed to remove these designations under its methodology.');
const cbt = chart('Treatment available at reporting facilities', facilities, 'facilityTables',
  [['Individual psychotherapy',91.8],['Cognitive behavioral therapy',90.5],['Group therapy',83.9],['Couples or family therapy',71.8],['Integrated dual disorders treatment',69.9],['Dialectical behavior therapy',63.4]],
  '%','Table MH14b. Services can overlap. Availability is reported at the facility level.');
const access = chart('Unpaid caregiver constraints',caregiver,'caregiver',
  [['High emotional stress',74],['Less time for themselves than wanted',63],['Difficulty discussing the condition with others',48]],
  '%','Executive summary. The targeted sample was surveyed in September 2015.');

export const reports = {
  intro: {
    title:'Mental health in the United States',
    summary:'About 61.5 million U.S. adults met criteria for a mental illness in 2024. Treatment reached about half of them.',
    stats:[['61.5 million','adults with any mental illness','2024 · NSDUH'],['29.5 million','adults with mental illness who did not receive treatment','2024 · NSDUH'],['$106.5 billion','spent treating adult mental disorders','2019 · MEPS']],
    blocks:[uptakeTable],
    cards:[['epidemiology','How prevalence varies by state and age'],['conditions','What the different diagnoses mean'],['healthcare','Where care is delivered and who pays']],
  },
  epidemiology:{title:'Epidemiology',summary:'Map the number of adults affected and their share of the population. Compare modeled state estimates with national and youth survey trends.',special:'map',
    blocks:[ageTrend,chart('High school mental health indicators','2025 · CDC Youth Risk Behavior Survey · U.S. high school students','youth',
      [['Persistent sadness or hopelessness',33],['Poor mental health',23]],'%', 'The YRBS covers students attending high school. These indicators come from different survey questions.'), table('Persistent sadness or hopelessness by grade','2025 · CDC YRBS','youthTables',
      ['Grade','Prevalence','95% CI','Unweighted respondents'],[['9th','33%','30%–36%','3,014'],['10th','34%','31%–37%','2,719'],['11th','34%','31%–38%','2,555'],['12th','32%','29%–35%','2,158']])]},
  conditions:{title:'Types of mental illness',summary:'Read the definition and prevalence for each condition. Survey period, population and diagnostic measure appear next to each estimate.',special:'conditions',blocks:[depressionTrend]},
  comorbidities:{title:'Comorbidities and complications',summary:'In 2024, 21.2 million adults met criteria for both mental illness and a substance use disorder. Only 14.5% of this group received both types of treatment.',blocks:[cohort,chart('Treatment among adults with both conditions',nsduh,'nsduh',
    [['Mental health treatment only',41.0],['Substance use treatment only',3.2],['Both types',14.5],['Neither type',41.2]],'%', 'Figure 80. Values can differ from 100% because of rounding.')]},
  healthcare:{title:'Costs and care use',summary:'Compare the population receiving care, the sites that provide it, and the historical cost of treating adult mental disorders.',blocks:[uptakeTable,settingTable,chart('Spending by type of service',meps,'meps',service,'$B','Figure 4. Spending represents payments across sources for the civilian noninstitutionalized population.')]},
  'healthcare/public':{title:'Public coverage',summary:'Medicaid and Medicare together paid about $48 billion for adult mental disorder treatment in the 2019 MEPS benchmark.',blocks:[chart('Public spending by program',meps,'meps',payer.slice(1,3),'$B','Figure 5. These are historical expenditures.' )],links:['medicaid','medicare','cms']},
  'healthcare/private':{title:'Private insurance',summary:'Private insurance paid about one-third of measured adult mental health treatment spending. Direct payments accounted for about 15%.',blocks:[chart('Private insurance and payments by patients',meps,'meps',[payer[0],payer[3]],'$B','Figure 5. Direct payments exclude insurance premiums.')],links:['parity']},
  'healthcare/policy':{title:'Public policy',summary:'Track workforce shortages and the capacity of crisis and community services.',blocks:[shortage,table('Crisis and community infrastructure','2024–2025 · U.S. services','crisis',
    ['Measure','Reported volume'],[['988 contacts in 2025','More than 8 million'],['Local centers in the 988 network, as described in January 2026','More than 200']],
    'Contacts include repeat use. They are a count of interactions.' )],links:['ccbhc','cms']},
  audience:{title:'Mental health ecosystem',summary:'Follow the data for people seeking care, unpaid supporters, providers and organizations.',blocks:[uptakeTable,settingTable],cards:[['patients/profile','Patients and treatment reach'],['caregivers/profile','Unpaid caregivers'],['hcp/profile','Professionals and shortage areas'],['organizations','Provider organizations']]},
  'patients/profile':{title:'Patient profile',summary:'Age changes the likelihood of meeting the survey criteria and the likelihood of receiving treatment.',blocks:[chart('Any mental illness by age',nsduh,'nsduh',byAge(prevalence).map(([label, values])=>[label,values.at(-1)])),treatmentByAge]},
  'patients/journey':{title:'Patient journey',summary:'The national survey shows how many adults met criteria, received care or perceived an unmet need during the past year.',blocks:[uptakeTable,unmet]},
  'patients/routine':{title:'Care routine',summary:'Prescription medication and telehealth measure different parts of ongoing treatment and may overlap for the same person.',blocks:[chart('Treatment use across all adults',nsduh,'nsduh',channels,'%', 'Table A.60B. The denominator is the entire adult survey population.'),telehealth]},
  'patients/treatment':{title:'Treatment and technology',summary:'Compare the share of providers offering each modality with the share of adults using treatment.',blocks:[cbt,chart('Treatment delivery among adults',nsduh,'nsduh',channels),telehealth],links:['rejoyn','daylight']},
  'patients/pain':{title:'Patient pain map',summary:'Among untreated adults with mental illness, young adults were most likely to report an unmet need in the age groups shown.',blocks:[unmet,uptakeTable]},
  'patients/questions':{title:'Patient research questions',summary:'Use the survey’s care gaps to guide interviews about specific attempts to find and stay in treatment.',blocks:[unmet,table('Interview guide','Benchmarks from 2024 NSDUH','nsduh',['What the data show','Question to ask'],[['49.9% of adults ages 18–25 with AMI received treatment','Tell me about the last time you considered getting support. What happened next?'],['33.5% of untreated young adults with AMI reported unmet need','Was there a point when you wanted help and could not get it? What happened?'],['12.8% of adults used telehealth for mental health','Think about your most recent remote appointment. What worked well? What got in the way?']])]},
  'caregivers/profile':{title:'Caregiver profile',summary:'The National Alliance for Caregiving surveyed 1,601 unpaid caregivers of adults with moderate to serious mental health issues in 2015.',stats:[['32 hours','mean weekly time spent caregiving',caregiver],['9 years','mean time in the caregiving role',caregiver],['74%','reported high emotional stress',caregiver]],blocks:[caregiverProfile,access]},
  'caregivers/journey':{title:'Caregiver journey',summary:'The survey captures what happens when support becomes long-term and families need a plan for continuity.',blocks:[caregiverProfile,table('Caregiver succession and financial dependence',caregiver,'caregiver',['Item','Respondents reporting it'],[['Friends and family provide financial support that the adult child depends on','64%'],['Someone is designated to take over care if the parent can no longer provide it','32%'],['The adult child can rely on other friends or family for help','35%']], 'These figures are for the subgroup caring for an adult son or daughter.') ]},
  'caregivers/questions':{title:'Caregiver research questions',summary:'Ask people about specific care tasks, how they share them and what happens when they need help themselves.',blocks:[access,table('Interview guide',caregiver,'caregiver',['Survey benchmark','Question to ask'],[['32 hours per week on average','Walk me through the last day you helped. What did you do and what took the most time?'],['48% found it difficult to talk to others about the condition','Tell me about the last time you decided whether to ask someone for help.'],['32% of parent caregivers reported a plan for future care','If you were unavailable next week, how would care continue?']])]},
  'hcp/profile':{title:'Healthcare professional profile',summary:'HRSA estimates how many additional practitioners would be needed to remove shortage designations. Facility surveys describe services and settings.',stats:[['6,959','mental health shortage area designations','March 2026 · HRSA'],['7,393','additional practitioners needed under HRSA criteria','March 2026 · HRSA'],['26.78%','of designated need met under HRSA criteria','March 2026 · HRSA']],blocks:[shortage,settingTable]},
  'hcp/journey':{title:'Healthcare professional workflow',summary:'Provider workflows vary by setting. Compare whether facilities can deliver remote and integrated care.',blocks:[telehealth,cbt],links:['cms']},
  'hcp/relationship':{title:'Patient and clinician relationship',summary:'Facility capabilities help explain where patients and families can meet clinicians, including by video and in family therapy.',blocks:[telehealth,chart('Individual, group and family care',facilities,'facilityTables',[['Individual psychotherapy',91.8],['Group therapy',83.9],['Couples or family therapy',71.8]],'%','Table MH14b. Measures facility availability.') ]},
  organizations:{title:'Organizations',summary:'The federal facility survey counts clinical organizations and identifies which sites offer remote care.',blocks:[table('Organizations listed in the facility survey',facilities,'facilityTables',['Organization type','Facilities','Offer telehealth therapy'],[['Outpatient mental health facilities','5,766','89.1%'],['Community mental health centers','1,923','92.1%'],['Certified Community Behavioral Health Clinics','954','92.8%'],['Psychiatric hospitals','430','49.5%'],['Veterans Affairs medical centers','382','96.1%']], 'Table MH14b. Selected categories. See the full table for remaining facility types.')],links:['find','ccbhc','nami']},
  discussion:{title:'Knowledge and campaigns',summary:'Compare public resources with measured use of crisis services and school survey indicators.',blocks:[table('Crisis service reach','2025 · HHS','crisis',['Measure','Reported volume'],[['988 contacts','More than 8 million'],['Local centers in the network','More than 200']], 'Contact volume measures interactions and does not identify unique people.')],links:['campaign','awkward','youth']},
  'discussion/search':{title:'Search interest',summary:'Explore live U.S. search comparisons. Google Trends reports an index from 0 to 100 within each comparison.',special:'search',links:['trends']},
  'discussion/voices':{title:'Public voices',summary:'Read published survey responses and first-person accounts about getting support and providing care.',blocks:[access],links:['nami','caregiver','campaign']},
  'industry/market':{title:'Market overview',summary:'The MEPS benchmark measured $106.5 billion in payments to treat adult mental disorders in 2019. The charts show service and payer mix.',blocks:[chart('Spending by service',meps,'meps',service,'$B','Figure 4. Rounded estimates.'),chart('Spending by payer',meps,'meps',payer,'$B','Figure 5. Rounded estimates.')],links:['phti']},
  'industry/companies':{title:'Treatment evolution',summary:'The facility survey measures how widely telehealth is offered. FDA records identify when specific prescription software products received clearance.',blocks:[telehealth,table('Prescription software regulatory milestones','2024 · FDA 510(k) decisions','rejoyn',['Date','Product','Record'],[['March 2024','Rejoyn','K231209'],['August 2024','DaylightRx','K233872']], 'The linked decision records describe each device and the intended use corresponding to its clearance.')],links:['daylight','phti']},
  'industry/products':{title:'Devices and products',summary:'Compare virtual care networks, employer benefits, self-guided tools and FDA-cleared prescription software.',special:'catalog',links:['phti','rejoyn','daylight']},
};
