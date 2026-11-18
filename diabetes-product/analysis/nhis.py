"""Rebuild data/nhis.json from CDC NHIS Sample Adult ZIPs named YEAR.zip."""
import csv
import io
import json
import sys
import zipfile
from pathlib import Path

# Inclusive code bounds from the 2025 Sample Adult codebook.
GROUPS = {
    "Sex": ("SEX_A", [(1, 1, "Men"), (2, 2, "Women")]),
    "Age": ("AGEP_A", [(18, 34, "18–34"), (35, 44, "35–44"), (45, 54, "45–54"),
                       (55, 64, "55–64"), (65, 74, "65–74"), (75, 85, "75+")]),
    "Education": ("EDUCP_A", [(0, 2, "Less than high school"), (3, 4, "High school or GED"),
                              (5, 5, "Some college"), (6, 7, "Associate degree"),
                              (8, 8, "Bachelor’s degree"), (9, 10, "Graduate degree")]),
    "Family income": ("RATCAT_A", [(1, 3, "Below poverty threshold"), (4, 7, "100–199% of threshold"),
                                  (8, 11, "200–399%"), (12, 14, "400% or more")]),
    "Race and ethnicity": ("HISPALLP_A", [(1, 1, "Hispanic"), (2, 2, "Non-Hispanic White only"),
            (3, 3, "Non-Hispanic Black only"), (4, 4, "Non-Hispanic Asian only"),
            (5, 5, "Non-Hispanic AI/AN only"), (6, 6, "Non-Hispanic AI/AN and another race"),
            (7, 7, "Other single or multiple races")]),
    "Census region": ("REGION", [(1, 1, "Northeast"), (2, 2, "Midwest"), (3, 3, "South"), (4, 4, "West")])
}
PROFILE_GROUPS = {
    **GROUPS,
    "Work in the past week": ("EMPWRKLSW1_A", [(1, 1, "Worked"), (2, 2, "Did not work")]),
    "Functional disability": ("DISAB3_A", [(1, 1, "With disability"), (2, 2, "Without disability")]),
    "Self-rated health": ("PHSTAT_A", [(1, 2, "Excellent or very good"), (3, 3, "Good"), (4, 5, "Fair or poor")])
}
CONDITIONS = {
    "High blood pressure": "HYPEV_A", "High cholesterol": "CHLEV_A", "Arthritis": "ARTHEV_A",
    "Coronary heart disease": "CHDEV_A", "Heart attack": "MIEV_A", "Stroke": "STREV_A",
    "Chronic obstructive pulmonary disease": "COPDEV_A"
}

def weight(rows):
    return sum(float(row["WTFA_A"]) for row in rows)

def treated(rows, variable):
    valid = [r for r in rows if r[variable] in ("1", "2")]
    positive = [r for r in valid if r[variable] == "1"]
    if len(valid) < 30 or min(len(positive), len(valid) - len(positive)) < 10:
        return None
    return round(100 * weight(positive) / weight(valid), 1)

def code(row):
    if row["DIBEV_A"] == "1":
        return {"1": "Type 1", "2": "Type 2"}.get(row["DIBTYPE_A"], "Other/unknown diabetes")
    if row["DIBEV_A"] == "2" and row["PREDIB_A"] in ("1","2"):
        return "Prediabetes only" if row["PREDIB_A"] == "1" else "None reported"
    return None

def bins(rows, var, levels):
    return [[r for r in rows if r[var].isdigit() and low <= int(r[var]) <= high] for low, high, _ in levels]

def share(rows, labels, suppress=False):
    denom = weight(rows)
    cells = [[r for r in rows if r["group"] == label] for label in labels]
    return [None if suppress and len(cell)<10 else round(100*weight(cell)/denom,2) for cell in cells]

def profile(rows):
    result = {"sample":len(rows), "weightedAdults":round(weight(rows)), "groups":{}}
    for group, (var, levels) in PROFILE_GROUPS.items():
        groups=bins(rows,var,levels)
        denom=sum(weight(b) for b in groups)
        result["groups"][group]=[[label, round(100*weight(b)/denom,1) if len(b)>=10 else None, *(treated(b,v) for v in ("DIBINS_A","DIBPILL_A","DIBGLP_A"))] for (_,_,label),b in zip(levels,groups)]
    return result

