import {barList, dataTable, escapeHTML, lineChart, measures, sourcesFooter} from './charts.js';
import {creators, publicContent, sources, themes} from './data.js';
import {card, heading, pair} from './epidemiology.js';
import {links} from './evidence.js';
import {searchHistory} from './market-signals.js';

const survey = 'https://www.niddk.nih.gov/-/media/Files/Health-Information/NDEP_NNDS_Report2.pdf';
const socialStudy = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7282343/';
const campaignReport = 'https://diabetes.org/sites/default/files/2024-02/ADA_AnnualReport_2022_REV9823_FINAL_WEB2.pdf';
const trendsData = 'https://storage.googleapis.com/covid19-open-data/v3/location/US.csv';
const trendsMethod = 'https://storage.googleapis.com/gcp-public-data-symptom-search/COVID-19%20Search%20Trends%20symptoms%20dataset%20documentation%20.pdf';
const seasonalStudy = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3557852/';

export function publicOverview() {
  const awareness = card('Which complications did people recognize?',
    '<p>In a 2016 national survey of adults ages 35 and older, amputation was more widely recognized as a possible complication than heart disease or stroke.</p>' +
    barList([['Amputation', 91.2], ['Blindness', 88.5], ['Foot ulcers', 84.6], ['Kidney disease', 78.3], ['Heart disease', 68.6], ['Stroke', 68.6]]));
  const prevention = card('Who knew type 2 could be prevented?',
    '<p>Across the same survey, 78.8% recognized that prevention was possible. Awareness varied with household income.</p>' +
    dataTable(['Household income', 'Aware of prevention'], [['At or below the federal poverty level', '73%'], ['Above 250% of the federal poverty level', '81%']]) +
    '<p class="reading">Among people who reported having prediabetes, 86% knew type 2 could be prevented.</p>');
  const conversations = card('What people shared about insulin costs',
    '<p>In 46,407 U.S. Twitter posts expressing personal feelings about diabetes, people described frustration at insulin prices and hope around efforts to make it affordable.</p>' +
    measures([['18%', 'posts about insulin prices'], ['12%', 'posts about solidarity and support'], ['10%', 'posts in the most negative topics, including distress, insulin shock and other conditions']]) +
    '<p class="reading">Researchers grouped posts by topic between April 2017 and July 2019.</p>');
  const riskCampaign = card('Do I Have Prediabetes?',
    '<p>A public service campaign invited people to take a one-minute risk test. CDC reported the following cumulative results.</p>' +
    dataTable(['Reported by', 'Online or video tests completed'], [['Nov 2021', '3.7 million'], ['Nov 2023', 'Over 12.7 million'], ['Jun 2025', '26.9 million'], ['Mar 2026', 'Over 33.7 million']]) +
    '<p class="reading">Through March 2026, nearly 9.1 million people visited the website and the link to the National Diabetes Prevention Program received over 329,000 clicks.</p>');
  const heartCampaign = card('Know Diabetes by Heart',
    '<p>The American Diabetes Association and American Heart Association brought people with diabetes into live conversations about heart disease and stroke.</p>' +
    measures([['12', 'live Ask the Experts events in 2022'], ['6,000+', 'people joined those sessions']]) +
    '<p class="reading">The initiative also engaged more than 4,000 healthcare professionals on clinical management and therapy in 2022.</p>');
  return heading('Public discussion') + pair(awareness, prevention) + conversations + pair(riskCampaign, heartCampaign) + sourcesFooter([
    ['NIDDK · 2016 National Diabetes Survey, Figures 8–9 and prevention by income', survey],
    ['Ahne and colleagues · U.S. Twitter posts on diabetes and insulin prices', socialStudy],
    ['CDC · 2021 prediabetes campaign update', links.campaign21], ['CDC · 2023 campaign update', links.campaign23],
    ['CDC · June 2025 campaign update', links.campaign25], ['CDC · Ten-year campaign report', links.campaign],
    ['American Diabetes Association · 2022 annual report, Know Diabetes by Heart', campaignReport]
  ], [
    'The National Diabetes Education Program surveyed 2,517 U.S. adults ages 35 and older in August 2016. The estimates use survey weights. Respondents could select several complications. The income comparison shows the two groups the report explicitly contrasted.',
    'The Twitter study limited its analysis to English-language posts with personal, emotional content that could be placed in the United States. Percentages describe selected posts, and one person could contribute more than once. Women and people with type 1 diabetes were overrepresented.',
    'Campaign figures come from the organizations that ran them. A risk test can be completed more than once, and a program-link click records interest. Neither campaign report establishes how many new people enrolled in treatment or prevented diabetes.'
  ]);
}

