import {anatomicalSources,atlasFigure} from './atlas-figures.js';
import {barList,dataTable,lineChart,sourcesFooter} from './charts.js';
import {wholeBodyFigure} from './clinical-figure.js';
import {heading,pair} from './epidemiology.js';
import {links} from './evidence.js';

const publications = {
  ada:['American Diabetes Association · Diagnosis and classification · Diabetes Care, 2026','https://doi.org/10.2337/dc26-S002'],
  insulin:['Petersen and Shulman · How insulin acts in muscle, liver and fat · Physiological Reviews, 2018','https://doi.org/10.1152/physrev.00063.2017'],
  tracer:['Meyer and colleagues · Glucose uptake and release after a glucose drink · American Journal of Physiology, 2002','https://pubmed.ncbi.nlm.nih.gov/11788375/'],
  type1:['DiMeglio, Evans-Molina and Oram · Type 1 diabetes · The Lancet, 2018','https://doi.org/10.1016/S0140-6736(18)31320-5'],
  gestational:['Vounzoulaki and colleagues · Type 2 diabetes after gestational diabetes · BMJ, 2020','https://doi.org/10.1136/bmj.m1361'],
  organs:['Forbes and Cooper · Mechanisms of diabetic complications · Physiological Reviews, 2013','https://doi.org/10.1152/physrev.00045.2011'],
  dpp:['Diabetes Prevention Program Research Group · Type 2 diabetes prevention trial · New England Journal of Medicine, 2002','https://doi.org/10.1056/NEJMoa012512'],
  dcct:['Diabetes Control and Complications Trial Research Group · Type 1 diabetes and long-term complications · New England Journal of Medicine, 1993','https://doi.org/10.1056/NEJM199309303291401'],
  exams:['NIDDK · Laboratory tests and diagnosis','https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis'],
  tissue:['Anne Clark, University of Oxford · Insulin-producing cells in a human pancreas · Wellcome Collection','https://wellcomecollection.org/works/unaeb288'],
  license:['Wellcome micrograph license · Creative Commons Attribution 4.0','https://creativecommons.org/licenses/by/4.0/'],
  cost:['Parker and colleagues · Economic costs of diagnosed diabetes in the United States · Diabetes Care, 2024',links.costs],
  cdc:['CDC · National Diabetes Statistics Report',links.cdc]
};

const surveillance='https://data.cdc.gov/d/73uh-igb7';
const kidney='https://www.cdc.gov/kidney-disease/media/pdfs/CKD-Factsheet-H.pdf';
const retina='https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2806093';

export const amputationHistory={
  title:'Hospital stays involving a lower-limb amputation',unit:'U.S. stays per 1,000 adults with diagnosed diabetes · all types',format:'rate',digits:2,
  labels:[2016,2017,2018,2019,2020,2021,2022,2023],series:[['Stays per 1,000',[5.64,6.16,6.11,6.91,6.81,6.81,7.08,7.30]]],source:surveillance,
  note:'U.S. hospitals recorded 130,000 such discharges in 2016 and 184,000 in 2023. One person can have several stays.'
};
export const crisisHistory={
  title:'Emergency care for severe hyperglycemia by diabetes type',unit:'Events per 1,000 person-years · U.S. commercial and Medicare Advantage cohort',format:'rate',digits:2,
  labels:[2014,2015,2016,2017,2018,2019,2020],series:[['Type 1',[43.30,49.07,49.80,53.92,56.77,61.36,46.27]],['Type 2',[4.27,3.77,3.81,3.95,4.02,4.29,4.12]]],
  source:'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2783670',
  note:'Severe insulin deficiency can lead to a buildup of acidic ketones. Very high glucose can also cause profound dehydration. The rates count emergency visits and hospital stays for these acute crises.'
};