def selected_populations(rows):
    return {
        "Type 2": [r for r in rows if r["group"] == "Type 2"],
        "Type 1": [r for r in rows if r["group"] == "Type 1"],
        "Prediabetes only": [r for r in rows if r["group"] == "Prediabetes only"],
        "All diagnosed": [r for r in rows if r["DIBEV_A"] == "1"]
    }

def composition_history(years, populations):
    for scope, members in populations.items():
        trend = years.setdefault(scope, {"Population": [["Adults, millions", []]]})
        trend["Population"][0][1].append(round(weight(members) / 1e6, 3))
        for group in ("Sex", "Age", "Education", "Family income", "Census region"):
            variable, levels = GROUPS[group]
            groups = bins(members, variable, levels)
            valid = sum(weight(cell) for cell in groups)
            series = trend.setdefault(group, [[label, []] for _, _, label in levels])
            for (_, points), cell in zip(series, groups):
                points.append(round(100 * weight(cell) / valid, 1) if len(cell) >= 10 else None)

def told_condition(rows, variable):
    valid = [r for r in rows if r[variable] in ("1", "2")]
    positive = [r for r in valid if r[variable] == "1"]
    if len(valid) < 30 or min(len(positive), len(valid) - len(positive)) < 10:
        return None
    return round(100 * weight(positive) / weight(valid), 1)

def build(directory):
    result={"trend":[], "labels":["Type 1","Type 2","Prediabetes only"], "profileTrends":{}}
    for year in range(2019,2026):
        with zipfile.ZipFile(directory / f"{year}.zip") as z, z.open(next(n for n in z.namelist() if n.lower().endswith(".csv"))) as f:
            variables={"DIBEV_A","DIBTYPE_A","PREDIB_A","WTFA_A","DIBINS_A","DIBPILL_A","DIBGLP_A","DIBSTRESS_A","DIBA1CLAST_A",*CONDITIONS.values(),*(v for v,_ in PROFILE_GROUPS.values())}
            rows=[]
            for raw in csv.DictReader(io.TextIOWrapper(f)):
                group=code(raw)
                if group is not None and float(raw["WTFA_A"])>0:
                    row={k:raw.get(k,"") for k in variables}
                    rows.append(dict(row,group=group))
        result["trend"].append([year,*share(rows,result["labels"])])
        populations = selected_populations(rows)
        composition_history(result["profileTrends"], populations)
    result["sample"]=len(rows)
    result["comparison"]={}
    for group,(var,levels) in GROUPS.items():
        result["comparison"][group]=[[label,*share(b,result["labels"],True)] for (_,_,label),b in zip(levels,bins(rows,var,levels))]
    result["profiles"] = {scope: profile(group) for scope, group in populations.items()}
    clinical_groups = [populations[k] for k in ("All diagnosed", "Type 1", "Type 2", "Prediabetes only")]
    clinical_groups.append([r for r in rows if r["group"] == "None reported"])
    result["clinical"] = [[label, *[told_condition(group, variable) for group in clinical_groups]]
                          for label, variable in CONDITIONS.items()]
    type2 = [r for r in rows if r["group"] == "Type 2"]
    routine = {
        "distress": ("DIBSTRESS_A", [["Always or usually", "12"], ["Sometimes", "3"], ["Rarely", "4"], ["Never", "5"]]),
        "a1c": ("DIBA1CLAST_A", [["Within the past year", "1"], ["More than a year ago", "23456"], ["Never", "0"]]),
    }
    result["type2Routine"] = {}
    for name, (variable, options) in routine.items():
        eligible = [r for r in type2 if r[variable] in set("".join(codes for _, codes in options))]
        total = weight(eligible)
        result["type2Routine"][name] = [[label, round(100 * weight(r for r in eligible if r[variable] in set(codes)) / total, 1)]
                                        for label, codes in options]
    return result

if __name__=="__main__":
    target=Path(__file__).resolve().parents[1]/"data"/"nhis.json"
    target.write_text(json.dumps(build(Path(sys.argv[1])),ensure_ascii=False,indent=2)+"\n")
