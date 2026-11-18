// U.S. product labels and manufacturer specifications, reviewed November 18, 2026.
const references = {
  guide: ['Roche · Accu-Chek Guide Me meter and specifications', 'https://www.accu-chek.com/products/meters/guide-me'],
  guideLabel: ['FDA · Accu-Chek Guide Me clearance', 'https://www.accessdata.fda.gov/cdrh_docs/pdf18/K181131.pdf'],
  relion: ['Walmart ReliOn · Premier Classic meter specifications', 'https://www.walmart.com/ip/20268103145'],
  relionLabel: ['FDA · ReliOn Premier Classic home glucose testing', 'https://www.accessdata.fda.gov/cdrh_docs/pdf19/K192220.pdf'],
  g7Standard: ['Dexcom · Who can use the G7 10-day sensor', 'https://www.dexcom.com/en-us/faqs/who-is-dexcom-g7-for'],
  g7Long: ['Dexcom · Who can use the G7 15 Day sensor', 'https://www.dexcom.com/en-us/faqs/who-is-dexcom-g7-15-day-for'],
  g7Label: ['FDA · G7 and G7 15 Day specifications and indications', 'https://www.accessdata.fda.gov/cdrh_docs/pdf25/K253710.pdf'],
  libre: ['Abbott · FreeStyle Libre 3 Plus sensor specifications', 'https://www.freestyle.abbott/en-us/support/faq/sensor/whats-new-in-the-freestyle-libre-3-plus-sensor.html'],
  libreGuide: ['Abbott · FreeStyle Libre 3 Plus user guide', 'https://www.freestyle.abbott/content/dam/adc/webu/en-us/documents/Brochure_FreeStyleLibre_3_Plus_Getting_Started_Guide_Libre_App.pdf'],
  librePregnancy: ['Abbott · FreeStyle Libre indications, including pregnancy', 'https://www.freestyleprovider.abbott/content/dam/adc/freestyleprovider/countries/us-en/documents/Brochure_Pharmacist_Value_of_CGM.pdf'],
  stelo: ['FDA · Stelo over-the-counter use in adults and children', 'https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor-children'],
  steloLabel: ['FDA · Stelo wear duration, display interval and labeling', 'https://www.accessdata.fda.gov/cdrh_docs/pdf26/K260935.pdf'],
  lingo: ['Abbott · Lingo biosensor specifications', 'https://www.hellolingo.com/'],
  lingoLabel: ['Abbott · Lingo intended use', 'https://support.hellolingo.com/hc/en-us/articles/15902948209170-Can-I-use-Lingo-with-diabetes'],
  instinct: ['MiniMed · Abbott Instinct sensor setup and wear time', 'https://www.minimed.com/en-us/support/product-support/sensors/instinct-sensor'],
  instinctLabel: ['MiniMed · 780G indications with Instinct, Simplera Sync and Guardian 4', 'https://www.minimed.com/en-us/about-diabetes/treatments/continuous-glucose-monitoring'],
  humalog: ['Lilly · Humalog presentations', 'https://insulins.lilly.com/humalog'],
  humalogLabel: ['DailyMed · Humalog U.S. prescribing information and device instructions', 'https://www.dailymed.nlm.nih.gov/dailymed/getFile.cfm?setid=c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f'],
  inpen: ['MiniMed · InPen smart pen and MiniMed Go specifications', 'https://www.minimed.com/en-us/products/minimed-go-system/connected-app'],
  inpenGuide: ['MiniMed · InPen user guide', 'https://www.minimed.com/content/dam/documents/en-us/InPen-user-guide-2-0.pdf'],
  dash: ['Insulet · Omnipod DASH insulin pump and controller', 'https://www.omnipod.com/hcp/products/omnipod-dash-system'],
  omni: ['Insulet · How Omnipod 5 adjusts insulin and handles meals', 'https://www.omnipod.com/what-is-omnipod/omnipod-5'],
  omnipodSafety: ['Insulet · U.S. indications for Omnipod 5 and DASH', 'https://www.omnipod.com/safety'],
  omnipodSensors: ['Insulet · Compatible Omnipod 5 sensors', 'https://www.omnipod.com/what-is-omnipod/omnipod-5/sensors'],
  tandem: ['Tandem · Control-IQ+ software and compatible pumps', 'https://www.tandemdiabetes.com/landing-pages/control-iq-plus'],
  tandemLabel: ['FDA · Control-IQ+ indications for type 1, type 2 and pregnancy with type 1', 'https://www.accessdata.fda.gov/cdrh_docs/pdf26/K260429.pdf'],
  tandemDexcom: ['Tandem · Dexcom sensor compatibility', 'https://www.tandemdiabetes.com/support/cgm-compatibility/dexcom-cgm'],
  tandemFirmware: ['Tandem · G7 15 Day pump software requirements', 'https://www.tandemdiabetes.com/support/software-updates'],
  tandemLibre: ['Tandem · FreeStyle Libre 3 Plus pairing requirements', 'https://www.tandemdiabetes.com/support/cgm-compatibility/freestyle-libre-cgm'],
  miniMed: ['MiniMed · SmartGuard automation and mealtime boluses', 'https://www.minimed.com/en-us/support/product-support/780g/smartguard-technology'],
  miniMedLabel: ['FDA · MiniMed 780G age and diabetes-type indications', 'https://www.accessdata.fda.gov/cdrh_docs/pdf16/P160017S124A.pdf'],
  miniMedSensors: ['MiniMed · Sensors compatible with the 780G', 'https://www.minimed.com/en-us/products/compare-continuous-glucose-monitors'],
  monitoring: ['NIDDK · How continuous glucose monitoring works', 'https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring'],
  medicare: ['Medicare · Coverage of continuous glucose monitors', 'https://www.medicare.gov/coverage/continuous-glucose-monitors']
};

