export const sources = {
  nsduh: ['SAMHSA · 2024 NSDUH national report', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56287/2024-nsduh-annual-national/2024-nsduh-annual-national-html-071425-edited/2024-nsduh-annual-national.htm'],
  tables: ['SAMHSA · 2024 NSDUH detailed tables', 'https://www.samhsa.gov/data/report/2024-nsduh-detailed-tables'],
  states: ['SAMHSA · 2023–2024 state prevalence, Table 33', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56957/2024-nsduh-sae-tables-percent-csvs/2024-nsduh-sae-tables-percent.pdf'],
  stateCounts: ['SAMHSA · 2023–2024 state totals, Table 33', 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56987/2024-nsduh-sae-totals-tables-csvs/2024-nsduh-sae-totals-tables.pdf'],
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

export const pages = {
  intro: ['Mental health in the United States', 'Explore who experiences mental health conditions, what it takes to access care, and how services and products fit into daily life.', [
    ['What the dashboard measures','Population surveys estimate prevalence and service use. Clinical assessments describe a person’s symptoms, functioning and care needs. Product and payer sources describe how people can enter or pay for care.'],
    ['Three populations','Adult national estimates, state model estimates and school survey estimates have different denominators. Read the population and timeframe alongside each figure.'],
    ['Where to start','Use Epidemiology for population estimates, Audience for care journeys and Industry & market for product comparisons.'],
  ], ['nsduh','states','youth','nimh']],
  epidemiology: ['Epidemiology', 'National population estimates and state variation in past-year mental illness, with a separate view of youth survey indicators.', [
    ['National change','The NSDUH estimate for adults with any mental illness was 58.7 million in 2023 and 61.5 million in 2024. SAMHSA reported no statistically significant change in prevalence from 2021 through 2024.'],
    ['Youth indicators','CDC’s high school survey recorded a decline in persistent sadness or hopelessness from 40% in 2023 to 33% in 2025. The survey represents students attending high school.'],
    ['Reading state comparisons','Use the age selector and confidence intervals to compare estimates. These are modeled annual averages for 2023–2024. A state’s rank can change with sampling and model uncertainty.'],
  ], ['nsduh','states','stateCounts','youth']],
  conditions: ['Types of mental illness', 'Explore the conditions, the definitions used for population estimates, and what each measure can tell us.', [
    ['Any mental illness','SAMHSA uses this umbrella estimate for a mental, behavioral or emotional disorder in the past year, excluding developmental and substance use disorders.'],
    ['Serious mental illness','SAMHSA uses this category for adults whose mental illness substantially limits major life activities. It is a measure of impairment that can span diagnoses.'],
    ['Interpreting the estimates','People may meet criteria for more than one condition. The benchmarks come from different surveys and periods, so adding them would double count people and mix populations.'],
  ], ['nsduh','nimh']],
  comorbidities: ['Comorbidities and complications', 'Clinical complexity changes which teams a person sees, how many handoffs they face and what progress means to them.', [
    ['Substance use and mental health','In 2024, 21.2 million U.S. adults had both any mental illness and a substance use disorder in the past year. Among those adults, 41.2% received neither type of treatment.'],
    ['Sleep, pain and chronic conditions','Flag sleep and pain symptoms as separate care needs. Track whether medical and behavioral teams share records, coordinate follow-up and account for side effects.'],
    ['Functioning and acute care','Track effects on work, school and daily activities alongside symptom measures. Study transitions after emergency or inpatient care separately from routine outpatient follow-up.'],
  ], ['nsduh','tables','nimh']],
  healthcare: ['Costs and care use', 'The treatment gap and the spending footprint capture different parts of the healthcare system.', [
    ['Treatment reach','In 2024, 32.0 million adults with any mental illness received mental health treatment, or 52.1% of adults with any mental illness. The survey includes medication, inpatient and outpatient care, and telehealth.'],
    ['Spending benchmark','MEPS reported $106.5 billion in spending to treat mental disorders among about 44 million adults in 2019. That is a historical expenditure measure for the civilian, noninstitutionalized population.'],
    ['How to compare costs','Keep the provider’s charge, insurer allowed amount and patient out-of-pocket payment in separate fields. Split psychotherapy, professional medication management, prescriptions and facility-based care.'],
    ['Claims funnel','Use a defined denominator to track initial visit, follow-up, continuity and acute care. Include enrollment windows and coverage churn when interpreting gaps in claims.'],
  ], ['nsduh','meps','cms']],
  'healthcare/public': ['Public coverage', 'Medicare and Medicaid shape who can get care, which providers can bill and what a person pays.', [
    ['Medicare','Review Part B outpatient benefits and provider eligibility. Review medication benefits separately and check the member’s plan details.'],
    ['Medicaid','Benefits, delivery systems and network access vary by state. Compare managed care arrangements, behavioral health carve-outs and local service availability.'],
    ['Integrated care','CMS describes behavioral health integration and psychiatric collaborative care billing. Compare staffing, documented activities and measurement requirements before modeling revenue.'],
  ], ['medicare','medicaid','cms','meps']],
  'healthcare/private': ['Private insurance', 'Coverage research should follow the steps a member takes from checking benefits to receiving a bill.', [
    ['Network and availability','Test whether directory entries accept new patients, match the plan and offer the relevant modality, language and appointment times.'],
    ['Costs','Record the deductible, copay, coinsurance and out-of-network reimbursement separately. Capture the quoted cost and the final patient responsibility.'],
    ['Employer benefits','Track whether an EAP or employer vendor covers a limited set of sessions, offers navigation, or hands the member off to the health plan.'],
    ['Parity','Use Department of Labor guidance when studying limits such as network rules and authorization requirements. Record jurisdiction, plan type and dates.'],
  ], ['parity','spring','meps']],
  'healthcare/policy': ['Public policy', 'Policy research connects the rule, covered population, implementation mechanism and measurable result.', [
    ['Network and workforce','Compare provider shortage designations with real appointment availability. Workforce supply, insurance participation and language access need separate measures.'],
    ['Community clinics','Certified Community Behavioral Health Clinics are a service delivery model. Review participating sites, services, intake pathways and referral handoffs.'],
    ['Parity and access','Compare published plan rules with observed appointment and billing outcomes. Track enforcement and implementation dates separately.'],
  ], ['hrsa','ccbhc','parity']],
  audience: ['Mental health ecosystem', 'Follow the relationships among people seeking support, their families, the professionals who deliver care and the organizations that pay for or organize it.', [
    ['People seeking care','People navigate recognition, trust, first access, ongoing care and changes in care. See the patient chapter for research questions and friction points.'],
    ['Family and chosen supporters','Supporters may help with logistics, practical needs and communication. The person receiving care should have a voice in what information is shared.'],
    ['Care teams and infrastructure','Clinicians, peers, plans, employers and community organizations shape availability and continuity. Referral ownership and follow-up are key handoffs to investigate.'],
  ], ['nimh','nami','cms','ccbhc']],
  'patients/profile': ['Patient profile', 'Segment people by their care needs and barriers as well as symptoms and diagnosis.', [
    ['First time seeking care','Compare people who know what kind of provider they want with people who need help choosing a starting point.'],
    ['Returning or switching','Study the role of insurance changes, provider fit, language and scheduling in switching or returning to care.'],
    ['Multiple care needs','Recruit people who coordinate medical and behavioral health care, as well as people who receive support mostly through primary care or community settings.'],
  ], ['nsduh','tables']],
  'patients/journey': ['Patient journey', 'A research model for the path from recognizing a need through ongoing care and re-entry.', [
    ['Recognize and seek','Explore how a person names what is happening and whether they ask a friend, search online or speak to a clinician.'],
    ['Find and start','Trace benefits verification, clinician match, intake and the first completed visit. Measure delays and how many attempts people make.'],
    ['Continue or switch','Capture how people judge fit, decide whether treatment is helping and seek a new provider or level of care.'],
    ['Pause and return','Identify what triggers re-entry and whether previous goals, records and referrals are available when the person returns.'],
  ], ['nimh','find']],
  'patients/routine': ['Care routine', 'What people do between appointments affects how much work it takes to stay engaged in care.', [
    ['Before a visit','Gather examples of reminders, questions people bring and how they handle scheduling, portals or telehealth setup.'],
    ['Between visits','Study where people track goals, symptoms, medication questions or exercises, and who can see those records.'],
    ['After a change','Ask what happens when a provider changes, a routine breaks or a person feels worse. Identify who owns communication and follow-up.'],
  ], ['nimh','cms']],
  'patients/treatment': ['Treatment and technology', 'Compare therapy, medication management and digital support by role, continuity and strength of evidence.', [
    ['Psychotherapy','Compare access, format, clinician fit, session cadence and whether progress is reviewed during treatment.'],
    ['Medication management','Observe the prescribing visit, pharmacy handoff, medication cost and follow-up around benefits and side effects.'],
    ['Digital support','Separate telehealth delivery, self-guided tools, coaching and prescription software. Record the intended user, data sharing and availability of human support.'],
  ], ['nimh','phti','rejoyn','nsduh']],
  'patients/pain': ['Patient pain map', 'Research hypotheses across the care journey. Use interviews, operational logs and claims to test where people drop off and why.', [
    ['Discovery','Directory mismatch, uncertainty about what type of clinician to see and language availability. Measure contacts per completed booking.'],
    ['Intake','Repeated paperwork, unexpected costs, unclear privacy and long waits. Measure time from first attempt to first completed visit.'],
    ['Continuity','Schedule conflicts, weak clinician fit, billing surprises or disconnected tools. Measure follow-up attendance and why people stop or switch.'],
    ['Transitions','Unclear ownership of referrals or records when a person changes provider or leaves acute care. Measure successful handoffs and follow-up time.'],
  ], ['tables','hrsa','phti']],
  'patients/questions': ['Patient research questions', 'Interview prompts designed to surface what people did and the choices they faced.', [
    ['Recognition','Can you take me back to when you first considered getting support? What was happening then?'],
    ['Access','Think about the last time you tried to book care. What did you do first? What happened next?'],
    ['Between visits','What, if anything, did you do between appointments? How did you decide what to share at the next visit?'],
    ['Continuity','Tell me about the last time you paused, switched or considered stopping care. What shaped that decision?'],
  ], ['tables','nimh']],
  'caregivers/profile': ['Caregiver profile', 'Family, partners, friends and chosen supporters may help with transportation, appointments, language and day-to-day logistics.', [
    ['Practical support','Identify who helps with scheduling, cost, transportation or communication, and when those responsibilities shift.'],
    ['Consent and boundaries','Explore how people decide which details they share, who takes part in visits, and how preferences change over time.'],
    ['Caregiver strain','Ask about time, money, stress and access to support for the caregiver. Separate occasional help from ongoing responsibilities.'],
  ], ['nami','nimh']],
  'caregivers/journey': ['Caregiver journey', 'Follow how supporters enter the care journey, help with transitions and renegotiate their role over time.', [
    ['Notice and talk','Ask how a supporter first became involved and what language made the conversation easier or harder.'],
    ['Help navigate','Trace consent, scheduling, transportation, provider communication and how gaps are resolved.'],
    ['Share responsibilities','Observe how people balance support, independence and caregiver capacity when needs change.'],
  ], ['nami','ccbhc']],
  'caregivers/questions': ['Caregiver research questions', 'Prompts focused on concrete actions, coordination and boundaries.', [
    ['Starting point','When did you first become involved? What did the person ask you to help with?'],
    ['Coordination','Tell me about the last appointment or referral you helped with. Who did what?'],
    ['Boundaries','How do you know what to handle yourself and what to leave to the person receiving care?'],
    ['Support','Can you recall a time when you needed help yourself? What happened?'],
  ], ['nami']],
  'hcp/profile': ['Healthcare professional profile', 'Mental health teams span primary care, specialty clinicians, case managers and peer support.', [
    ['Clinical roles','Compare primary care clinicians, prescribers and therapists by assessment, treatment, referral and follow-up responsibilities.'],
    ['Coordination roles','Care managers and peers can play distinct roles in outreach, navigation and follow-through. Document where the roles overlap and where cases are handed off.'],
    ['Geographic supply','Use HRSA shortage designations to screen for access constraints and validate against plan directories, scheduling and local capacity.'],
  ], ['hrsa','hrsaQuarter','cms','ccbhc']],
  'hcp/journey': ['Healthcare professional workflow', 'Follow the work from referral through assessment, treatment planning, monitoring and transition.', [
    ['Referral and triage','Track what information arrives, who reviews it and how the team decides the next step.'],
    ['Assessment and planning','Document how teams track symptoms and functioning, discuss preferences, and arrange follow-up.'],
    ['Review and transition','Observe documentation, care-team review and what happens when someone misses care or is referred elsewhere.'],
  ], ['cms','ccbhc']],
  'hcp/relationship': ['Patient and clinician relationship', 'Study how trust, shared decisions and communication shape continuity.', [
    ['Early decisions','Ask how patients and clinicians agree on goals, format and frequency, and what happens when expectations differ.'],
    ['Progress conversations','Compare formal measures with people’s accounts of daily functioning. Ask how a stalled or worsening trajectory leads to follow-up.'],
    ['Between-session contact','Document availability, response time and what a patient should expect from messaging or an app integrated into care.'],
  ], ['nimh','cms','phti']],
  organizations: ['Organizations', 'Public agencies, community organizations and clinical networks play distinct roles in the mental health ecosystem.', [
    ['SAMHSA','Publishes national and state survey evidence, provides a treatment locator and supports community behavioral health programs.'],
    ['NIMH and CDC','NIMH publishes mental health research and education. CDC tracks population health indicators, including high school student mental health.'],
    ['NAMI and community groups','Support and education organizations can be research partners for understanding family roles, peer support and gaps in navigation.'],
    ['HRSA and CMS','HRSA tracks shortage areas. CMS publishes Medicare payment and coverage materials.'],
  ], ['tables','find','ccbhc','nimh','youth','nami','hrsa','cms']],
  discussion: ['Knowledge and campaigns', 'Public communication can influence how people talk about mental health, where they look for help and how they judge services.', [
    ['Awareness','Compare language people use in search or conversation with the language used by clinicians and campaigns.'],
    ['Campaign examples','CDC’s How Right Now organizes practical resources around emotional needs. Seize the Awkward encourages teens and young adults to start conversations with friends.'],
    ['Calls to action','Code each campaign by intended audience and action, such as learning, finding care or asking for support.'],
    ['Evaluation','Track reach, follow-through and access separately. Define the outcome before attributing changes to a campaign.'],
  ], ['nimh','nami','youth','campaign','awkward']],
  'discussion/search': ['Search interest', 'Explore search intent using the same geography, timeframe and query settings for every comparison.', [
    ['Discovery and language','Compare general terms with searches for symptoms, therapy formats and local providers. Test English, Portuguese and Spanish separately.'],
    ['Insurance and price','Review searches that combine service, location, plan and price. Use a stable anchor term when repeating comparisons across batches.'],
    ['Interpretation','Google Trends indexes relative search interest from 0 to 100 within a comparison. Record whether you used search terms or topics.'],
  ], ['trends']],
  'discussion/voices': ['Public voices', 'A listening framework for interpreting public accounts in context.', [
    ['Patients and caregivers','Look for accounts of access, fit, privacy, cost and continuity. Keep lived experience separate from company promotion.'],
    ['Clinicians and community groups','Track public commentary on workforce, reimbursement and referral quality. Identify the speaker’s role and setting.'],
    ['Responsible synthesis','Use aggregate themes. Record search dates, platform, inclusion criteria and sponsorship disclosures. Follow each source’s rules for quoting and redistribution.'],
  ], ['nami','pubmed']],
  'industry/market': ['Market overview', 'Compare mental health services and products by purchaser, delivery channel and care model.', [
    ['Who pays','Commercial plans, Medicaid and Medicare, employers and consumers support different payment arrangements. Count spending, vendor revenue and membership separately.'],
    ['What is sold','Compare per-visit care, contracted networks, bundled benefits, software subscriptions and prescribed tools by their unit of payment.'],
    ['How to validate','Pair public vendor claims with contracts, outcome studies or claims where available. Record inclusion criteria, follow-up, attrition and independent evaluation.'],
  ], ['meps','phti','cms','spring']],
  'industry/companies': ['Treatment evolution', 'Trace how specialty care, integrated care and digital delivery have expanded the ways people can get support.', [
    ['Specialty outpatient care','Therapy and prescribing can be delivered by separate professionals or coordinated through one clinic. The central research question is how handoffs work.'],
    ['Primary care integration','Psychiatric collaborative care brings structured follow-up, a behavioral health care manager and a consulting psychiatric clinician into the care model.'],
    ['Virtual delivery','Virtual networks expanded the ways people can connect with clinicians. Compare video and asynchronous workflows, provider licensure and continuity.'],
    ['Prescription software','FDA 510(k) K231209 documents clearance of Rejoyn. Review the decision and labeling when comparing a cleared device with other digital tools.'],
  ], ['cms','phti','rejoyn']],
  'industry/products': ['Devices and products', 'Browse examples across virtual care, employer benefits, self-guided support and prescription software.', [
    ['Comparison criteria','Record who buys the product, how patients get access, where a clinician is involved and what supports the product’s stated purpose.'],
    ['Access and payment','Verify availability, eligibility and price for the relevant plan or employer. Pricing and coverage can change by contract and location.'],
  ], ['phti','rula','talkspace','spring','headspace','rejoyn']],
};

export const products = [
  ['Rula','Virtual care','Individuals and insurance plans','Provider matching, therapy and psychiatry','rula'],
  ['Talkspace','Virtual care','Consumers, plans and employers','Virtual therapy and psychiatry','talkspace'],
  ['Spring Health','Employer benefits','Employers and eligible members','Mental health benefit, care navigation and provider access','spring'],
  ['Headspace','Self-guided support','Consumers and organizations','Mindfulness and self-guided content, with care services depending on offering','headspace'],
  ['Rejoyn','Prescription software','Adults in the labeled population and their prescribers','FDA-cleared computerized behavioral therapy device for depressive disorders','rejoyn'],
];

export const metrics = [
  ['61.5M','Adults with any mental illness',2024,'SAMHSA NSDUH'],
  ['23.4%','Share of U.S. adults with any mental illness',2024,'SAMHSA NSDUH'],
  ['52.1%','Adults with any mental illness who received treatment',2024,'SAMHSA NSDUH'],
  ['33%','High school students with persistent sadness or hopelessness',2025,'CDC YRBS'],
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
