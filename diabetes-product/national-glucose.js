// The November 2026 CDC National Diabetes Statistics Report uses different
// weights for interviews, blood tests and modeled population counts.
const report = 'https://usdss.cdc.gov/diabetes/data/statsreport/National_Diabetes_Statsitics_Report.pdf';
const nhisDocumentation = 'https://www.cdc.gov/nchs/nhis/documentation/2025-nhis.html';

const measuredGroups = [
  {
    id: 'diagnosed', label: 'Diagnosed diabetes', pct: 10.9, ci: [9.3, 12.7],
    millions: 28.8, millionsCi: [24.6, 32.9],
    detail: 'A health professional had told the person they had diabetes outside pregnancy. This category includes all diagnosed types, even when treatment brought glucose below the diabetes range.'
  },
  {
    id: 'undiagnosed', label: 'Undiagnosed diabetes', pct: 4.0, ci: [3.3, 5.0],
    millions: 11.0, millionsCi: [8.8, 13.1],
    detail: 'The person reported no diabetes diagnosis. Their fasting glucose was at least 126 mg/dL or their A1C was at least 6.5%. These survey tests cannot identify the diabetes type.'
  },
  {
    id: 'prediabetes', label: 'Prediabetes', pct: 43.5, ci: [41.3, 45.8],
    millions: 115.2, millionsCi: [109.7, 120.7],
    detail: 'The person had no diagnosed or lab-defined diabetes. Their fasting glucose was 100 to 125 mg/dL or their A1C was 5.7% to 6.4%. This includes people who had never been told they had prediabetes.'
  }
];

export const glucoseTotal = Number(measuredGroups.reduce((sum, row) => sum + row.pct, 0).toFixed(1));
export const glucoseStatus = [...measuredGroups, {
  id: 'below', label: 'Below prediabetes thresholds', pct: Number((100 - glucoseTotal).toFixed(1)),
  ci: null, millions: null, millionsCi: null,
  detail: 'No diabetes diagnosis was reported. Both fasting glucose and A1C were below the prediabetes range. The share is the remainder after subtracting the other three estimates from 100%.'
}];

// In [percent, lower 95% confidence limit, upper 95% confidence limit] form.
// CDC prints these intervals in the historical trend tables (pp. 6 and 27).
// Its standalone tables can have different intervals for the same point estimate.
export const labPeriods = [
  {period: '2001–04', mid: 2003, diagnosed: [7.1,6.5,7.8], undiagnosed: [4.1,3.5,4.8], total: [11.2,10.3,12.2], prediabetes: null},
  {period: '2003–06', mid: 2005, diagnosed: [7.4,6.8,8.1], undiagnosed: [3.8,3.2,4.7], total: [11.2,10.3,12.2], prediabetes: null},
  {period: '2005–08', mid: 2007, diagnosed: [7.6,6.9,8.5], undiagnosed: [4.2,3.6,4.8], total: [11.8,10.9,12.8], prediabetes: [44.4,42.0,46.8]},
  {period: '2007–10', mid: 2009, diagnosed: [7.9,7.1,8.7], undiagnosed: [4.4,3.9,5.0], total: [12.3,11.2,13.4], prediabetes: [45.9,43.9,47.9]},
  {period: '2009–12', mid: 2011, diagnosed: [8.1,7.4,8.9], undiagnosed: [4.0,3.4,4.6], total: [12.1,11.0,13.2], prediabetes: [44.0,41.8,46.3]},
  {period: '2011–14', mid: 2013, diagnosed: [8.7,8.1,9.4], undiagnosed: [3.7,3.2,4.2], total: [12.4,11.6,13.3], prediabetes: [42.3,40.0,44.6]},
  {period: '2013–16', mid: 2015, diagnosed: [9.4,8.6,10.2], undiagnosed: [4.1,3.5,4.8], total: [13.5,12.5,14.6], prediabetes: [43.8,41.5,46.0]},
  {period: '2015–18', mid: 2017, diagnosed: [9.8,9.0,10.7], undiagnosed: [4.3,3.6,5.1], total: [14.1,12.9,15.3], prediabetes: [49.0,46.8,51.3]},
  {period: '2017–Mar 2020', mid: 2018.625, diagnosed: [10.1,9.2,11.0], undiagnosed: [4.0,3.5,4.7], total: [14.1,12.9,15.3], prediabetes: [49.4,46.7,52.0]},
  {period: 'Aug 2021–Aug 2023', mid: 2022.625, diagnosed: [9.8,8.6,11.2], undiagnosed: [3.7,3.0,4.6], total: [13.5,12.1,15.6], prediabetes: [42.6,40.5,44.6]}
];
const labMeasures = [['prediabetes', 'Lab-defined prediabetes'], ['undiagnosed', 'Undiagnosed diabetes']];

