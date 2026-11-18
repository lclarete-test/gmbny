import {escapeHTML} from './charts.js';

const art = {
  biology: ['glucose-body', 'glucose-body-mobile', 940, 501, 320, 543, 'After a meal, pancreatic insulin helps muscle and fat take up glucose and restrains the liver’s glucose output. Prolonged high glucose can injure the eyes, blood vessels, kidneys, nerves and feet.'],
  clinical: ['clinical-body', 'clinical-body-mobile', 940, 520, 320, 552, 'Among U.S. adults with diagnosed diabetes in 2021–23, 76.4% had high blood pressure or used blood pressure medication, 41.7% had stage 1–4 chronic kidney disease and 38.0% had elevated non-HDL cholesterol. In 2025, 8.8% of adults with diagnosed diabetes reported a prior stroke. In 2021, an estimated 26.43% of U.S. people of all ages with diabetes had retinopathy. In 2023 there were 7.30 hospital stays involving lower-limb amputation per 1,000 adults with diagnosed diabetes.'],
  patients: ['patients-wide', 'patients-mobile', 986, 376, 356, 605, 'Three paths after testing. In NHIS 2025, 2.3 million U.S. adults reported type 1 diabetes, 22.1 million reported type 2 and 28.2 million reported prediabetes without diabetes. Each path leads to different care and follow-up.'],
  caregivers: ['caregivers-wide', 'caregivers-mobile', 986, 384, 356, 609, '40.1 million people had diabetes in the U.S. in 2023. A separate survey estimated 2.4 million family caregivers helped an adult mainly because of diabetes. In the separate 31-state survey, 60.7% were women, 79.1% helped with household tasks and 34.2% gave nursing or medical help.'],
  hcp: ['hcp-wide', 'hcp-mobile', 986, 449, 356, 697, 'In a traditional Medicare cohort age 65 and older, 75.2% of people with type 1 and 73.7% of people with type 2 saw primary care in a year. Endocrinology reached 60.3% and 9.5%, respectively. The U.S. had 8,706 board-certified endocrinology, diabetes and metabolism physicians in June 2026.'],
  organizations: ['organizations-wide', 'organizations-mobile', 986, 415, 356, 636, 'Five U.S. nonprofit organizations connect people to school support, insulin affordability, clinical trials, local diabetes education and treatment information. The American Diabetes Association reported more than 3,700 recognized education sites serving about 800,000 people each year.']
};
export const endocrinologySource=['ABMS · Board Certification Report 2025–26, Table 2C','https://www.abms.org/wp-content/uploads/2026/09/2025_26_ABMSCertReport_FNL_20260908.pdf#page=41'];
export const educationSiteSource=['ADA · Education Recognition Program, 2025 annual report','https://diabetes.org/sites/default/files/2026-07/ADA_2025_AnnualReport_Final_Digital.pdf'];
export const anatomicalSources=[['Mikael Häggström · Male organ template, CC0','https://commons.wikimedia.org/wiki/File:Male_template_with_organs.svg'],['Mikael Häggström · Female organ template, CC0','https://commons.wikimedia.org/wiki/File:Female_template_with_organs.svg']];
export const anatomicalNote='Body illustrations adapt public-domain anatomical artwork by Mikael Häggström. Leader lines locate selected tissues or conditions. Glucose regulation, risk factors and observed complications can coexist in one person.';
export function atlasFigure(key){
  const [wide,mobile,w,h,mw,mh,alt]=art[key];
  const breakpoint=key==='biology'||key==='clinical'?760:850;
  return `<figure class="atlas-figure atlas-${key}"><picture><source media="(max-width: ${breakpoint}px)" srcset="media/atlas/${mobile}.svg" width="${mw}" height="${mh}"><img src="media/atlas/${wide}.svg" width="${w}" height="${h}" alt="${escapeHTML(alt)}" decoding="async"></picture></figure>`;
}