const products = [
  {
    id: 'guide', name: 'Accu-Chek Guide Me', brand: 'Roche', path: 'spot', kind: 'Bluetooth blood glucose meter',
    access: 'otc', type: ['t1', 't2', 'gest'], audience: 'People with diabetes who check blood glucose at home.',
    use: 'Displays a fingerstick reading and can send it to a phone for a digital log.',
    needs: 'Guide test strips, a lancing device and lancets. A phone is optional.',
    action: 'The person collects a blood drop and touches it to a fresh strip for each check.',
    cycle: 'Result in under 4 seconds.', refs: ['guide', 'guideLabel']
  },
  {
    id: 'relion', name: 'ReliOn Premier Classic', brand: 'ReliOn / i-SENS', path: 'spot', kind: 'Blood glucose meter',
    access: 'otc', type: ['t1', 't2', 'gest'], audience: 'People with diabetes who check blood glucose at home.',
    use: 'Shows a fingerstick result on the meter and stores past readings for review.',
    needs: 'ReliOn Premier strips, a lancing device and lancets.',
    action: 'The person applies a blood drop to each fresh strip and reads the meter screen.',
    cycle: 'Result in 5 seconds.', refs: ['relion', 'relionLabel']
  },
  {
    id: 'g7-10', name: 'Dexcom G7 (10-day sensor)', brand: 'Dexcom', path: 'sensor', kind: 'Prescription glucose sensor',
    access: 'rx', type: ['t1', 't2', 'gest'], audience: 'People age 2+ with diabetes, including during pregnancy.',
    use: 'Displays glucose trends and can alert the wearer when glucose rises or falls.',
    needs: 'A compatible phone or Dexcom receiver. Selected pumps can use its readings.',
    action: 'The wearer or caregiver applies the sensor and responds to readings and alerts.',
    cycle: 'Reading every 5 minutes. Up to 10 days per sensor.', refs: ['g7Standard', 'g7Label']
  },
  {
    id: 'g7', name: 'Dexcom G7 15 Day', brand: 'Dexcom', path: 'sensor', kind: 'Prescription glucose sensor',
    access: 'rx', type: ['t1', 't2', 'gest'], audience: 'Adults age 18+ with diabetes, including during pregnancy.',
    use: 'Shows glucose trends and alerts over a longer wear period than the 10-day G7.',
    needs: 'A compatible phone or Dexcom receiver. Pump compatibility depends on its software.',
    action: 'The wearer applies the sensor, follows glucose trends and responds to alerts.',
    cycle: 'Reading every 5 minutes. Up to 15 days per sensor.', refs: ['g7Long', 'g7Label']
  },
  {
    id: 'libre', name: 'FreeStyle Libre 3 Plus', brand: 'Abbott', path: 'sensor', kind: 'Prescription glucose sensor',
    access: 'rx', type: ['t1', 't2', 'gest'], audience: 'People age 2+ with diabetes, including during pregnancy.',
    use: 'Sends glucose readings, trend arrows and optional alarms to a compatible display.',
    needs: 'A compatible phone, Libre 3 reader or supported insulin delivery system.',
    action: 'The wearer or caregiver applies the sensor and uses the readings or alarms to follow changes.',
    cycle: 'Reading every minute. Up to 15 days per sensor.', refs: ['libre', 'libreGuide', 'librePregnancy']
  },
  {
    id: 'instinct', name: 'Instinct sensor', brand: 'Abbott', path: 'sensor', kind: 'Sensor for MiniMed systems',
    access: 'rx', type: ['t1', 't2'], audience: 'With the 780G, people with type 1 from age 7 or insulin-requiring type 2 from age 18.',
    use: 'Sends glucose trends to a compatible MiniMed system. A connected 780G pump can use them to adjust insulin.',
    needs: 'A compatible MiniMed system. With a 780G, the MiniMed Mobile app starts the sensor.',
    action: 'The wearer applies the sensor and pairs it with the system.',
    cycle: 'Up to 15 days per sensor.', refs: ['instinct', 'instinctLabel', 'miniMedSensors']
  },
  {
    id: 'stelo', name: 'Stelo', brand: 'Dexcom', path: 'sensor', kind: 'Over-the-counter glucose sensor',
    access: 'otc', type: ['t2', 'pre'], audience: 'People age 2+ who do not use insulin. An adult supervises users under 18.',
    use: 'Shows how glucose changes around meals and activity in people with or without diabetes.',
    needs: 'A compatible smartphone with the Stelo app.',
    action: 'The wearer or caregiver reviews trends in the app. Stelo has no low-glucose alarm.',
    cycle: 'App updates every 15 minutes. Up to 15 days per sensor.', refs: ['stelo', 'steloLabel']
  },
  {
    id: 'lingo', name: 'Lingo', brand: 'Abbott', path: 'sensor', kind: 'Wellness glucose sensor',
    access: 'otc', type: [], audience: 'Adults age 18+ who do not use insulin and want to track glucose for wellness.',
    use: 'Connects day-to-day glucose trends with logged food and activity.',
    needs: 'A compatible smartphone with the Lingo app.',
    action: 'The wearer applies the sensor and can log meals and movement for context.',
    cycle: 'Reading every minute. Up to 14 days per sensor.', refs: ['lingo', 'lingoLabel']
  },
  {
    id: 'vial', name: 'Humalog U-100 vial and syringe', brand: 'Eli Lilly', path: 'delivery', kind: 'Insulin medicine in a vial',
    access: 'rx', accessText: 'Prescription insulin', type: ['t1', 't2'], audience: 'Adults and children prescribed rapid-acting insulin lispro for diabetes.',
    use: 'A vial supplies rapid-acting insulin. A separate syringe measures and delivers each injection.',
    needs: 'Humalog U-100 vial and a matching U-100 insulin syringe.',
    action: 'The person or caregiver draws up the prescribed dose and gives the injection.',
    cycle: 'New syringe per injection. Up to 28 days per opened vial.', refs: ['humalog', 'humalogLabel']
  },
  {
    id: 'pen', name: 'Humalog U-100 KwikPen', brand: 'Eli Lilly', path: 'delivery', kind: 'Insulin in a prefilled pen',
    access: 'rx', accessText: 'Prescription insulin', type: ['t1', 't2'], audience: 'Adults and children prescribed rapid-acting insulin lispro for diabetes.',
    use: 'Delivers the same insulin lispro as the vial from a disposable pen with a dose dial.',
    needs: 'The prefilled pen and a compatible pen needle for each injection.',
    action: 'The person or caregiver attaches a new needle, dials the prescribed dose and injects it.',
    cycle: 'New needle per injection. Up to 28 days per opened pen.', refs: ['humalog', 'humalogLabel']
  },
  {
    id: 'inpen', name: 'InPen', brand: 'MiniMed', path: 'delivery', kind: 'Reusable smart insulin pen',
    access: 'rx', type: ['t1', 't2'], audience: 'People with diabetes who inject insulin. Self-injection from age 7, or use with adult supervision.',
    use: 'Records the time and size of injections. The app tracks active insulin and can remind users about doses.',
    needs: 'Compatible phone, needles and the pen version for a Humalog, NovoLog or Fiasp U-100 cartridge.',
    action: 'The person or caregiver replaces the cartridge and gives each injection by hand.',
    cycle: 'Reusable pen for 1 year. Half-unit dial increments.', refs: ['inpen', 'inpenGuide']
  },
  {
    id: 'dash', name: 'Omnipod DASH', brand: 'Insulet', path: 'delivery', kind: 'Manually programmed patch pump',
    access: 'rx', type: ['t1', 't2'], audience: 'People with diabetes who require insulin.',
    use: 'Delivers a programmed background insulin rate through a wearable, tubeless Pod.',
    needs: 'A DASH Pod, the handheld DASH controller and compatible U-100 rapid-acting insulin.',
    action: 'The person fills and changes the Pod, sets its program and requests mealtime doses on the controller.',
    cycle: 'Up to 72 hours per Pod.', refs: ['dash', 'omnipodSafety']
  },
  {
    id: 'omni', name: 'Omnipod 5', brand: 'Insulet', path: 'automated', kind: 'Tubeless automated insulin delivery system',
    access: 'rx', type: ['t1', 't2'], audience: 'People with type 1 from age 2 or type 2 from age 18 who use insulin.',
    use: 'The Pod uses sensor readings to raise, lower or pause background insulin delivery.',
    needs: 'An Omnipod 5 Pod, a supported sensor, a compatible phone or controller and compatible insulin.',
    action: 'The person starts meal doses on the app or controller and fills and changes each Pod.',
    cycle: 'Adjusts insulin every 5 minutes. Up to 72 hours per Pod.', refs: ['omni', 'omnipodSafety', 'omnipodSensors']
  },
  {
    id: 'tandem', name: 'Control-IQ+', brand: 'Tandem Diabetes Care', path: 'automated', kind: 'Pump-control software',
    access: 'rx', type: ['t1', 't2'], audience: 'People with type 1 from age 2 or type 2 from age 18 who use insulin.',
    use: 'Predicts glucose and tells a paired pump when to change background insulin or give an automatic correction.',
    needs: 'A compatible Tandem pump such as t:slim X2 or Mobi, a supported sensor, an infusion set and insulin.',
    action: 'The person starts meal doses, replenishes insulin and changes the pump’s infusion set.',
    cycle: 'Predicts glucose 30 minutes ahead. Reassesses every 5 minutes.', refs: ['tandem', 'tandemLabel', 'tandemDexcom', 'tandemFirmware', 'tandemLibre']
  },
  {
    id: 'med', name: 'MiniMed 780G', brand: 'MiniMed', path: 'automated', kind: 'Tubed automated insulin delivery system',
    access: 'rx', type: ['t1', 't2'], audience: 'People with type 1 from age 7 or insulin-requiring type 2 from age 18.',
    use: 'SmartGuard adjusts background insulin and can give correction doses through a tubed infusion set.',
    needs: 'The 780G pump, a supported sensor such as Instinct, an insulin reservoir, an infusion set and compatible insulin.',
    action: 'The person enters meals, starts meal doses and changes the reservoir and infusion set.',
    cycle: 'Checks sensor glucose and adjusts insulin every 5 minutes.', refs: ['miniMed', 'miniMedLabel', 'miniMedSensors']
  }
];