export function introduction(){
  return heading('Diabetes in the United States')+
    `<section class="panel cs-introduction">
      <div class="cs-intro-copy"><p class="cs-definition">Glucose fuels the body’s cells. In diabetes, it builds up in the blood because the pancreas makes too little insulin, tissues respond less to insulin, or both.</p>
        <p>Blood glucose normally rises after eating and then falls. When that response falls short, glucose can remain high between meals and overnight. Type 2 diabetes can develop quietly for years. Thirst, frequent urination and unexplained weight loss can appear when glucose rises further.</p>
      </div>
      <figure class="cs-tissue"><img src="media/pancreatic-islet.jpg" width="760" height="424" alt="Microscope image of a human pancreatic islet with red staining in the insulin-producing beta cells."><figcaption>Red staining reveals insulin in the beta cells of a human pancreas.</figcaption></figure>
    </section>
    <section class="panel cs-impact" aria-label="U.S. diabetes burden">
      <div><strong>40.1 million</strong><p>people of all ages lived with diabetes in the U.S. in 2023.</p></div>
      <div><strong>27.6%</strong><p>of U.S. adults with diabetes had yet to receive a diagnosis in 2023. That represents 11.0 million adults.</p></div>
      <div><strong>$412.9 billion</strong><p>in U.S. medical costs and lost productivity attributable to diagnosed diabetes in 2022.</p></div>
    </section>
    ${glucoseRegulation()}
    <section class="panel cs-differences"><h2>What the different diagnoses mean</h2>
      <dl><div><dt>Type 1 diabetes</dt><dd>The immune system destroys insulin-producing beta cells. It can begin at any age. As insulin production falls, people need insulin from outside the body to survive.</dd></div>
        <div><dt>Type 2 diabetes</dt><dd>Muscle, fat and liver often respond less to insulin. The pancreas may make more for a time. Glucose rises as insulin production falls short of what the body needs.</dd></div>
        <div><dt>Prediabetes</dt><dd>Blood tests show glucose above the usual range and below the diabetes threshold. People in this range have an elevated risk of type 2 diabetes, and some return to a lower glucose range.</dd></div>
        <div><dt>Gestational diabetes</dt><dd>As pregnancy advances, the body needs more insulin. Some people cannot make enough and develop diabetes, usually identified in the second or third trimester. Glucose often improves after birth. The risk of later type 2 is higher than after a pregnancy without gestational diabetes.</dd></div>
      </dl>
    </section>
    ${labThresholds()}
    <section class="panel cs-trials"><h2>How prevention and treatment can change outcomes</h2>
      <div class="cs-trial-pair"><section><h3>Preventing type 2 diabetes</h3><p>The Diabetes Prevention Program followed 3,234 adults with elevated fasting glucose and an abnormal response to a glucose drink for an average of 2.8 years. The group that received coaching on eating, activity and weight had the lowest rate of new diagnoses.</p>
        <p class="cs-unit">New type 2 diagnoses per 100 person-years</p>${barList([['Placebo',11.0],['Metformin',7.8],['Lifestyle program',4.8]],{max:12,format:v=>v.toFixed(1),color:'#5147a8'})}</section>
        <section><h3>Protecting sight in type 1 diabetes</h3><p>The Diabetes Control and Complications Trial followed 1,441 people with type 1 diabetes for an average of 6.5 years. Among the 726 who began without retinal disease, intensive insulin therapy lowered the risk of developing it.</p>
        <div class="cs-trial-result"><strong>76%</strong><span>lower relative risk of developing diabetic retinopathy with intensive therapy compared with conventional therapy.</span></div></section></div>
    </section>
    <nav class="cs-next" aria-label="Continue reading"><a href="#epidemiology">Explore U.S. epidemiology →</a><a href="#comorbidities">Comorbidities and complications →</a></nav>`+
    sourcesFooter([publications.ada,publications.insulin,publications.type1,publications.gestational,publications.cdc,publications.cost,publications.tracer,publications.exams,publications.dpp,publications.dcct,publications.tissue,publications.license,...anatomicalSources],[
      'CDC projects diabetes counts to the 2023 U.S. population. The undiagnosed share uses adults with diabetes as its denominator. The 2022 cost study includes $306.6 billion in direct medical costs and $106.3 billion in lost productivity.',
      'The conditions shown are the main categories used in this dashboard. Other forms include diabetes caused by specific genetic variants, pancreatic disease or certain drugs. Prediabetes uses laboratory ranges associated with elevated risk. Undiagnosed diabetes describes whether diabetes has been recognized and can occur across types.',
      'The prevention trial compared randomly assigned groups at elevated risk of type 2 diabetes. Person-years combine the follow-up time of participants in each group. In the type 1 trial, the 76% estimate is an adjusted relative risk reduction in the primary prevention cohort (95% confidence interval, 62% to 85%). Intensive therapy also increased severe hypoglycemia.',
      'Meyer and colleagues used glucose tracers and measurements of blood entering and leaving tissues in 10 volunteers. Over 4.5 hours after 75 g of oral glucose, estimated skeletal muscle uptake averaged 19 g (standard error 3 g), and estimated liver glucose output fell 82% (standard error 6 percentage points) from fasting. These are group means from a controlled physiology study.',
      'The laboratory ranges are for people who are not pregnant. Classic symptoms or a hyperglycemic crisis with random plasma glucose of at least 200 mg/dL can also establish diabetes. Pregnancy uses its own testing protocols. Autoantibodies and other clinical information can help identify the type.',
      'Micrograph by Anne Clark, University of Oxford, from Wellcome Collection. Creative Commons Attribution 4.0.'
    ]);
}

