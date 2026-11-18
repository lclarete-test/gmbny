// Selected U.S. product history. Each year refers to the event named on that stop.
const fdaHistory = 'https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin';
const fdaLabel = 'https://www.accessdata.fda.gov/drugsatfda_docs/label/';
const pma = 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=';

export const treatmentMilestones = [
  {
    id:'iletin', label:'Insulin injections', year:1923, track:'medicine', event:'U.S. distribution',
    title:'Replace the missing insulin', product:'Iletin · animal insulin',
    before:'Before insulin, a severely restricted diet could buy time for someone with type 1 diabetes. It could not replace the missing hormone.',
    change:'After successful treatment in Toronto in 1922, Lilly distributed injectable insulin in the U.S. in 1923.',
    remains:'Patients or caregivers had to prepare and give repeated injections.',
    source:'FDA · Insulin discovery, production and U.S. distribution', url:fdaHistory
  },
  {
    id:'orinase', label:'Glucose-lowering tablets', year:1957, track:'medicine', event:'U.S. launch',
    title:'Treat type 2 with a tablet', product:'Orinase · tolbutamide',
    before:'Insulin was the main drug option when changes in diet alone did not control glucose.',
    change:'A daily tablet could prompt the pancreas to release more of its own insulin in some people with type 2 diabetes.',
    remains:'The tablet needed working insulin-producing cells. People with type 1 still needed insulin.',
    source:'U.S. Senate · Introduction of tolbutamide to the American market',
    url:'https://ipmall.law.unh.edu/sites/default/files/BAYHDOLE/4_PREPPED_FILES/1961.05.08_Senate_Report_on_Administered_Prices_Drugs.pdf'
  },
  {
    id:'dextrostix', label:'Blood test strips', year:1965, track:'monitoring', event:'Clinical test strip',
    title:'Read glucose from a drop of blood', product:'Ames Dextrostix',
    before:'A urine test showed sugar that had already passed through the kidneys. It lagged behind blood glucose.',
    change:'A clinician put blood on a treated strip, waited one minute and matched the color to a chart.',
    remains:'The result depended on the color match. The strip was designed for clinical use.',
    source:'FDA · Early blood glucose strips and meters', url:fdaHistory
  },
  {
    id:'dextrometer', label:'Digital meters', year:1980, track:'monitoring', event:'Meter introduction',
    title:'Get a number at home', product:'Ames Dextrometer',
    before:'Early blood strips depended on a visual color match, and electronic readers had been bulky.',
    change:'A digital meter read the Dextrostix strip and displayed a number, bringing blood glucose checks into the home.',
    remains:'Every reading took a fingerstick and a strip. Glucose between tests was still invisible.',
    source:'American Diabetes Association · History of glucose self-monitoring',
    url:'https://www.ncbi.nlm.nih.gov/books/NBK538968/'
  },
  {
    id:'humulin', label:'Human insulin', year:1982, track:'medicine', event:'FDA approval',
    title:'Produce human insulin at scale', product:'Humulin · human insulin',
    before:'The insulin supply depended on collecting and processing pancreases from cattle and pigs.',
    change:'Recombinant manufacturing gave patients access to insulin with the same amino acid sequence as human insulin.',
    remains:'The source of insulin changed. Patients still needed to inject it and monitor their glucose.',
    source:'FDA · Recombinant human insulin', url:fdaHistory
  },
  {
    id:'minimed-502', label:'Wearable pumps', year:1983, track:'delivery', event:'U.S. launch',
    title:'Wear a pump between meals', product:'MiniMed 502',
    before:'A person using injections gave separate doses throughout the day.',
    change:'A wearable pump fed insulin through an infusion site, supplying background insulin between meals and overnight.',
    remains:'The user managed the pump, its infusion site and mealtime doses. Glucose checks were separate.',
    source:'Medtronic · MiniMed 502 introduction',
    url:'https://origin.medtronicdiabetes.com/about-medtronic-innovation/milestone-timeline'
  },
  {
    id:'novopen', label:'Cartridge pens', year:1987, track:'delivery', event:'FDA clearance',
    title:'Carry insulin in a pen', product:'NovoPen · refillable insulin pen',
    before:'An injection typically meant carrying a vial and drawing insulin into a separate syringe.',
    change:'The U.S. clearance covered a reusable pen that held an insulin cartridge and dispensed measured amounts.',
    remains:'The person still gave each injection and replaced the cartridge when it ran out.',
    source:'FDA · NovoPen System clearance, K861686',
    url:'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K861686'
  },
  {
    id:'glucophage', label:'Metformin', year:1994, track:'medicine', event:'FDA approval',
    title:'Reduce the glucose the liver releases', product:'Glucophage · metformin',
    before:'Sulfonylureas, an established class of tablets, stimulated insulin release.',
    change:'Metformin gave people with type 2 another way to lower blood glucose, chiefly by reducing glucose production in the liver.',
    remains:'People took the tablets with meals. Kidney function mattered when choosing treatment.',
    source:'FDA · Original U.S. metformin application',
    url:'https://www.accessdata.fda.gov/drugsatfda_docs/nda/pre96/020357Orig1s000rev.pdf'
  },
  {
    id:'humalog', label:'Mealtime insulin', year:1996, track:'medicine', event:'FDA approval',
    title:'Bring insulin dosing closer to a meal', product:'Humalog · insulin lispro',
    before:'Regular human insulin was typically injected about 30 minutes before eating.',
    change:'Rapid-acting lispro offered a shorter window. Its label allows injection within 15 minutes before eating or immediately afterward.',
    remains:'The person still had to match the mealtime dose to food and glucose.',
    source:'FDA · Humalog approval year and mealtime use', url:fdaLabel+'2013/020563s115lbl.pdf'
  },
  {
    id:'minimed-cgms', label:'Glucose traces', year:1999, track:'monitoring', event:'FDA approval',
    title:'See what happened between checks', product:'MiniMed Continuous Glucose Monitoring System',
    before:'A meter reading captured one moment. Overnight highs or lows could pass between checks.',
    change:'A sensor recorded glucose under the skin. A clinician could download roughly 72 hours of readings and look for patterns.',
    remains:'Patients still used a fingerstick meter. The original system showed them no live readings.',
    source:'FDA · Original MiniMed CGMS safety and effectiveness',
    url:'https://www.accessdata.fda.gov/cdrh_docs/pdf/P980022B.pdf'
  },
  {
    id:'byetta', label:'GLP-1 injections', year:2005, track:'medicine', event:'FDA approval',
    title:'Use a gut hormone signal to lower glucose', product:'Byetta · exenatide',
    before:'Tablets or insulin alone did not meet the treatment needs of everyone with type 2 diabetes.',
    change:'This GLP-1 medicine helped the pancreas release insulin when glucose was elevated and slowed the emptying of the stomach.',
    remains:'The original Byetta pen required two injections a day, timed before meals.',
    source:'FDA · Original Byetta label', url:fdaLabel+'2005/021773lbl.pdf'
  },
  {
    id:'guardian-rt', label:'Live alerts', year:2005, track:'monitoring', event:'FDA approval',
    title:'Get an alert while glucose is changing', product:'Guardian RT',
    before:'With the original MiniMed sensor, people waited for the clinic to download the readings.',
    change:'Adults could see their sensor values in real time and receive an alert when glucose crossed a preset high or low.',
    remains:'A fingerstick reading was still required before changing treatment.',
    source:'FDA · Guardian RT real-time display and alerts', url:pma+'P980022S011'
  },
  {
    id:'invokana', label:'SGLT2 tablets', year:2013, track:'medicine', event:'FDA approval',
    title:'Lower glucose through the kidneys', product:'Invokana · canagliflozin',
    before:'Common tablets lowered liver glucose production or stimulated insulin release.',
    change:'This once-daily SGLT2 tablet let adults with type 2 pass more glucose in urine by reducing its reabsorption in the kidneys.',
    remains:'Kidney function had to be checked, and glucose still needed follow-up.',
    source:'FDA · Original Invokana label',
    url:'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2013/204042Orig1s000Lbl.pdf'
  },
  {
    id:'minimed-670g', label:'Automated basal dosing', year:2016, track:'delivery', event:'FDA approval',
    title:'Let a sensor guide background insulin', product:'MiniMed 670G',
    before:'Pump users set background insulin rates. Earlier systems could pause delivery when glucose fell.',
    change:'The 670G could automatically adjust background insulin every five minutes using sensor glucose. The U.S. launch followed in 2017.',
    remains:'Users still entered meal carbohydrates, gave mealtime doses and calibrated the sensor with a meter.',
    source:'FDA · MiniMed 670G approval and automated basal delivery',
    url:'https://www.accessdata.fda.gov/cdrh_docs/pdf16/P160017B.pdf'
  },
  {
    id:'dexcom-g6', label:'Connected sensors', year:2018, track:'monitoring', event:'FDA authorization',
    title:'Share sensor readings with other devices', product:'Dexcom G6',
    before:'Earlier sensors such as the Guardian RT needed regular fingerstick calibration.',
    change:'The factory-calibrated G6 could send readings to compatible equipment, including automated insulin dosing systems. Each sensor lasted up to ten days.',
    remains:'Users still replaced the sensor and checked with a meter if symptoms and readings disagreed.',
    source:'FDA · Dexcom G6 De Novo decision',
    url:'https://www.accessdata.fda.gov/cdrh_docs/pdf17/DEN170088.pdf'
  },
  {
    id:'rybelsus', label:'Oral GLP-1', year:2019, track:'medicine', event:'FDA approval',
    title:'Take a GLP-1 medicine as a tablet', product:'Rybelsus · oral semaglutide',
    before:'People using a GLP-1 medicine for type 2 diabetes gave themselves injections, including twice-daily Byetta and once-weekly Ozempic.',
    change:'Rybelsus gave adults with type 2 a way to take this class of medicine by mouth once a day.',
    remains:'The morning tablet needed an empty stomach and plain water, followed by at least 30 minutes before food, other drinks or oral medicines.',
    source:'FDA · Original Rybelsus label', url:fdaLabel+'2019/213051s000lbl.pdf'
  },
  {
    id:'mounjaro', label:'Dual-action injections', year:2022, track:'medicine', event:'FDA approval',
    title:'Target two gut hormone signals', product:'Mounjaro · tirzepatide',
    before:'Existing GLP-1 tablets and injections acted on one gut hormone receptor.',
    change:'One weekly injection activated both GIP and GLP-1 receptors, giving adults with type 2 another way to manage glucose.',
    remains:'Dose increases were gradual. Nausea and other digestive symptoms could affect continued use.',
    source:'FDA · Original Mounjaro label', url:fdaLabel+'2022/215866s000lbl.pdf'
  },
  {
    id:'stelo', label:'Over-the-counter sensors', year:2024, track:'monitoring', event:'FDA clearance',
    title:'Buy a glucose sensor without a prescription', product:'Stelo · over-the-counter glucose sensor',
    before:'Getting a personal continuous glucose monitor in the U.S. required a prescription.',
    change:'The FDA cleared Stelo for adults who did not use insulin in 2024. In 2026 clearance expanded to ages two and older, with adult supervision for children.',
    remains:'A compatible smartphone was needed. Stelo has no alert for dangerously low glucose.',
    source:'FDA · Stelo adult clearance and pediatric expansion',
    url:'https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor-children'
  },
  {
    id:'omnipod-type2', label:'Type 2 automation', year:2024, track:'delivery', event:'Expanded FDA indication',
    title:'Extend automated dosing to adults with type 2', product:'Omnipod 5 · SmartAdjust software',
    before:'Omnipod 5 had launched in U.S. pharmacies in 2022 for people with type 1 diabetes.',
    change:'The FDA expanded the software indication to adults with type 2. A compatible sensor and tubeless insulin pod could adjust delivery together.',
    remains:'The user still wore both devices, changed each pod after up to 72 hours and managed meal doses.',
    source:'FDA · SmartAdjust indication for adults with type 2',
    url:'https://www.fda.gov/news-events/press-announcements/fda-clears-first-device-enable-automated-insulin-dosing-individuals-type-2-diabetes'
  },
  {
    id:'minimed-780g', label:'780G for type 2', year:2025, track:'delivery', event:'Expanded FDA indication',
    title:'Extend automatic corrections to adults with type 2', product:'MiniMed 780G · automated insulin pump',
    before:'Adults with type 2 had gained Omnipod 5 in 2024 and Tandem Control-IQ+ in March 2025.',
    change:'In August, the FDA added adults with type 2 who needed insulin to the 780G indication. The pump could give a correction as often as every five minutes.',
    remains:'People still entered meal carbohydrates and started the mealtime dose themselves.',
    source:'FDA · MiniMed 780G indication for adults with type 2',
    url:'https://www.accessdata.fda.gov/cdrh_docs/pdf16/P160017S124A.pdf'
  },
  {
    id:'g7-15-day', label:'15-day G7', year:2025, track:'monitoring', event:'U.S. launch',
    title:'Wear a G7 sensor five days longer', product:'Dexcom G7 15 Day',
    before:'The original Dexcom G7 sensor lasted up to ten days. Abbott had already introduced its 15-day FreeStyle Libre 3 Plus in 2024.',
    change:'Cleared in April and launched in December, the longer-wear G7 gave adults with diabetes up to 15 days between routine sensor changes.',
    remains:'Users still replaced each sensor. Age limits depended on the model. G7 15 Day was cleared from age 18 and Libre 3 Plus from age two.',
    source:'Dexcom · U.S. launch of G7 15 Day',
    url:'https://investors.dexcom.com/news/news-details/2025/Dexcom-G7-15-Day-Continuous-Glucose-Monitoring-System-to-Launch-on-Dec--1-in-the-United-States/default.aspx'
  },
  {
    id:'awiqli', label:'Weekly basal insulin', year:2026, track:'medicine', event:'FDA approval',
    title:'Take background insulin once a week', product:'Awiqli · insulin icodec',
    before:'Someone prescribed a once-daily basal insulin scheduled seven background injections per week.',
    change:'Awiqli offered a once-weekly basal injection for adults with type 2. The FDA expanded approval to ages ten and older in October.',
    remains:'Glucose monitoring continued. People prescribed separate mealtime insulin still needed those doses.',
    source:'FDA · Awiqli, October 2026 prescribing information', url:fdaLabel+'2026/761326s001lbl.pdf'
  }
];