const searchMonths = [
  'Jan 2020', 'Feb 2020', 'Mar 2020', 'Apr 2020', 'May 2020', 'Jun 2020', 'Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020',
  'Jan 2021', 'Feb 2021', 'Mar 2021', 'Apr 2021', 'May 2021', 'Jun 2021', 'Jul 2021', 'Aug 2021', 'Sep 2021', 'Oct 2021', 'Nov 2021', 'Dec 2021',
  'Jan 2022', 'Feb 2022', 'Mar 2022', 'Apr 2022', 'May 2022', 'Jun 2022', 'Jul 2022', 'Aug 2022'
];
const googleArchive = {
  labels: searchMonths, unit: 'U.S. relative search interest · monthly average index', format: 'rate', digits: 2, source: trendsData
};
export const publicSearchHistories = [
  {...googleArchive, title: 'Searches about diabetes and prediabetes', series: [
    ['Diabetes', [7.83,7.92,6.56,6.35,6.75,7.29,7.54,8.03,7.50,7.74,7.11,6.87,7.69,8.37,8.16,8.00,7.62,8.04,7.91,7.74,7.70,7.52,7.54,6.98,7.72,8.05,8.20,8.21,7.85,8.37,8.23,8.34]],
    ['Type 2 diabetes', [3.83,3.86,3.25,3.05,3.34,3.63,3.72,3.61,3.63,3.88,3.50,3.36,3.74,4.06,4.06,4.00,3.79,4.00,4.00,3.87,3.82,3.77,3.71,3.46,3.83,4.05,4.17,4.19,4.03,4.39,4.25,4.30]],
    ['Prediabetes', [0.57,0.58,0.52,0.50,0.52,0.57,0.60,0.57,0.56,0.57,0.55,0.53,0.58,0.61,0.62,0.62,0.58,0.60,0.61,0.58,0.58,0.57,0.56,0.52,0.56,0.60,0.63,0.62,0.60,0.64,0.66,0.64]]
  ], note: 'Across these 32 months, type 2 diabetes drew the most interest in June 2022. Prediabetes peaked one month later. Both topics reached their lowest monthly index in April 2020.'},
  {...googleArchive, title: 'Searches about high and low blood glucose', series: [
    ['High blood glucose', [1.03,1.08,0.89,0.91,0.94,1.01,1.07,1.04,1.11,1.11,1.05,1.03,1.11,1.19,1.18,1.16,1.08,1.09,1.11,1.09,1.13,1.11,1.08,1.00,1.05,1.15,1.17,1.17,1.09,1.12,1.13,1.16]],
    ['Low blood glucose', [0.67,0.69,0.57,0.59,0.60,0.63,0.66,0.65,0.67,0.66,0.63,0.60,0.66,0.72,0.73,0.71,0.67,0.68,0.69,0.69,0.68,0.67,0.64,0.60,0.64,0.70,0.71,0.71,0.65,0.69,0.70,0.71]],
    ['Diabetic ketoacidosis', [0.25,0.27,0.21,0.21,0.21,0.22,0.23,0.22,0.24,0.24,0.23,0.22,0.24,0.27,0.28,0.29,0.24,0.25,0.25,0.25,0.26,0.25,0.25,0.23,0.26,0.28,0.27,0.27,0.24,0.25,0.25,0.24]]
  ], note: 'High blood glucose drew more search interest than low blood glucose in every complete month in the archive.'}
];

