"""Recreate treatment-drugs.js using official 2021 and 2022 MEPS public files.

Requires Python 3.10+, pandas and numpy. Example:
  python meps_treatment_drugs.py --cache-dir ./meps-cache --output treatment-drugs.js

Aggregate names identify reported product families. No commercial sales or rebate
information is imputed from expenditure records. Downloads are publicly available.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from shutil import copyfileobj
from urllib.request import Request, urlopen
from zipfile import ZipFile

import numpy as np
import pandas as pd

BRIEF = "https://meps.ahrq.gov/data_files/publications/st568/stat568.shtml"
INDEX = "https://meps.ahrq.gov/about_meps/Price_Index.shtml"
RX21 = "https://meps.ahrq.gov/data_stats/download_data_files_detail.jsp?cboPufNumber=HC-229A"
RX22 = "https://meps.ahrq.gov/data_stats/download_data_files_detail.jsp?cboPufNumber=HC-239A"
DESIGN = "https://meps.ahrq.gov/data_stats/download_data_files_detail.jsp?cboPufNumber=HC-036"
FDA = "https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-data-files"
FDA_APPLICATION = "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo="

YEARS = {
    2021: ("h229a", "h229i", "h231", "h233", 3, 110.240 / 107.572),
    2022: ("h239a", "h239i", "h241", "h243", 4, 1.0),
}
PUF = {
    key: f"https://meps.ahrq.gov/data_files/pufs/{key}/{key}dta.zip"
    for key in ("h229a", "h239a", "h239i", "h231", "h241", "h233", "h243")
}
PUF["h229i"] = "https://meps.ahrq.gov/data_files/pufs/h229i/h229if1dta.zip"
PUF["h036"] = "https://meps.ahrq.gov/data_files/pufs/h036/h36u24dta.zip"

INSULIN = "Insulins"
GLP = "GLP-1 receptor agonists"
SGLT = "SGLT2 inhibitors"
DPP = "DPP-4 inhibitors"
OTHER = "Other linked prescriptions and combinations"
SUPPLY = "Flagged diabetes supplies in the prescription file"
SINGLE_AGENT_CLASSES = {
    GLP: ["DULAGLUTIDE", "SEMAGLUTIDE", "LIRAGLUTIDE", "GLP-1 RECEPTOR AGONISTS"],
    SGLT: ["EMPAGLIFLOZIN", "DAPAGLIFLOZIN", "SGLT-2 INHIBITORS"],
    DPP: ["SITAGLIPTIN", "DIPEPTIDYL PEPTIDASE 4 INHIBITORS"],
}
# RXDRGNAM identifies the ingredient. Prefixes group only the named RXNAME family,
# including public-file abbreviations such as LANTUS SOLOS, HUMALOG KWIK and TRESIBA FLEX.
# Last column is the corresponding FDA application or source for the supply family.
PRODUCTS = [
    (INSULIN, "Insulin aspart", "NovoLog", "Novo Nordisk", ("NOVOLOG",), "020986"),
    (INSULIN, "Insulin glargine", "Lantus", "Sanofi", ("LANTUS",), "021081"),
    (INSULIN, "Insulin lispro", "Humalog", "Eli Lilly", ("HUMALOG",), "020563"),
    (INSULIN, "Insulin degludec", "Tresiba", "Novo Nordisk", ("TRESIBA",), "203314"),
    (INSULIN, "Insulin detemir", "Levemir", "Novo Nordisk", ("LEVEMIR",), "021536"),
    (INSULIN, "Insulin glargine", "Basaglar", "Eli Lilly", ("BASAGLAR",), "205692"),
    (INSULIN, "Insulin glargine", "Toujeo", "Sanofi", ("TOUJEO",), "206538"),
    (GLP, "Dulaglutide", "Trulicity", "Eli Lilly", ("TRULICITY",), "125469"),
    (GLP, "Semaglutide", "Ozempic", "Novo Nordisk", ("OZEMPIC",), "209637"),
    (GLP, "Liraglutide", "Victoza", "Novo Nordisk", ("VICTOZA",), "022341"),
    (GLP, "Semaglutide", "Rybelsus", "Novo Nordisk", ("RYBELSUS",), "213051"),
    (SGLT, "Empagliflozin", "Jardiance", "Boehringer Ingelheim", ("JARDIANCE",), "204629"),
    (SGLT, "Dapagliflozin", "Farxiga", "AstraZeneca", ("FARXIGA",), "202293"),
    (DPP, "Sitagliptin", "Januvia", "Merck", ("JANUVIA",), "021995"),
    (OTHER, "Metformin–sitagliptin", "Janumet / Janumet XR", "Merck", ("JANUMET",), "022044"),
    (OTHER, "Metformin", "Generic metformin", "Multiple suppliers", ("METFORMIN",), None),
    (OTHER, "Glipizide", "Generic glipizide", "Multiple suppliers", ("GLIPIZIDE",), None),
    (OTHER, "Glimepiride", "Generic glimepiride", "Multiple suppliers", ("GLIMEPIRIDE",), None),
    (SUPPLY, "Meter and testing supplies", "OneTouch family", "LifeScan", ("ONETOUCH", "ONE TOUCH"), "https://www.lifescan.com/news-and-updates/2022-press-releases/onetouch-verio-flexr-tops-the-forbes-health-best-standard"),
    (SUPPLY, "Glucose monitoring supplies", "FreeStyle family", "Abbott", ("FREESTY",), "https://www.freestyle.abbott/en-us/home.html"),
    (SUPPLY, "Meter and testing supplies", "Accu-Chek family", "Roche Diabetes Care", ("ACCU-CHE",), "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfivd/detail.cfm?id=9157&noclia=1"),
    (SUPPLY, "Meter and testing supplies", "Contour family", "Ascensia Diabetes Care", ("CONTOUR",), "https://www.ascensia.com/about/about-us/"),
    (SUPPLY, "Continuous glucose monitoring supplies", "Dexcom G6 family", "Dexcom", ("DEXCOM G6",), "https://www.dexcom.com/en-us/g6-cgm-system"),
]

NOTES = [
    "The prescription drill-down reproduces AHRQ’s diabetes event linkage using the 2021 and 2022 public files. An event qualifies when it links to at least one diabetes condition (CCSR END002–END006). Each purchased or refilled prescription is counted once. Some events also link to another condition. Purchase payments include all sources and describe annual payments in 2022 dollars. AHRQ’s PCE Health index converts 2021 payments by 110.240 / 107.572. Final annual person weights are divided by two.",
    "A fill’s released Multum drug name determines its medicine class. Diabetes supplies first reported in the prescription survey’s separate equipment question are identified by DIABEQUIP = 1. This flag includes some pharmacy purchases and can miss supplies reported in the ordinary medication questions or obtained elsewhere. Other linked prescriptions and combinations includes remaining medicines, combinations and unidentified items. It includes payments for events linked to multiple conditions.",
    "Named product estimates require a matching product-family label in the public file, an appropriate ingredient where reported, at least 30 unique survey participants and a design-based relative standard error of 30% or less. AHRQ may disguise a product using a broader category or impute its name. Such fills contribute to the applicable class total. The named rows are selected examples within each total. The company identifies the U.S. drug sponsor or supply brand associated with the product. Payments include dispensing and apply across payers. A company’s net receipts and rebates cannot be recovered from these data.",
    "The pooled HC-036 design accounts for repeated sampling using shared variance strata and primary sampling units. The export includes standard errors and unweighted participant counts for displayed estimates. The reproduction uses a later published price-index vintage and rounds to the same $123.0 billion as the brief’s published treatment share."
]

def download(cache, key):
    dest = cache / f"{key}.zip"
    if dest.exists():
        return
    req = Request(PUF[key], headers={"User-Agent": "US-diabetes-research"})
    with urlopen(req, timeout=90) as response, dest.with_suffix(".part").open("wb") as w:
        copyfileobj(response, w)
    dest.with_suffix(".part").replace(dest)


def read(cache, key, columns):
    with ZipFile(cache / f"{key}.zip") as archive:
        name, = [n for n in archive.namelist() if n.lower().endswith(".dta")]
        return pd.read_stata(BytesIO(archive.read(name)), columns=columns, convert_categoricals=False)


def annual_records(cache, year):
    rx, links, conditions, consolidated, nc, inflation = YEARS[year]
    suffix = str(year)[-2:] + "F"
    weight = "PERWT" + suffix
    payment = f"RXXP{str(year)[-2:]}X"
    person = read(cache, consolidated, ["DUPERSID", "PANEL", "AGELAST", weight])
    person = person.loc[person[weight] > 0].copy()
    ccsr = [f"CCSR{i}X" for i in range(1, nc + 1)]
    diagnoses = read(cache, conditions, ["CONDIDX"] + ccsr)
    selected = diagnoses[ccsr].isin({f"END00{i}" for i in range(2, 7)}).any(axis=1)
    linkage = read(cache, links, ["CONDIDX", "EVENTYPE", "EVNTIDX"])
    rxlinks = linkage.loc[(linkage.EVENTYPE == 8) & linkage.CONDIDX.isin(diagnoses.loc[selected, "CONDIDX"]), "EVNTIDX"].unique()
    purchases = read(cache, rx, ["DUPERSID", "PANEL", "RXRECIDX", "LINKIDX", "RXDRGNAM", "RXNAME", "DIABEQUIP", payment])
    purchases = purchases.loc[purchases.LINKIDX.isin(rxlinks)]
    assert purchases.RXRECIDX.is_unique
    adult = person.loc[person.AGELAST >= 18]
    linked = purchases.merge(adult, on=["DUPERSID", "PANEL"], validate="many_to_one")
    assert (linked[payment] >= 0).all()
    linked["usd"] = linked[payment] * linked[weight] * inflation / 2
    return linked[["DUPERSID","PANEL","RXDRGNAM","RXNAME","DIABEQUIP","usd"]], person[["DUPERSID","PANEL"]]


def estimate(subset, design):
    strata_psu = subset.groupby(["STRA9624", "PSU9624"]).usd.sum().reindex(design, fill_value=0)
    groups = strata_psu.groupby(level=0)
    n = groups.transform("size")
    assert (n > 1).all()
    variance = ((strata_psu - groups.transform("mean")) ** 2 * n / (n - 1)).sum()
    total = subset.usd.sum()
    se = np.sqrt(variance)
    return {
        "spendMillions": round(float(total / 1e6), 3),
        "seMillions": round(float(se / 1e6), 3),
        "rsePercent": round(float(se / total * 100), 2),
        "people": len(subset[["PANEL", "DUPERSID"]].drop_duplicates()),
        "events": len(subset),
    }


def collect(cache):
    yearly = [annual_records(cache, year) for year in YEARS]
    variance = read(cache, "h036", ["DUPERSID", "PANEL", "INH233", "INH243", "STRA9624", "PSU9624"])
    variance = variance.loc[(variance.INH233 == 1) | (variance.INH243 == 1)]
    assert not variance.duplicated(["DUPERSID", "PANEL"]).any()
    persons = pd.concat([p for _, p in yearly]).drop_duplicates().merge(variance, on=["DUPERSID", "PANEL"], how="left", validate="one_to_one")
    assert persons.STRA9624.notna().all()
    design = pd.MultiIndex.from_frame(persons[["STRA9624","PSU9624"]].drop_duplicates())
    prescriptions = pd.concat([rx for rx, _ in yearly], ignore_index=True).merge(persons, on=["DUPERSID","PANEL"], validate="many_to_one")
    assert len(prescriptions) == sum(len(rx) for rx, _ in yearly)
    prescriptions["group"] = OTHER
    prescriptions.loc[prescriptions.RXDRGNAM.str.startswith("INSULIN"), "group"] = INSULIN
    for group, ingredients in SINGLE_AGENT_CLASSES.items():
        prescriptions.loc[prescriptions.RXDRGNAM.isin(ingredients), "group"] = group
    prescriptions.loc[prescriptions.DIABEQUIP == 1, "group"] = SUPPLY
    result = []
    for name, group in prescriptions.groupby("group"):
        stats = estimate(group, design)
        assert stats["people"] >= 30 and stats["rsePercent"] <= 30
        rows = []
        used = set()
        for cls, ingredient, brand, maker, prefixes, reference in PRODUCTS:
            if cls != name:
                continue
            matches = group.RXNAME.str.startswith(prefixes)
            if cls != SUPPLY:
                matches &= group.RXDRGNAM.eq(ingredient.upper().replace("–", "-"))
            selected = group.loc[matches]
            assert not used.intersection(selected.index)
            used.update(selected.index)
            item = estimate(selected, design)
            if item["people"] < 30 or item["rsePercent"] > 30:
                continue
            source = FDA_APPLICATION + reference if reference and reference.isdigit() else reference
            rows.append(dict(ingredient=ingredient, brands=brand, makers=maker, productSource=source, **item))
        result.append(dict(name=name, rows=sorted(rows, key=lambda r: -r["spendMillions"]), **stats))
    total = estimate(prescriptions, design)
    assert abs(sum(r["spendMillions"] for r in result) - total["spendMillions"]) < 0.005
    assert round(total["spendMillions"] / 1e3, 1) == 123.0
    return sorted(result, key=lambda r: -r["spendMillions"]), total


def write_module(destination, groups, total):
    references = [
        ["AHRQ · Diabetes treatment expenditure and definitions, Statistical Brief 568", BRIEF],
        ["AHRQ · 2021 prescribed medicines and documentation", RX21],
        ["AHRQ · 2022 prescribed medicines and documentation", RX22],
        ["AHRQ · PCE Health price index, Table 3", INDEX],
        ["AHRQ · Pooled survey variance file, HC-036", DESIGN],
        ["FDA · Drugs@FDA product names and application sponsors", FDA],
        ["Reproduce the treatment medication estimates", "analysis/meps_treatment_drugs.py"],
    ]
    references += [[brand+" · Supply brand and manufacturer", link] for cls, _, brand, _, _, link in PRODUCTS if cls == SUPPLY]
    with destination.open("w", encoding="utf8") as output:
        output.write("// Generated by analysis/meps_treatment_drugs.py from AHRQ public data.\n")
        for name, data in [("treatmentDrugGroups", groups), ("treatmentDrugTotal", total), ("treatmentDrugSources", references), ("treatmentDrugNotes", NOTES)]:
            output.write(f"export const {name} = {json.dumps(data, ensure_ascii=False, indent=2)};\n\n")
        output.write("""export function treatmentDrugRows() {
  const rows = [];
  function add(group, label, estimate) {
    const source = 'https://meps.ahrq.gov/data_files/publications/st568/stat568.shtml';
    const panel = 'Market · Diabetes-linked pharmacy payments';
    rows.push([panel, group + ' / ' + label, '2021–22 annual average', estimate.spendMillions, 'USD millions in 2022 dollars', source]);
    rows.push([panel, group + ' / ' + label, 'Design-based standard error', estimate.seMillions, 'USD millions in 2022 dollars', source]);
    rows.push([panel, group + ' / ' + label, 'Pooled sample', estimate.people, 'unique survey respondents', source]);
  }
  add('All pharmacy purchases', 'Total', treatmentDrugTotal);
  for (const group of treatmentDrugGroups) {
    add(group.name, 'Total', group);
    for (const item of group.rows) add(group.name, item.brands + ' / ' + item.ingredient + ' / ' + item.makers, item);
  }
  return rows;
}
""")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("treatment-drugs.js"))
    args = parser.parse_args()
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(lambda key: download(args.cache_dir, key), PUF))
    groups, total = collect(args.cache_dir)
    write_module(args.output, groups, total)
    print(f"{len(groups)} groups, {sum(len(g['rows']) for g in groups)} named families, {total['events']:,} records, ${total['spendMillions']:,.1f} million annually")


if __name__ == "__main__":
    main()