const supplementalSources = [
  ['FDA · Iletin distribution in the United States','https://www.fda.gov/about-fda/fda-history-exhibits/drug-therapeutics-regulation-us'],
  ['MedlinePlus · Tolbutamide and insulin release','https://medlineplus.gov/druginfo/meds/a682481.html'],
  ['Medical Devices: Evidence and Research · How early cartridge pens worked','https://pmc.ncbi.nlm.nih.gov/articles/PMC4708877/'],
  ['FDA · Glucophage mechanism, kidney function and mealtime use',fdaLabel+'2000/21202lbl.pdf'],
  ['FDA · Regular human insulin and timing before meals',fdaLabel+'2022/018780s180lbl.pdf'],
  ['FDA · Dates and dosing schedules of GLP-1 therapies, page 7','https://www.fda.gov/media/172331/download#page=7'],
  ['Medtronic · MiniMed 670G launch, June 2017','https://news.medtronic.com/2017-06-07-Medtronic-Initiates-U-S-Launch-of-Worlds-First-Hybrid-Closed-Loop-System-for-Type-1-Diabetes'],
  ['FDA · G6 wear, calibration and backup fingerstick testing','https://www.accessdata.fda.gov/cdrh_docs/reviews/K203089.pdf'],
  ['Insulet · Omnipod 5 U.S. pharmacy launch, 2022','https://investor.insulet.com/news/news-details/2022/Insulet-Announces-Full-Market-Release-of-Omnipod-5-Automated-Insulin-Delivery-System/default.aspx'],
  ['American Diabetes Association · Omnipod 5, pod wear and mealtime doses','https://consumerguide.diabetes.org/products/insulin-pumps/omnipod-5'],
  ['Tandem · U.S. Control-IQ+ launch for adults with type 2','https://tandemdiabetes.gcs-web.com/news-releases/news-release-details/tandem-diabetes-care-launches-new-control-iq-automated-insulin/'],
  ['Medtronic · MiniMed 780G automatic corrections and mealtime doses','https://www.medtronicdiabetes.com/sites/default/files/library/download-library/user-guides/MiniMed-780G-system-user-guide.pdf'],
  ['FDA · G7 15 Day clearance, age indication and wear time','https://www.accessdata.fda.gov/cdrh_docs/reviews/K243214.pdf'],
  ['Dexcom · 2025 annual report, G7 wear times and U.S. launch','https://s201.q4cdn.com/758408164/files/doc_financials/2025/ar/dexcom-2025-annual-report.pdf'],
  ['Abbott · 2024 annual report, Libre 3 Plus introduction and age indication','https://www.sec.gov/Archives/edgar/data/1800/000130817925000136/abt012575-ars.pdf'],
  ['FDA · March 2026 approval of weekly basal insulin for adults','https://www.accessdata.fda.gov/drugsatfda_docs/nda/2026/761326Orig2s000Approv.pdf']
];

export const treatmentMilestoneSources = [...new Map([
  ...treatmentMilestones.map(({source,url}) => [source,url]),
  ...supplementalSources
].map(entry => [entry[1],entry])).values()];
