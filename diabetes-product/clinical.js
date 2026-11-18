import {atlasFigure,anatomicalSources,anatomicalNote} from './atlas-figures.js';
import {barList, dataTable, lineChart, sourcesFooter} from './charts.js';
import {card, heading, pair} from './epidemiology.js';
import {links} from './evidence.js';

const physiologySources=[
  ['NIDDK · Diabetes tests and diagnosis','https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis'],
  ['NIDDK · Insulin resistance and prediabetes','https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance'],
  ['NIDDK · Type 1 diabetes','https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes'],
  ['CDC · Gestational diabetes','https://www.cdc.gov/diabetes/about/gestational-diabetes.html'],
  ['CDC · Symptoms','https://www.cdc.gov/diabetes/signs-symptoms/'],
  ['Diabetes Prevention Program Research Group · U.S. randomized trial','https://doi.org/10.1056/NEJMoa012512'],
  ['Pancreatic islet micrograph · Anne Clark, University of Oxford, Wellcome Collection','https://wellcomecollection.org/works/unaeb288'],
  ['Micrograph license · CC BY 4.0','https://creativecommons.org/licenses/by/4.0/']
];
const atlas='https://data.cdc.gov/d/73uh-igb7';
const kidney='https://www.cdc.gov/kidney-disease/media/pdfs/CKD-Factsheet-H.pdf';
const retina='https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2806093';
export const amputationHistory={
  title:'Hospital stays involving a lower-limb amputation', unit:'U.S. stays per 1,000 adults with diagnosed diabetes · all types',format:'rate',digits:2,
  labels:[2016,2017,2018,2019,2020,2021,2022,2023],series:[['Stays per 1,000',[5.64,6.16,6.11,6.91,6.81,6.81,7.08,7.30]]],source:atlas,
  note:'U.S. hospitals recorded 130,000 such discharges in 2016 and 184,000 in 2023. One person can have several stays.'
};
export const crisisHistory={
  title:'Emergency care for severe hyperglycemia by diabetes type',unit:'Events per 1,000 person-years · U.S. commercial and Medicare Advantage cohort',format:'rate',digits:2,
  labels:[2014,2015,2016,2017,2018,2019,2020],series:[['Type 1',[43.30,49.07,49.80,53.92,56.77,61.36,46.27]],['Type 2',[4.27,3.77,3.81,3.95,4.02,4.29,4.12]]],
  source:'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2783670'
};
export function introduction(){
  return heading('Diabetes in the United States')+
    `<article class="panel impact-lead"><p>Diabetes is a group of diseases in which blood glucose stays too high. A diagnosis can change how someone eats, works and pays for care, often years before a complication brings them to a hospital.</p>
    <div class="impact-numbers"><section><b>40.1M</b><span>people living with diabetes in 2023</span></section><section><b>11.0M</b><span>adults with diabetes who had yet to receive a diagnosis in 2023</span></section><section><b>$412.9B</b><span>annual U.S. cost of diagnosed diabetes in 2022</span></section></div></article>`+
    card('Why detection matters',`<p>Type 2 diabetes can develop with few noticeable symptoms. When elevated glucose is found earlier, people can address their risk before damage to the eyes, kidneys, nerves or cardiovascular system becomes apparent. Prediabetes is an earlier range of blood glucose and can improve or progress over time.</p>
      <div class="reading-links"><a href="#biology">How diabetes changes the body →</a><a href="#epidemiology">Who has diabetes →</a><a href="#clinical">Conditions and complications →</a></div>`)+
    sourcesFooter([['CDC · National Diabetes Statistics Report',links.cdc],['ADA · Economic costs of diagnosed diabetes',links.costs],['NIDDK · Insulin resistance and prediabetes',physiologySources[1][1]]],['The 40.1 million estimate covers people of all ages with diagnosed or undiagnosed diabetes. The 11.0 million estimate covers adults 18 and older. The cost estimate is for diagnosed diabetes in a different year.']);
}
export function biology(){
  return heading('Diabetes biology')+atlasFigure('biology')+
    `<section class="atlas-reading figure-reading"><img class="micro-islet" src="media/pancreatic-islet.jpg" width="760" height="424" alt="Human pancreatic islet with insulin in beta cells stained red"><div><h2>Why several organs can be affected</h2><p>Red staining in the pancreatic islet shows where beta cells store insulin. When blood glucose stays high, small vessels in the eyes and kidneys and nerves in the feet can all sustain damage. High blood pressure and high cholesterol also raise cardiovascular risk.</p><a href="#clinical">See how often these conditions occur →</a></div></section>`+
    card('How the conditions differ',`<div class="science-grid">${[
      ['Type 1 diabetes','Autoimmune loss of beta cells leaves too little insulin. Symptoms can develop quickly when insulin production falls. People with type 1 need an external source of insulin.'],
      ['Type 2 diabetes','Insulin resistance raises the demand on beta cells. At first the pancreas may produce more insulin, but over time secretion may become insufficient. Symptoms can be subtle for years.'],
      ['Prediabetes','Blood glucose is elevated and remains below the diabetes threshold. It signals higher risk for type 2. Laboratory tests can detect it before someone notices symptoms.'],
      ['Gestational diabetes','Pregnancy increases insulin resistance. When insulin production cannot meet that demand, glucose rises. Glucose may return to its usual range after delivery, while future type 2 risk remains higher.']
    ].map(([n,t])=>`<section><h3>${n}</h3><p>${t}</p></section>`).join('')}</div>`)+
    card('How laboratory results are classified',`<p class="axis-unit">Nonpregnant people · laboratory diagnostic ranges</p>${dataTable(['Test','Below prediabetes range','Prediabetes','Diabetes'],[['A1C','Below 5.7%','5.7–6.4%','6.5% or higher'],['Fasting plasma glucose','99 mg/dL or lower','100–125 mg/dL','126 mg/dL or higher'],['2-hour plasma glucose¹','139 mg/dL or lower','140–199 mg/dL','200 mg/dL or higher']])}<p class="reading">A1C reflects average blood glucose over about three months. A fasting sample measures one moment. A glucose tolerance test measures how the body handles a glucose load. Symptoms such as thirst and frequent urination can prompt testing.</p>`)+
    card('What changed progression in a prevention trial?',`<p class="axis-unit">New type 2 cases per 100 person-years · U.S. Diabetes Prevention Program</p>${barList([['Placebo',11.0],['Metformin',7.8],['Intensive lifestyle program',4.8]],{max:12,format:v=>v.toFixed(1),color:'#5546ad'})}<p class="reading">The trial followed 3,234 high-risk adults for an average of 2.8 years. The lifestyle program included coaching on diet, physical activity and weight loss.</p>`)+
    sourcesFooter([...physiologySources, ...anatomicalSources, ['NIH Bookshelf · The endocrine pancreas','https://www.ncbi.nlm.nih.gov/books/NBK30/'], ['NIDDK · Diabetes, heart disease and stroke','https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/heart-disease-stroke'],['CDC · Effects on the body','https://www.cdc.gov/diabetes/communication-resources/how-diabetes-can-affect-your-body.html']],[anatomicalNote,'¹Two hours after a 75-gram glucose load. A second abnormal result usually confirms diagnosis in the absence of unequivocal hyperglycemia. Glucose measurements establish glycemic status. Medical history, islet autoantibodies and other testing can help determine diabetes type. Pregnancy uses separate testing protocols.','Photomicrograph: Beta cells secreting insulin in human pancreas, Anne Clark, University of Oxford, via Wellcome Collection. CC BY 4.0.']);
}
export function clinicalProfile(nhis){
  const survey=nhis.clinical.map(([name,all,t1,t2,pre,base])=>[name,all,t1,t2,pre,base]);
  return heading('Clinical profile')+
    atlasFigure('clinical')+
    card('Reported diagnoses by diabetes status',`<p class="axis-unit">U.S. adults ever told they had each condition · NHIS 2025 · % within each column</p>${dataTable(['Condition','All diagnosed diabetes','Type 1','Type 2','Prediabetes only','No diabetes or prediabetes reported¹'],survey.map(([k,...v])=>[k,...v.map(p=>p==null?'—':p.toFixed(1)+'%')]))}`)+
    pair(card('Kidney disease by diabetes type',`<p class="axis-unit">CKD stages 1–4 · U.S. adults 18+ · 2021–23</p>${barList([['Type 1 diabetes',49],['Type 2 diabetes',41],['Prediabetes',11]],{max:55,color:'#4b59ab'})}<p class="reading">Among adults with diagnosed diabetes and stage 3 or 4 kidney disease, 33.8% knew they had kidney disease.</p>`),
    card('Retinal damage and vision loss',`<p class="axis-unit">U.S. people with diabetes, all ages · 2021 estimates</p>${barList([['Any diabetic retinopathy',26.43],['Vision-threatening retinopathy',5.06]],{max:32,color:'#905482'})}<p class="reading">Vision-threatening disease is a subset of retinopathy. In a separate 2023 adult survey, 12.3% reported blindness or serious difficulty seeing even with glasses, from any cause.</p>`))+
    lineChart(amputationHistory)+lineChart(crisisHistory)+
    sourcesFooter([...anatomicalSources,['CDC · National Diabetes Statistics Report',links.cdc],['NHIS · 2025 Sample Adult data',links.nhis],['CDC · Chronic Kidney Disease in the United States',kidney],['U.S. prevalence of diabetic retinopathy in 2021',retina],['CDC · National diabetes surveillance data',atlas],['CDC · National surveillance methods','https://usdss.cdc.gov/diabetes/data/socrata/National_Other_methods.html'],['Hyperglycemic crises · adjusted cohort rates, eTable 4',crisisHistory.source]],[anatomicalNote,
      'The conditions can overlap. The examination estimates are crude and use adults with diagnosed diabetes, August 2021–August 2023. The blood pressure definition is at least 130/80 mmHg or blood pressure medication. Stages 1–4 of kidney disease use laboratory markers. Stage 5 is excluded.',
      '¹The reference group reported no diagnosis of either diabetes or prediabetes. The NHIS table uses annual Sample Adult weights and valid responses to each condition. The groups differ in age. The comparisons are descriptive. A dash marks cells with fewer than ten events or nonevents, or fewer than 30 valid responses.',
      'The CDC kidney comparison defines prediabetes using laboratory values and infers diabetes type from timing of insulin use. The body map and the by-type estimates identify their respective populations. The stroke figure on the map is the weighted 2025 NHIS estimate in the table. Vision-threatening retinopathy is a clinical category. Blindness alone cannot be identified from the combined survey question.',
      'Amputations use inpatient discharges and crude annual rates per 1,000 adults with diagnosed diabetes. The series starts after the 2015 coding change. Severe hyperglycemia rates use adjusted ED or hospital events in an insured cohort of 20,156 adults with type 1 and 796,382 with type 2; these rates are not national incidence.'
    ]);
}