const searchThemes = [
  {id: 'types', name: 'Diabetes types', description: 'Compare the language people use for a diagnosis or a risk state.', queries: ['type 1 diabetes', 'type 2 diabetes', 'prediabetes']},
  {id: 'symptoms', name: 'Symptoms & testing', description: 'Explore symptoms and the tests people ask about.', queries: ['diabetes symptoms', 'low blood sugar', 'A1C test']},
  {id: 'medicines', name: 'Medicines', description: 'Compare interest in three treatments across the same U.S. search window.', queries: ['metformin', 'Ozempic', 'insulin']},
  {id: 'cost', name: 'Affordability', description: 'Explore how people look for help paying for insulin and supplies.', queries: ['insulin cost', 'insulin savings card', 'Medicare glucose monitor coverage']},
  ...themes
];
const externalLink = (title, url) => `<a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(title)} ↗</a>`;
function trendsLink(queries) {
  return 'https://trends.google.com/trends/explore?' + new URLSearchParams({geo: 'US', date: 'today 5-y', q: queries.join(',')});
}
export function searchInterest(theme) {
  const current = searchThemes.find(entry => entry.id === theme) || searchThemes[0];
  const controls = `<div class="topic-picks" role="group" aria-label="Search topics">${searchThemes.map(entry => `<button type="button" data-theme="${entry.id}" aria-pressed="${entry.id === current.id}">${escapeHTML(entry.name)}</button>`).join('')}</div>`;
  const queries = current.queries.map(q => `<div class="query-row"><span>${escapeHTML(q)}</span>${externalLink('Google Trends', trendsLink([q]))}${externalLink('YouTube', 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q))}</div>`).join('');
  const examples = publicContent.filter(entry => entry.topic === current.id);
  const accounts = examples.length ? card('Examples from public voices', examples.map(entry => `<p>${externalLink(entry.title, entry.url)}<br><small>${escapeHTML(entry.creator + ' · ' + entry.format)}</small></p>`).join('')) : '';
  return heading('Search interest') + lineChart(publicSearchHistories[0]) + lineChart(publicSearchHistories[1]) + lineChart(searchHistory) +
    card('Seasonality in an earlier period', '<p>Researchers averaged five years of U.S. searches for “diabetes” by calendar month. March had the highest relative interest and August the lowest from February 2005 through January 2010.</p>') +
    card('Explore current searches', controls + `<p>${escapeHTML(current.description)}</p><p>${externalLink('Compare these terms in U.S. Google Trends', trendsLink(current.queries))}</p>` + queries) + accounts + sourcesFooter([
      ['Google LLC · Google COVID-19 Search Trends symptoms dataset', 'https://pair-code.github.io/covid19_symptom_dataset/?country=US'],
      ['Google Cloud · U.S. daily source file (CSV)', trendsData], ['Google · Symptom topic definitions and scaling', trendsMethod],
      ['Oxford Academic · Ozempic relative interest, monthly table', searchHistory.source], ['Breyer and Eisenberg · U.S. search seasonality', seasonalStudy],
      ['Google · How the live Trends index works', 'https://support.google.com/trends/answer/4365533']
    ], [
      'The first two charts use 974 national daily observations from Google’s aggregated, anonymized health-topic search archive, accessed November 17, 2026. Each point is the arithmetic mean of all daily values in a complete calendar month, January 2020 through August 2022. The September extract is incomplete. The archive has no separate U.S. series for type 1 diabetes.',
      'For each day, Google divides topic searches by the number of Search users and applies a common U.S. scale where the most popular health topic on its peak day is 100. Topics can overlap. These indices describe search activity. They cannot identify the searcher, diabetes prevalence or the frequency of clinical events.',
      'The Ozempic study has its own 0–100 scale for weekly interest from March 2018 through February 2023. The chart shows its published monthly values. Searches can concern diabetes or weight management. Compare changes within this chart only.',
      'The live explorer uses suggested phrases and the latest five years. Their inclusion reflects editorial choice. The Google link compares all selected terms in one request. YouTube links open video search results. They do not measure U.S. search volume.'
    ]);
}