export const deviceProducts = products.map(({ refs, ...product }) => {
  const sources = refs.map(key => references[key]);
  const accessText = product.access === 'rx' ? 'Prescription' : 'Over the counter';
  return { accessText, ...product, url: sources[0][1], sources };
});

export const deviceConnections = [
  { sensor: 'g7-10', system: 'omni', detail: 'Uses an Omnipod 5 Pod labeled for Dexcom G7.', url: references.omnipodSensors[1] },
  { sensor: 'g7', system: 'omni', detail: 'Adult G7 15 Day users need a Pod compatible with the G7 family.', url: references.omnipodSensors[1] },
  { sensor: 'libre', system: 'omni', detail: 'Uses an Omnipod 5 Pod labeled for FreeStyle Libre 3 Plus.', url: references.omnipodSensors[1] },
  { sensor: 'g7-10', system: 'tandem', detail: 'Compatible G7 sensors can supply readings to Control-IQ+ on a supported Tandem pump.', url: references.tandemDexcom[1] },
  { sensor: 'g7', system: 'tandem', detail: 'The t:slim X2 needs software 7.10.4 or later to use the 15-day G7.', url: references.tandemFirmware[1] },
  { sensor: 'libre', system: 'tandem', detail: 'Pairs with the t:slim X2 on pump software 7.10 or later.', url: references.tandemLibre[1] },
  { sensor: 'instinct', system: 'med', detail: 'The MiniMed Mobile app starts the Instinct sensor for use with a compatible 780G pump.', url: references.instinct[1] }
];

export const deviceNotes = [
  'Product examples use U.S. labeling reviewed November 18, 2026. A meter checks capillary blood. A wearable sensor estimates glucose in the fluid between cells. Diabetes diagnosis requires a clinical test.',
  'Stelo brings people with prediabetes into the comparison because its label includes eligible people with or without diabetes who do not use insulin. It is unsuitable for problematic hypoglycemia or dialysis. Lingo is labeled for wellness and does not diagnose or manage diabetes.',
  'A sensor and a pump each have their own age limits and indications. The links identify selected U.S. combinations. The sensor version, Pod packaging, pump software and phone or controller may affect compatibility.',
  'The vial and KwikPen examples contain the same prescription insulin, Humalog U-100. Their difference is how the person measures and delivers it. Prescription status and out-of-pocket cost are separate. Medicare coverage depends on its eligibility and prescribing requirements.'
];

export const deviceSources = Object.values(references);
