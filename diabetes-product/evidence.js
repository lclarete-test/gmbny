// Values and periods are transcribed from the linked study tables.
export const links = {
  cdc: 'https://usdss.cdc.gov/diabetes/data/statsreport/National_Diabetes_Statsitics_Report.pdf',
  bmi: 'https://www.cdc.gov/nchs/products/databriefs/db516.htm',
  states: 'https://data.cdc.gov/d/b559-sbez',
  nhis: 'https://www.cdc.gov/nchs/nhis/documentation/2025-nhis.html',
  adult23: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Datasets/NHIS/2023/adult23csv.zip',
  nhisBook: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Dataset_Documentation/NHIS/2023/adult-codebook.pdf',
  ed: 'https://www.cdc.gov/nchs/data/databriefs/db487-tables.pdf#page=4',
  control: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8385648/',
  preventive: 'https://www.ncbi.nlm.nih.gov/books/NBK607283/table/medicationuse.T.prevalence_of_selfreport/?report=objectonly',
  costs: 'https://diabetesjournals.org/care/article/47/1/26/153797/Economic-Costs-of-Diabetes-in-the-U-S-in-2022',
  meps: 'https://meps.ahrq.gov/mepsweb/data_files/publications/st568/stat568.shtml',
  caregivers: 'https://www.caregiving.org/wp-content/uploads/2020/05/NAC_Diabetes-Caregivers-Needs-Assessment-Survey_Executive-Summary-3-25-10_Final.pdf',
  families: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3328639/',
  sleep: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7650845/',
  campaign: 'https://www.cdc.gov/diabetes/media/pdfs/2026/09/FINAL-DBC-10-Year-Campaign-One-Pager-for-CDC-Updated-August-2026-CLEARED.pdf',
  campaign21: 'https://archive.cdc.gov/www_cdc_gov/media/releases/2021/p1104-diabetes-type-2.html',
  campaign23: 'https://www.cdc.gov/media/releases/2023/p1114-adult-diabetes.html',
  campaign25: 'https://www.cdc.gov/nccdphp/divisions-offices/about-the-division-of-diabetes-translation.html',
  dex22: 'https://www.sec.gov/Archives/edgar/data/1093557/000109355723000024/dxcm-20221231.htm',
  dex25: 'https://www.sec.gov/Archives/edgar/data/1093557/000109355726000027/dxcm-20251231.htm',
  omni22: 'https://www.sec.gov/Archives/edgar/data/1145197/000114519723000020/podd-20221231.htm',
  omni24: 'https://www.sec.gov/Archives/edgar/data/1145197/000114519725000007/podd-20241231.htm',
  omni25: 'https://www.sec.gov/Archives/edgar/data/1145197/000114519726000028/podd-20251231.htm'
};
export const histories = {
  diabetes: {
    title:'Diabetes prevalence over two decades', unit:'Adults 18+ · age-adjusted %', format:'percent',
    labels:['2001–04','2003–06','2005–08','2007–10','2009–12','2011–14','2013–16','2015–18','2017–Mar 2020','Aug 2021–Aug 2023'],
    x:[2002.5,2004.5,2006.5,2008.5,2010.5,2012.5,2014.5,2016.5,2018.6,2022.6],
    series:[['All diabetes',[11.2,11.2,11.8,12.3,12.1,12.4,13.5,14.1,14.1,13.5]],['Diagnosed',[7.1,7.4,7.6,7.9,8.1,8.7,9.4,9.8,10.1,9.8]],['Undiagnosed',[4.1,3.8,4.2,4.4,4.0,3.7,4.1,4.3,4.0,3.7]]],
    note:'Diagnosed diabetes rose from 7.1% to 9.8%. CDC found no significant long-term change in undiagnosed diabetes.', source:links.cdc
  },
  pre: {
    title:'Prediabetes prevalence and awareness', unit:'U.S. adults 18+ · age-adjusted %', format:'percent',
    labels:['2005–08','2007–10','2009–12','2011–14','2013–16','2015–18','2017–Mar 2020','Aug 2021–Aug 2023'],
    x:[2006.5,2008.5,2010.5,2012.5,2014.5,2016.5,2018.6,2022.6],
    series:[['Had prediabetes · all adults',[44.4,45.9,44.0,42.3,43.8,49.0,49.4,42.6]],['Knew they had it · affected adults',[5.6,7.4,8.6,8.9,11.1,13.3,15.4,19.8]]],
    note:'Awareness increased over the study period. CDC found no significant overall trend in prevalence.',source:links.cdc
  },
  emergency:{
    title:'Emergency visits by adults with diabetes', unit:'Visits per 1,000 residents in each age group',format:'rate',
    labels:[2012,2013,2014,2015,2016,2017,2018,2019,2020,2021],
    series:[['18–44',[20.9,19.9,24.0,25.2,26.4,28.5,25.4,27.1,25.7,26.2]],['45–64',[53.1,61.6,65.5,68.6,84.8,80.7,82.4,91.7,81.4,89.2]],['65+',[113.4,106.8,126.0,134.6,132.9,130.1,130.9,151.9,144.1,156.8]],['All adults',[48.6,50.2,57.4,61.0,67.2,66.6,66.1,74.7,69.4,74.9]]],
    note:'In 2021, the visit rate for adults 65 and older was about six times the rate for 18–44-year-olds.', source:links.ed
  },
  control:{
    title:'Diabetes, blood pressure and cholesterol control', unit:'Adults with diagnosed diabetes meeting study thresholds · %',format:'percent',
    labels:['1999–2002','2003–06','2007–10','2011–14','2015–18'],
    series:[['A1C below 7%',[44.0,56.7,57.4,51.8,50.5]],['BP below 140/90',[64.0,68.4,72.1,74.2,70.4]],['Non-HDL below 130 mg/dL',[25.3,42.9,52.3,53.4,55.7]],['Met all three',[9.0,17.5,24.9,23.7,22.2]]],
    note:'In 2015–18, half met the A1C benchmark and 22.2% met all three benchmarks.',source:links.control
  },
  cost:{
    title:'Direct medical costs attributable to diabetes',unit:'U.S. billions of constant 2022 dollars',format:'billions',digits:1,
    labels:[2007,2012,2017,2022],series:[['Direct medical costs',[165.4,227.0,287.0,306.6]]],
    note:'After inflation, annual medical costs rose by $141.2 billion between 2007 and 2022.',source:links.costs
  },
  devices:{
    title:'U.S. device revenue at two manufacturers',unit:'U.S. net sales · billions of dollars',format:'billions',digits:2,
    labels:[2020,2021,2022,2023,2024,2025],
    series:[['Dexcom',[1.5095,1.8494,2.1420,2.6253,2.8898,3.3349]],['Insulet Omnipod',[0.5269,0.6515,0.8848,1.2510,1.5093,1.9198]]],
    note:'U.S. sales more than doubled at Dexcom and more than tripled for Omnipod between 2020 and 2025.',source:links.dex25
  }
};
export const preProfile = [
  ['Age',[['18–44',36.1,43.6,15.1],['45–64',48.6,40.3,24.5],['65+',52.1,31.3,26.3]]],
  ['Sex',[['Men',47.9,62,18.1],['Women',39.3,53.2,25.2]]],
  ['Race and ethnicity',[['Non-Hispanic White',43.7,70.7,21.5],['Non-Hispanic Black',39.7,12.8,21.5],['Non-Hispanic Asian',41.2,7.4,29.6],['Hispanic',48.0,21.9,18.4]]]
];
export const complications = [
  ['Major cardiovascular disease',1677,1780],['Ischemic heart disease',368,385],['Stroke',321,337],
  ['Lower-extremity amputation',160,166],['Hyperglycemic crisis',232,230],['Diabetic ketoacidosis',206,207],
  ['Hyperosmolar hyperglycemic state',26,23],['Hypoglycemia',51,52]
];
export const milestones = [
  ['1982','Humulin','FDA approval','Recombinant DNA made it possible to manufacture human insulin at scale.','https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin'],
  ['1996','Humalog','FDA approval','A rapid-acting insulin analogue added a mealtime option.','https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin'],
  ['Jun 2017','MiniMed 670G','U.S. launch','Sensor readings began adjusting background insulin automatically in a commercial hybrid closed-loop system.','https://news.medtronic.com/2017-06-07-Medtronic-Initiates-U-S-Launch-of-Worlds-First-Hybrid-Closed-Loop-System-for-Type-1-Diabetes'],
  ['2018','Dexcom G6','FDA authorization','A factory-calibrated sensor could securely exchange glucose readings with compatible devices.','https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/denovo.cfm?ID=DEN170088'],
  ['2019','Rybelsus','FDA approval','Oral semaglutide brought GLP-1 therapy for type 2 diabetes into tablet form.','https://www.accessdata.fda.gov/drugsatfda_docs/nda/2020/213182Orig1s000StatR.pdf'],
  ['2022','Mounjaro','FDA approval','Tirzepatide acts on both GIP and GLP-1 receptors in adults with type 2 diabetes.','https://www.accessdata.fda.gov/drugsatfda_docs/nda/2022/215866Orig1s000lbl.pdf'],
  ['Aug 2022','Omnipod 5','U.S. pharmacy launch','A tubeless automated insulin delivery system reached retail pharmacies nationwide.','https://investor.insulet.com/news/news-details/2022/Insulet-Announces-Full-Market-Release-of-Omnipod-5-Automated-Insulin-Delivery-System/default.aspx'],
  ['Aug 2024','Stelo','U.S. launch','Adults who do not use insulin could buy a glucose sensor without a prescription.','https://investors.dexcom.com/news/news-details/2024/Stelo-by-Dexcom-the-First-Over-the-Counter-Glucose-Biosensor-in-the-U.S.-Is-Now-Available/'],
  ['Aug 2024','Omnipod 5','Expanded indication','Automated insulin dosing became an option for eligible adults with type 2 diabetes.','https://www.fda.gov/news-events/press-announcements/fda-clears-first-device-enable-automated-insulin-dosing-individuals-type-2-diabetes']
];