const roleNames = {all: 'All voices', patient: 'Patients', caregiver: 'Caregivers', hcp: 'Healthcare professionals', organization: 'Organizations'};
const roleTags = {patient: 'Patient', caregiver: 'Caregiver', hcp: 'Healthcare professional', organization: 'Organization'};
const creatorDetails = {
  mila: 'Mila writes about food and her experience of an initial type 2 diagnosis followed by a diagnosis of latent autoimmune diabetes in adults (LADA).',
  ginger: 'An author living with type 1 diabetes, Ginger writes about burnout, physical activity and everyday care.',
  christel: 'Christel founded Diabetes Strong and writes about exercise and daily life with type 1 diabetes.',
  ben: 'Ben is a registered dietitian who lives with type 1 diabetes. His work focuses on nutrition, insulin and exercise.',
  shelby: 'Shelby lives with type 2 diabetes and teaches home cooking through recipes, books and classes.'
};
const directory = [
  ...creators.map(creator => ({...creator, profile: creatorDetails[creator.id] || creator.profile, roles: creator.id === 'ben' ? ['patient', 'hcp'] : ['patient'], url: sources[creator.source].url})),
  {name: 'Scott Benner', initials: 'SB', brand: 'Juicebox Podcast', roles: ['caregiver'], profile: 'The father of a daughter with type 1 diabetes, Scott started by writing about the family’s everyday experience and now hosts conversations with people affected by diabetes.', themes: ['Type 1', 'Parenting', 'Daily care'], format: 'Podcast and personal blog', url: 'https://www.juiceboxpodcast.com/about'},
  {name: 'Stacey Simms', initials: 'SS', brand: 'Diabetes Connections', roles: ['caregiver'], profile: 'Stacey began sharing her family’s experience after her son developed type 1 diabetes. She hosts interview series on type 1 and type 2 diabetes.', themes: ['Parenting', 'Diabetes news', 'Peer support'], format: 'Podcasts, books and events', url: 'https://diabetes-connections.com/about/'},
  {name: 'Steven Edelman, MD', initials: 'SE', brand: 'Taking Control Of Your Diabetes', roles: ['hcp', 'patient'], profile: 'An endocrinologist living with type 1 diabetes, Dr. Edelman founded TCOYD and explains treatments and devices to people with diabetes and care teams.', themes: ['Endocrinology', 'Technology', 'Type 1 and type 2'], format: 'Education videos, podcast and conferences', url: 'https://tcoyd.org/team-2/'},
  {name: 'American Diabetes Association', initials: 'ADA', brand: 'National nonprofit', roles: ['organization'], profile: 'The ADA connects public education with advocacy on access to diabetes care and publishes resources for people with diabetes and health professionals.', themes: ['Access', 'Prevention', 'Education'], format: 'Resource website, campaigns and advocacy', url: 'https://diabetes.org/about-us'},
  {name: 'Breakthrough T1D', initials: 'BT1', brand: 'Formerly JDRF', roles: ['organization'], profile: 'Founded by families affected by type 1 diabetes, the nonprofit brings research, advocacy and community support into the public discussion.', themes: ['Type 1', 'Research', 'Family support'], format: 'Research news, community events and advocacy', url: 'https://www.breakthrought1d.org/about/'}
];
export function voices(role = 'all') {
  const selected = Object.hasOwn(roleNames, role) ? role : 'all';
  const visible = directory.filter(person => selected === 'all' || person.roles.includes(selected));
  const buttons = `<div class="topic-picks" role="group" aria-label="Voice by role">${Object.entries(roleNames).map(([id, label]) => `<button type="button" data-voice-role="${id}" aria-pressed="${id === selected}">${label}</button>`).join('')}</div>`;
  const cards = visible.map(person => `<article class="creator-card"><div class="creator-mini"><div class="avatar" aria-hidden="true">${escapeHTML(person.initials)}</div><div><h2>${escapeHTML(person.name)}</h2><p>${escapeHTML(person.brand)}</p></div></div><p>${escapeHTML(person.profile)}</p><div class="tags">${person.roles.map(id => `<span class="tag">${roleTags[id]}</span>`).join('')}</div><dl><dt>Topics</dt><dd>${escapeHTML(person.themes.join(', '))}</dd><dt>Channels</dt><dd>${escapeHTML(person.format)}</dd></dl>${externalLink('Official profile', person.url)}</article>`);
  return heading('Public voices') + buttons + `<div class="creator-grid">${cards.join('')}</div>` + sourcesFooter(visible.map(person => [person.name + ' · official profile', person.url]), ['People and organizations are included for the perspective and subject matter documented on their public channels. A person with multiple roles appears in each relevant filter. This directory measures neither audience size nor engagement.']);
}
