"""Build an NHIS 2019–2025 pain-location module from annual CDC Sample Adult ZIPs.

Usage: python nhis_pain.py /path/to/inputs /path/to/pain-data.js
Input files are labeled 2019.zip, 2021.zip, 2023.zip and 2025.zip.
Dependencies: numpy, pandas, scipy. No pooling, weighting across years or imputing
item nonresponse. The 2019 all-adult results check the six site definitions
against NCHS Data Brief 415 before producing subgroup estimates.
"""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
import pandas as pd
from scipy.special import expit, logit
from scipy.stats import t

YEARS = [2019, 2021, 2023, 2025]
SITES = {
    "lower": ("Hips, knees or feet", "PAILLMB3M_A"),
    "back": ("Back", "PAIBACK3M_A"),
    "upper": ("Hands, arms or shoulders", "PAIULMB3M_A"),
    "head": ("Headache or migraine", "PAIHDFC3M_A"),
    "abdomen": ("Abdomen, pelvis or genitals", "PAIAPG3M_A"),
    "jaw": ("Teeth or jaw", "PAITOOTH3M_A"),
}
SCOPES = ["Type 2", "Type 1", "Prediabetes only", "All diagnosed"]
VALID = [1, 2, 3, 4]


def load_file(folder, year):
    columns = ["WTFA_A", "PSTRAT", "PPSU", "DIBEV_A", "DIBTYPE_A", "PREDIB_A",
               "PAIFRQ3M_A", "PAIWKLM3M_A", *(col for _, col in SITES.values())]
    with ZipFile(folder / f"{year}.zip") as archive:
        name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
        with archive.open(name) as stream:
            data = pd.read_csv(stream, usecols=columns)
    return data.loc[data.WTFA_A.gt(0)].reset_index(drop=True)


class Survey:
    def __init__(self, df):
        self.weight = df.WTFA_A
        self.cluster_ids = [df.PSTRAT, df.PPSU]
        counts = df.groupby("PSTRAT").PPSU.nunique()
        if counts.min() < 2:
            raise ValueError("Full-sample design stratum with fewer than two PSUs")
        self.critical = t.ppf(.975, (counts - 1).sum())

    def estimate(self, denominator, positive):
        """Taylor-linearized domain ratio keeping zero-count PSUs in the design."""
        n = int(denominator.sum())
        case = positive & denominator
        k = int(case.sum())
        if n < 30 or min(k, n-k) < 10:
            return {"n": n, "pct": None, "ci": None}
        total = self.weight[denominator].sum()
        p = self.weight[case].sum() / total
        linearized = self.weight * (case.astype(float) - denominator.astype(float) * p) / total
        psus = linearized.groupby(self.cluster_ids).sum()
        strata = psus.groupby(level=0)
        se = np.sqrt((strata.var() * strata.size()).sum())
        if se / p > .30:
            return {"n": n, "pct": None, "ci": None}
        margin = self.critical * se / (p * (1-p))
        interval = [100 * expit(logit(p) + side * margin) for side in (-1, 1)]
        return {"n": n, "pct": round(float(p * 100), 1), "ci": [round(v, 1) for v in interval]}


def cohort_masks(df):
    diagnosed = df.DIBEV_A.eq(1)
    return {
        "Type 2": diagnosed & df.DIBTYPE_A.eq(2),
        "Type 1": diagnosed & df.DIBTYPE_A.eq(1),
        "Prediabetes only": df.DIBEV_A.eq(2) & df.PREDIB_A.eq(1),
        "All diagnosed": diagnosed,
    }


def site_estimates(survey, df, scope):
    never = df.PAIFRQ3M_A.eq(1)
    any_pain = df.PAIFRQ3M_A.isin([2, 3, 4])
    result = {}
    for site, (_, col) in SITES.items():
        eligible = scope & (never | (any_pain & df[col].isin(VALID)))
        result[site] = {
            "any": survey.estimate(eligible, any_pain & df[col].isin([2, 3, 4])),
            "aLot": survey.estimate(eligible, any_pain & df[col].eq(3)),
        }
    return result


def build(folder):
    payload = {
        "years": YEARS,
        "labels": {name: pair[0] for name, pair in SITES.items()},
        "profiles": {name: {"trend": {s: [] for s in SITES}} for name in SCOPES},
    }
    for year in YEARS:
        df = load_file(folder, year)
        survey = Survey(df)
        if year == 2019:
            full_sample = site_estimates(survey, df, pd.Series(True, index=df.index))
            expected = {"back": 39.0, "lower": 36.5, "upper": 30.7}
            for site, reference in expected.items():
                if abs(full_sample[site]["any"]["pct"] - reference) > .11:
                    raise ValueError(f"CDC benchmark {site}: {full_sample[site]['any']['pct']} vs {reference}")
            payload["benchmark2019"] = {site: full_sample[site]["any"]["pct"] for site in expected}
        for name, scope in cohort_masks(df).items():
            result = payload["profiles"][name]
            sites = site_estimates(survey, df, scope)
            for site, outcomes in sites.items():
                result["trend"][site].append(outcomes["any"]["pct"])
            if year == YEARS[-1]:
                screened = scope & df.PAIFRQ3M_A.isin(VALID)
                any_pain = df.PAIFRQ3M_A.isin([2, 3, 4])
                frequent = df.PAIFRQ3M_A.isin([3, 4])
                high_impact_valid = screened & (~frequent | df.PAIWKLM3M_A.isin(VALID))
                result.update({
                    "populationN": int(scope.sum()), "screenN": int(screened.sum()),
                    "any": survey.estimate(screened, any_pain),
                    "chronic": survey.estimate(screened, frequent),
                    "highImpact": survey.estimate(high_impact_valid, frequent & df.PAIWKLM3M_A.isin([3, 4])),
                    "sites": sites,
                })
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_directory", type=Path)
    parser.add_argument("output_module", type=Path)
    args = parser.parse_args()
    result = build(args.input_directory)
    args.output_module.write_text(
        "// Generated by nhis-pain.py from CDC NHIS Sample Adult public-use files.\n"
        "export const painData = " + json.dumps(result, ensure_ascii=False, indent=2) + ";\n"
    )
