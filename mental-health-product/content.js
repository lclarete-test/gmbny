export const sources = {
  nsduh: ['SAMHSA · 2024 NSDUH national report', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56287/2024-nsduh-annual-national/2024-nsduh-annual-national-html-071425-edited/2024-nsduh-annual-national.htm'],
  tables: ['SAMHSA · 2024 NSDUH detailed tables', 'https://www.samhsa.gov/data/report/2024-nsduh-detailed-tables'],
  states: ['SAMHSA · 2023–2024 state prevalence, Table 33–34', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56957/2024-nsduh-sae-tables-percent-csvs/2024-nsduh-sae-tables-percent.pdf'],
  stateCounts: ['SAMHSA · 2023–2024 state totals, Table 33–34', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56987/2024-nsduh-sae-totals-tables-csvs/2024-nsduh-sae-totals-tables.pdf'],
  youth: ['CDC · 2025 Youth Risk Behavior Survey', 'https://www.cdc.gov/yrbs/youth-health-in-focus/mental-health.html'],
  nimh: ['NIMH · Mental health information', 'https://www.nimh.nih.gov/health'],
  meps: ['AHRQ · MEPS Statistical Brief 539, 2019 expenditures', 'https://meps.ahrq.gov/mepsweb/data_files/publications/st539/stat539.pdf'],
  cms: ['CMS · Behavioral Health Integration Services', 'https://www.cms.gov/files/document/mln909432-behavioral-health-integration-services.pdf'],
  medicare: ['Medicare · Outpatient mental health coverage', 'https://www.medicare.gov/coverage/mental-health-care-outpatient'],
  medicaid: ['Medicaid · Behavioral health services', 'https://www.medicaid.gov/medicaid/benefits/behavioral-health-services/index.html'],
  parity: ['U.S. Department of Labor · Mental health parity', 'https://www.dol.gov/agencies/ebsa/laws-and-regulations/laws/mental-health-and-substance-use-disorder-parity'],
  hrsaQuarter: ['HRSA · Designated shortage area quarterly statistics', 'https://data.hrsa.gov/Default/GenerateHPSAQuarterlyReport/'],
  hrsa: ['HRSA · Health professional shortage areas', 'https://data.hrsa.gov/topics/health-workforce/shortage-areas'],
  nami: ['NAMI · Support and education programs', 'https://www.nami.org/support-education/'],
  find: ['SAMHSA · FindTreatment.gov', 'https://findtreatment.gov/'],
  ccbhc: ['SAMHSA · Community behavioral health clinics', 'https://www.samhsa.gov/communities/certified-community-behavioral-health-clinics'],
  trends: ['Google · How Trends data is adjusted', 'https://support.google.com/trends/answer/4365533?hl=en'],
  rejoyn: ['FDA · Rejoyn 510(k) K231209', 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K231209'],
  phti: ['PHTI · Virtual solutions for depression and anxiety', 'https://www.fda.gov/media/189845/download'],
  rula: ['Rula · Find mental health care', 'https://www.rula.com/'],
  talkspace: ['Talkspace · Online therapy and psychiatry', 'https://www.talkspace.com/'],
  spring: ['Spring Health · Employer mental health benefits', 'https://www.springhealth.com/'],
  headspace: ['Headspace · Mental health and mindfulness', 'https://www.headspace.com/'],
  campaign: ['CDC · How Right Now', 'https://www.cdc.gov/howrightnow/'],
  awkward: ['NAMI · Seize the Awkward campaign', 'https://www.nami.org/press-releases/new-psas-highlight-the-power-of-connection-to-combat-isolation/'],
  facilities: ['SAMHSA · 2024 N-SUMHSS annual report', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56696/2024-nsumhss-annual-report.pdf'],
  facilityTables: ['SAMHSA · 2024 N-SUMHSS detailed tables', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56703/2024-N-SUMHSS-Annual-Detailed-Tables.pdf'],
  caregiver: ['National Alliance for Caregiving · On Pins and Needles', 'https://www.mhanational.org/sites/default/files/2019-07/NAC_Mental_Illness_Study_2016_FINAL_WEB.pdf'],
  crisis: ['HHS · 988 Lifeline 2025 contacts', 'https://www.hhs.gov/press-room/samhsa-announces-231m-funding-opportunity-administer-988-lifeline.html'],
  youthTables: ['CDC · 2025 YRBS technical notes and data tables', 'https://www.cdc.gov/yrbs/yhif/files/2025/YHIF-Technical-Notes-Data-Tables-508.pdf'],
  daylight: ['FDA · DaylightRx 510(k) K233872', 'https://www.accessdata.fda.gov/cdrh_docs/pdf23/K233872.pdf'],
  pubmed: ['PubMed · Research literature', 'https://pubmed.ncbi.nlm.nih.gov/'],
};

export const chapters = [
  ['Research', [['intro', 'Introduction'], ['epidemiology', 'Epidemiology'], ['conditions', 'Types of mental illness'], ['comorbidities', 'Comorbidities and complications']]],
  ['Healthcare system', [['healthcare', 'Costs and care use'], ['healthcare/public', 'Public coverage'], ['healthcare/private', 'Private insurance'], ['healthcare/policy', 'Public policy']]],
  ['Audience', [['audience', 'Ecosystem'], ['patients/profile', 'Patients'], ['caregivers/profile', 'Caregivers'], ['hcp/profile', 'Healthcare professionals'], ['organizations', 'Organizations']]],
  ['Public discussion', [['discussion', 'Knowledge and campaigns'], ['discussion/search', 'Search interest'], ['discussion/voices', 'Public voices']]],
  ['Industry & market', [['industry/market', 'Market overview'], ['industry/companies', 'Treatment evolution'], ['industry/products', 'Devices and products']]],
];
export const audiences = {
  patients: [['profile','Profile'],['journey','Journey'],['routine','Care routine'],['treatment','Treatment and technology'],['pain','Pain map'],['questions','Questions']],
  caregivers: [['profile','Profile'],['journey','Journey'],['questions','Questions']],
  hcp: [['profile','Profile'],['journey','Journey'],['relationship','Patient relationship']],
};

export const products = [
  ['Rula','Virtual care','Individuals and insurance plans','Provider matching, therapy and psychiatry','rula'],
  ['Talkspace','Virtual care','Consumers, plans and employers','Virtual therapy and psychiatry','talkspace'],
  ['Spring Health','Employer benefits','Employers and eligible members','Mental health benefit, care navigation and provider access','spring'],
  ['Headspace','Self-guided support','Consumers and organizations','Mindfulness and self-guided content, with care services depending on offering','headspace'],
  ['DaylightRx','Prescription software','Adults with generalized anxiety disorder and their prescribers','Prescription digital behavioral therapy for generalized anxiety disorder','daylight'],
  ['Rejoyn','Prescription software','Adults in the labeled population and their prescribers','FDA-cleared computerized behavioral therapy device for depressive disorders','rejoyn'],
];

export const conditions = [
  {id:'depression', name:'Depressive disorders', measure:'Major depressive episode', time:'2024 · NSDUH', value:'8.2%', count:'21.4 million adults', summary:'Depressive disorders can affect mood, interest, energy and daily functioning. The survey measures major depressive episodes, which can occur in more than one disorder.', source:sources.nsduh[1]},
  {id:'anxiety', name:'Anxiety disorders', measure:'Any anxiety disorder', time:'2001–2003 · NCS-R', value:'19.1%', summary:'This group includes conditions such as generalized anxiety disorder, panic disorder and social anxiety disorder. NIMH reports the historical estimate using the original survey’s grouping.', source:'https://www.nimh.nih.gov/health/statistics/any-anxiety-disorder'},
  {id:'bipolar', name:'Bipolar disorders', measure:'Bipolar disorder', time:'2001–2003 · NCS-R', value:'2.8%', summary:'Bipolar disorders involve episodes of mania or hypomania. Depression can occur as part of the illness. Clinical classification looks at the pattern and history of episodes.', source:'https://www.nimh.nih.gov/health/statistics/bipolar-disorder'},
  {id:'trauma', name:'Trauma-related disorders', measure:'Post-traumatic stress disorder', time:'2001–2003 · NCS-R', value:'3.6%', summary:'PTSD can follow trauma and involve intrusive memories, avoidance, mood or thinking changes, and heightened arousal.', source:'https://www.nimh.nih.gov/health/statistics/post-traumatic-stress-disorder-ptsd'},
  {id:'ocd', name:'Obsessive-compulsive disorders', measure:'Obsessive-compulsive disorder', time:'2001–2003 · NCS-R', value:'1.2%', summary:'OCD can involve intrusive obsessions, repetitive compulsions, or both. The behaviors and thoughts can be time consuming and interfere with daily life.', source:'https://www.nimh.nih.gov/health/statistics/obsessive-compulsive-disorder-ocd'},
  {id:'eating', name:'Eating disorders', measure:'Binge eating disorder', time:'2001–2003 · NCS-R', value:'1.2%', summary:'Eating disorders include anorexia nervosa, bulimia nervosa and binge eating disorder. This estimate covers binge eating disorder specifically.', source:'https://www.nimh.nih.gov/health/statistics/eating-disorders'},
  {id:'psychosis', name:'Schizophrenia spectrum and other psychotic disorders', measure:'Schizophrenia', time:'NIMH research summary', summary:'Schizophrenia can involve hallucinations, delusions, disorganized thinking and changes in motivation or functioning. NIMH summarizes estimates from multiple studies with different methods.', source:'https://www.nimh.nih.gov/health/statistics/schizophrenia'},
];
