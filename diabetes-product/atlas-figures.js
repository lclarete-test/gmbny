import {escapeHTML} from './charts.js';

const art = {
  biology: ['glucose-body', 'glucose-body-mobile', 940, 501, 320, 543, 'After a meal, pancreatic insulin helps muscle and fat take up glucose and restrains the liver’s glucose output. Prolonged high glucose can injure the eyes, blood vessels, kidneys, nerves and feet.'],
  clinical: ['clinical-body', 'clinical-body-mobile', 940, 520, 320, 552, 'Among U.S. adults with diagnosed diabetes in 2021–23, 76.4% had high blood pressure or used blood pressure medication, 41.7% had stage 1–4 chronic kidney disease and 38.0% had elevated non-HDL cholesterol. In 2025, 8.8% of adults with diagnosed diabetes reported a prior stroke. In 2021, an estimated 26.43% of U.S. people of all ages with diabetes had retinopathy. In 2023 there were 7.30 hospital stays involving lower-limb amputation per 1,000 adults with diagnosed diabetes.'],
  patients: ['patients-wide', 'patients-mobile', 986, 376, 356, 605, 'Three paths after testing. In NHIS 2025, 2.3 million U.S. adults reported type 1 diabetes, 22.1 million reported type 2 and 28.2 million reported prediabetes without diabetes. Each path leads to different care and follow-up.'],
  caregivers: ['caregivers-wide', 'caregivers-mobile', 986, 366, 356, 553, 'In 2023, 40.1 million U.S. people lived with diabetes. In the 2025 national caregiving report, 4% of U.S. family caregivers of adults, about 2.4 million people, cited diabetes as the main reason for care. In a separate 2025 survey of caregivers in 31 states, 60.7% were female, 79.1% helped with household tasks, 34.2% helped with nursing or medical tasks, 33.3% had given care for at least five years, and 21.6% reported poor mental health on at least 14 of the past 30 days.'],
  hcp: ['hcp-wide', 'hcp-mobile', 986, 449, 356, 697, 'In a traditional Medicare cohort age 65 and older, 75.2% of people with type 1 and 73.7% of people with type 2 saw primary care in a year. Endocrinology reached 60.3% and 9.5%, respectively. The U.S. had 8,706 board-certified endocrinology, diabetes and metabolism physicians in June 2026.']
};
export const endocrinologySource=['ABMS · Board Certification Report 2025–26, Table 2C','https://www.abms.org/wp-content/uploads/2026/09/2025_26_ABMSCertReport_FNL_20260908.pdf#page=41'];
export const anatomicalSources=[['Mikael Häggström · Male organ template, CC0','https://commons.wikimedia.org/wiki/File:Male_template_with_organs.svg'],['Mikael Häggström · Female organ template, CC0','https://commons.wikimedia.org/wiki/File:Female_template_with_organs.svg']];
export const anatomicalNote='Body illustrations adapt public-domain anatomical artwork by Mikael Häggström. Leader lines locate selected tissues or conditions. Glucose regulation, risk factors and observed complications can coexist in one person.';
export function atlasFigure(key){
  const [wide,mobile,w,h,mw,mh,alt]=art[key];
  const breakpoint=key==='biology'||key==='clinical'?760:850;
  const revision=key==='caregivers'?'?v=audience-nov18':'';
  return `<figure class="atlas-figure atlas-${key}"><picture><source media="(max-width: ${breakpoint}px)" srcset="media/atlas/${mobile}.svg${revision}" width="${mw}" height="${mh}"><img src="media/atlas/${wide}.svg${revision}" width="${w}" height="${h}" alt="${escapeHTML(alt)}" decoding="async"></picture></figure>`;
}