export const labTrend = {
  title: 'Prediabetes and undiagnosed diabetes in blood tests',
  unit: 'Age-adjusted % of U.S. adults aged 18+ · NHANES examination periods',
  format: 'percent', digits: 1,
  labels: labPeriods.map(exam => exam.period),
  x: labPeriods.map(exam => exam.mid),
  series: labMeasures.map(([id, name]) => [name, labPeriods.map(exam => exam[id]?.[0] ?? null)]),
  intervals: labMeasures.map(([id]) => labPeriods.map(exam => exam[id]?.slice(1) ?? null)),
  source: report,
  note: 'CDC found no statistically significant long-term change in either measure across its published survey periods.'
};

export const nationalSources = [
  ['CDC · Adult diabetes percentages and population counts, pp. 3–5', report + '#page=3'],
  ['CDC · Adult prediabetes percentages and population counts, pp. 24–25', report + '#page=24'],
  ['CDC · Historical diabetes estimates, p. 6', report + '#page=6'],
  ['CDC · Historical prediabetes estimates, pp. 27–28', report + '#page=27'],
  ['CDC · NHANES glucose classifications and weights, pp. 64–67', report + '#page=64'],
  ['NCHS · NHIS annual public-use files and questionnaires', nhisDocumentation],
  ['American Diabetes Association · Confirming a clinical diagnosis, 2026', 'https://doi.org/10.2337/dc26-S002']
];

export const nationalMethods = [
  'The four-part adult snapshot uses crude NHANES percentages for August 2021 through August 2023. Pregnant respondents were excluded. Diagnosed diabetes uses the interview. Undiagnosed diabetes and prediabetes use A1C or fasting plasma glucose. A survey result on one occasion describes population prevalence. A clinical diagnosis usually requires confirmation.',
  'The combined share and the below-threshold share are calculated from rounded published percentages. CDC projected the adult counts separately to the July 2023 U.S. resident population using rates by age, sex, race and ethnicity. The survey percentages and projected counts can differ slightly from simple division.',
  'The annual NHIS series uses each year’s Sample Adult weights and respondents’ reports of a professional diagnosis. Reported prediabetes excludes respondents with diagnosed diabetes. Other and unknown diabetes types remain in the common denominator. Interviews cannot identify undiagnosed diabetes.',
  'The NHANES time series includes overlapping examination periods and is age-adjusted to the 2000 U.S. standard population. Prediabetes starts at 2005–2008. Examinations paused between March 2020 and August 2021. Prediabetes awareness is the share of people with lab-defined prediabetes who already knew their status.'
];

// Survey-design 95% confidence intervals aligned with NHIS annual estimates, 2019–2025.
export const nhisIntervals = [[[0.81,1.06],[0.78,1.05],[0.74,1.0],[0.79,1.05],[0.74,0.99],[0.78,1.03],[0.72,1.02]],[[7.23,7.93],[7.19,7.92],[7.66,8.4],[7.63,8.34],[7.84,8.56],[7.97,8.71],[7.93,8.79]],[[6.43,7.09],[7.22,8.02],[7.63,8.37],[8.49,9.29],[9.1,9.9],[9.72,10.59],[10.24,11.14]]];
