"""Reproduce annual NHIS diabetes and prediabetes estimates and design-based intervals.

Requires SciPy and the CDC NHIS Sample Adult CSV ZIP for each year from 2019
through 2025. Place the archives in one directory named 2019.zip through 2025.zip.
Run: python nhis_trend_intervals.py INPUT_DIRECTORY OUTPUT.json
"""
import argparse
from pathlib import Path
from zipfile import ZipFile
import csv
import io
import json
import math
from collections import defaultdict
from statistics import mean
from scipy.stats import t

args = argparse.ArgumentParser(description=__doc__)
args.add_argument("input", type=Path)
args.add_argument("output", type=Path)
opts = args.parse_args()
dashboard = Path(__file__).resolve().parents[1]
official_dashboard = json.loads((dashboard / "data" / "nhis.json").read_text())["trend"]
audit = []
for year in range(2019, 2026):
    sums = defaultdict(lambda: [0.0, 0.0, 0.0, 0.0])
    numerator_n = [0, 0, 0]
    denominator_n = 0
    with ZipFile(opts.input / f"{year}.zip") as archive:
        name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
        with archive.open(name) as stream:
            for row in csv.DictReader(io.TextIOWrapper(stream)):
                weight = float(row["WTFA_A"])
                if weight <= 0:
                    continue
                cluster = sums[(row["PSTRAT"], row["PPSU"])]
                diagnosed = row["DIBEV_A"]
                pre = row["PREDIB_A"]
                if diagnosed == "1":
                    status = {"1": 0, "2": 1}.get(row["DIBTYPE_A"])
                elif diagnosed == "2" and pre in {"1", "2"}:
                    status = 2 if pre == "1" else None
                else:
                    continue
                cluster[0] += weight
                denominator_n += 1
                if status is not None:
                    cluster[status + 1] += weight
                    numerator_n[status] += 1
    population = sum(vec[0] for vec in sums.values())
    proportions = [sum(vec[k] for vec in sums.values())/population for k in (1, 2, 3)]
    strata = defaultdict(list)
    for (stratum, _), vec in sums.items():
        strata[stratum].append(vec)
    assert all(len(clusters) > 1 for clusters in strata.values())
    df = sum(len(clusters) - 1 for clusters in strata.values())
    audited = []
    for idx, prop in enumerate(proportions):
        variance_terms = []
        for clusters in strata.values():
            influences = [(v[idx + 1] - prop * v[0])/population for v in clusters]
            center = mean(influences)
            variance_terms.append(len(clusters)/(len(clusters)-1) * sum((x-center)**2 for x in influences))
        variance = sum(variance_terms)
        logit = math.log(prop/(1 - prop))
        margin = t.ppf(.975, df) * math.sqrt(variance)/(prop*(1-prop))
        limits = [round(100/(1+math.exp(-z)),2) for z in (logit-margin, logit+margin)]
        audited.append({"percent":round(100*prop,2),"ci":limits,"sample_cases":numerator_n[idx]})
    assert [year] + [one["percent"] for one in audited] == official_dashboard[year-2019]
    audit.append({"year":year,"sample_adults":denominator_n,"design_df":df,"groups":audited})
opts.output.write_text(json.dumps(audit, indent=2) + "\n")