function glucoseRegulation(){
  return `<section class="panel cs-regulation" aria-labelledby="cs-regulation-heading">
    <h2 id="cs-regulation-heading">Why glucose can rise before breakfast</h2>
    <p class="cs-reg-lead">Even after a night without food, the liver supplies glucose to the blood. Blood glucose rises whenever it enters the bloodstream faster than tissues can use or store it.</p>
    <div class="cs-reg-grid">
      <dl class="cs-glucose-cycle">
        <div><dt>Between meals</dt><dd>As insulin levels fall, another pancreatic hormone, glucagon, signals the liver to release glucose. This keeps fuel available for the brain and other tissues.</dd></div>
        <div><dt>After eating</dt><dd>Glucose absorbed from food prompts the pancreas to release insulin. Muscle takes up more glucose, and the liver slows its own glucose production.</dd></div>
      </dl>
      <figure class="cs-tracer">
        <figcaption>What changed after a glucose drink?</figcaption>
        <p>Researchers traced a 75 g dose of glucose for 4.5 hours in 10 adults without diabetes.</p>
        <dl><div><dt>Glucose taken up by skeletal muscle</dt><dd>19 g</dd></div>
          <div><dt>Fall in the liver’s glucose output from its fasting level</dt><dd>82%</dd></div></dl>
      </figure>
    </div>
    ${atlasFigure('biology')}
  </section>`;
}

function labThresholds(){
  return `<section class="panel cs-labs"><h2>What a blood test can show</h2>
    <p>A fasting glucose test captures one moment. A1C reflects average glucose over about three months. A glucose tolerance test measures the response to a measured glucose drink.</p>
    ${dataTable(['Laboratory test','Below prediabetes range','Prediabetes range','Diabetes range'],[
      ['A1C','Below 5.7%','5.7% to 6.4%','6.5% or above'],
      ['Fasting plasma glucose','Below 100 mg/dL','100 to 125 mg/dL','126 mg/dL or above'],
      ['Plasma glucose 2 hours after a 75 g glucose drink','Below 140 mg/dL','140 to 199 mg/dL','200 mg/dL or above']
    ],'Laboratory ranges for people who are not pregnant')}
    <p class="reading">These ranges apply outside pregnancy. Without clear symptoms or a hyperglycemic crisis, clinicians generally confirm a diabetes diagnosis with a second abnormal result. The cause of diabetes may require additional tests.</p>
    </section>`;
}

function diagnosedConditions(nhis) {
  if(!nhis?.clinical?.length)return '';
  const labels=['All diagnosed diabetes','Type 1','Type 2','Prediabetes only','No reported diabetes or prediabetes'];
  const groups=labels.map((name,i)=>`<span class="cm-group">${name}</span>`).join('');
  const rows=nhis.clinical.map(([condition,...values])=>`<div class="cm-row"><strong>${condition}</strong>${values.map((v,i)=>`<div class="cm-cell"><span class="cm-mobile">${labels[i]}</span><b>${v==null?'—':v.toFixed(1)+'%'}</b><i aria-hidden="true" style="--share:${v??0}%"></i></div>`).join('')}</div>`).join('');
  return `<article class="panel" id="clinical-findings"><h2>Which conditions are most common?</h2><p class="reading">Among U.S. adults with diagnosed diabetes, 72.6% reported high blood pressure and 64.6% reported high cholesterol. A person can have both.</p><p class="axis-unit">2025 · percentage within each group reporting a prior diagnosis · bars run from 0 to 100%</p><div class="cm-grid"><div class="cm-row cm-head"><span>Condition</span>${groups}</div>${rows}</div></article>`;
}

export function clinicalProfile(nhis){
  const kidneys=`<article class="panel cs-organ"><h2>Kidney disease across glucose groups</h2><p class="axis-unit">U.S. adults aged 18+ · 2021–23 · share of each group with stage 1 to 4 chronic kidney disease</p>${barList([['Type 1 diabetes',49],['Type 2 diabetes',41],['Prediabetes',11]],{max:55,format:v=>v+'%',color:'#4f59a3',context:'U.S. adults aged 18+ in this glucose group with stage 1 to 4 chronic kidney disease, 2021–23'})}
    <p class="reading">Among adults with diagnosed diabetes and stage 3 or 4 kidney disease, only 33.8% knew they had kidney disease.</p></article>`;
  const eyes=`<article class="panel cs-organ"><h2>When retinal damage threatens sight</h2><div class="cs-trial-result"><strong>1.84 million</strong><span>U.S. people had vision-threatening diabetic retinopathy in 2021. That was 5.06% of everyone with diabetes.</span></div>
    <p class="reading">Severe sight loss can have other causes, too. In 2023, 12.3% of U.S. adults with diagnosed diabetes reported blindness or serious difficulty seeing even with glasses.</p></article>`;
  return heading('Comorbidities and complications')+diagnosedConditions(nhis)+
    `<section class="panel cs-body"><h2>How diabetes affects the organs</h2>
      <p class="cs-organ-lead">Over years, elevated glucose can injure small blood vessels and nerves. The purple labels identify organs that regulate glucose. The red labels show how often selected conditions or hospital events occur in people with diabetes.</p>
      <div class="cs-anatomy-layout">${wholeBodyFigure()}
      <div class="cs-body-context"><section><h3>Eyes and kidneys</h3><p>Damaged blood vessels in the retina can leak and threaten sight. Damaged kidney filters can let a protein called albumin pass into the urine.</p></section>
      <section><h3>Feet</h3><p>Loss of sensation can leave a foot wound unnoticed. Poor circulation can slow healing and increase the risk of amputation.</p></section>
      <section><h3>Heart and blood vessels</h3><p>Blood pressure and cholesterol also affect cardiovascular risk. In 2021–23, 38.0% of U.S. adults with diagnosed diabetes had elevated non-HDL cholesterol.</p></section></div></div>
    </section>`+
    pair(kidneys,eyes)+
    lineChart(amputationHistory)+lineChart(crisisHistory)+
    sourcesFooter([publications.ada,publications.organs,
      ['American Diabetes Association · Retinopathy, neuropathy and foot care · Diabetes Care, 2026','https://doi.org/10.2337/dc26-S012'],
      ['American Diabetes Association · Chronic kidney disease · Diabetes Care, 2026','https://doi.org/10.2337/dc26-S011'],
      ['Umpierrez and colleagues · Hyperglycemic crises in adults with diabetes · Diabetes Care, 2024','https://doi.org/10.2337/dci24-0032'],
      publications.cdc,
      ['NCHS · National Health Interview Survey, 2025 Sample Adult file',links.nhis],
      ['CDC · Chronic Kidney Disease in the United States, 2026',kidney],
      ['Lundeen and colleagues · Prevalence of diabetic retinopathy · JAMA Ophthalmology, 2023',retina],
      ['CDC · National diabetes surveillance data',surveillance],
      ['CDC · National surveillance methods','https://usdss.cdc.gov/diabetes/data/socrata/National_Other_methods.html'],
      ['McCoy and colleagues · Hyperglycemic crises by diabetes type · JAMA Network Open, 2021, supplementary eTable 4',crisisHistory.source],
      ...anatomicalSources
    ],[
      'The anatomical figure adapts public-domain artwork by Mikael Häggström. Its U.S. estimates come from separate sources and populations. Conditions may coexist. Long-term risk depends on duration of exposure, other illnesses and care.',
      'CDC laboratory and examination findings are crude estimates for adults with diagnosed diabetes, August 2021 to August 2023. Elevated blood pressure is at least 130/80 mmHg or use of blood pressure medication. Elevated non-HDL cholesterol is at least 130 mg/dL. Kidney estimates include stages 1 to 4 and exclude stage 5.',
      'The comparison by kidney disease and diabetes type uses a separate CDC analysis. It classifies type 1 using current insulin use started within one year of diagnosis and identifies prediabetes by laboratory values. Retinopathy estimates cover people of all ages with diabetes. The 2023 survey question on eyesight combines blindness and serious difficulty seeing from any cause.',
      'The NHIS table uses 2025 Sample Adult weights and valid responses for each condition. Type 1 and type 2 are subsets of diagnosed diabetes. The reference group reported neither a diabetes nor a prediabetes diagnosis. The groups differ in age. A dash marks fewer than 30 valid responses or fewer than ten events or nonevents.',
      'Amputations use inpatient discharges and crude annual rates per 1,000 adults with diagnosed diabetes. The series starts after the 2015 coding change. The severe hyperglycemia study includes 20,156 adults with type 1 and 796,382 with type 2 in commercial or Medicare Advantage plans. Its adjusted emergency department and hospital event rates describe this insured cohort.'
    ]);
}


