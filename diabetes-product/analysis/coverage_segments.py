"""Calculate NHIS patient coverage segments from annual public-use Sample Adult files.

Requires numpy, pandas and scipy. Run with the directory containing the CDC files,
named 2019.zip through 2025.zip, then the output JSON path as the two arguments.
Estimates use each full annual file separately, with no pooling or linkage.
"""
import argparse
import json
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.special import expit, logit
from scipy.stats import t

START_YEAR, END_YEAR = 2019, 2025
SCOPE_KEYS = ("All diagnosed", "Type 2", "Type 1", "Prediabetes only")
SEGMENTS = {
    "medicare": "Medicare without Medicaid",
    "private": "Private insurance, no public plan",
    "dual": "Medicare and Medicaid",
    "medicaid": "Medicaid without Medicare",
    "uninsured": "Uninsured",
    "other": "Other or mixed coverage",
    "otherUninsured": "Other coverage or uninsured",
}
BASE_SEGMENTS = ["medicare", "private", "dual", "medicaid", "uninsured", "other"]
SMALL_SCOPE_SEGMENTS = ["medicare", "private", "dual", "medicaid", "otherUninsured"]
PUBLIC_OTHER = ["MILITARY_A", "OTHPUB_A", "OTHGOV_A", "CHIP_A"]
BASE_COLUMNS = ["PSTRAT", "PPSU", "WTFA_A", "DIBEV_A", "DIBTYPE_A", "PREDIB_A",
                "NOTCOV_A", "MEDICAID_A", "MEDICARE_A", "PRIVATE_A", *PUBLIC_OTHER]
# id: label, source, positive codes, valid codes. RXDG12M_A is for any prescription.
TRAITS = {
    "age65": ("Age 65 or older", "AGEP_A", range(65, 86), range(18, 86)),
    "women": ("Women", "SEX_A", [2], [1, 2]),
    "white": ("Non-Hispanic White, single race", "HISPALLP_A", [2], range(1, 8)),
    "black": ("Non-Hispanic Black, single race", "HISPALLP_A", [3], range(1, 8)),
    "hispanic": ("Hispanic, any race", "HISPALLP_A", [1], range(1, 8)),
    "belowPoverty": ("Family income below the poverty threshold", "RATCAT_A", [1, 2, 3], range(1, 15)),
    "college": ("Bachelor’s degree or higher", "EDUCP_A", [8, 9, 10], range(1, 11)),
    "insulin": ("Currently uses insulin", "DIBINS_A", [1], [1, 2]),
    "oral": ("Currently takes pills to lower blood sugar", "DIBPILL_A", [1], [1, 2]),
    "injectables": ("Other injections for blood sugar or weight loss", "DIBGLP_A", [1], [1, 2]),
    "usualPlace": ("Has a usual place for care", "USUALPL_A", [1, 3], [1, 2, 3]),
    "unfilledRx": ("Went without a prescription due to cost", "RXDG12M_A", [1], [1, 2]),
}
DOC_ROOT = "https://www.cdc.gov/nchs/nhis/documentation"
FTP_ROOT = "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Dataset_Documentation/NHIS/2025"
SOURCES = [
    ["CDC NHIS · 2025 public files and questionnaire", f"{DOC_ROOT}/2025-nhis.html"],
    ["NCHS · 2025 adult codebook", f"{FTP_ROOT}/adult-codebook.pdf"],
    ["NCHS · 2025 survey design and weights", f"{FTP_ROOT}/srvydesc-508.pdf"],
    ["CDC NHIS · 2020 cross-sectional analytic guidance", f"{DOC_ROOT}/2020-nhis.html"],
]
NOTES = [
    "Percentages are survey-weighted for the U.S. civilian noninstitutionalized population aged 18 or older. Coverage describes the interview date. A respondent appears in one coverage segment per year.",
    "All diagnosed includes other or unknown diabetes type. The prediabetes group reported having been told they had prediabetes and reported no diagnosed diabetes. Counts labeled n are unweighted respondents.",
    "Medicare and Medicaid are identified first, including people with supplemental coverage. Medicare without Medicaid and Medicaid without Medicare can each include other plans. The private segment has no Medicare, Medicaid, CHIP, military, state-sponsored or other government coverage. Other or mixed coverage includes the remaining insured people, including military/state coverage with or without private insurance. Uninsured uses the NHIS NOTCOV_A recode. Undetermined coverage is excluded from the segment denominator.",
    "For type 1, other coverage and uninsured are combined in every year to avoid reporting very small individual cells. Components may differ from 100% by 0.1 or 0.2 percentage points due to rounding.",
    "Shares use WTFA_A. The 95% confidence intervals are logit-transformed, using design-based Taylor variance, full-file PSTRAT and PPSU, and a t critical value with survey-design degrees of freedom. Estimates with a denominator below 30, fewer than 10 observed events or fewer than 10 nonevents are withheld. These are dashboard precision rules.",
    "The years represent national cross-sections. In 2020 the pandemic changed interview procedures. NCHS's 2020 annual Sample Adult file and final annual weight support separate annual estimates. The 2025 annual file excludes the December sample because of a lapse in federal funding.",
    "Within-segment characteristics use valid responses to each item. Medicine questions include people with diabetes and people with reported prediabetes. The non-insulin injectable question includes use for weight loss or lowering blood sugar. Medication affordability refers to any needed prescription in the prior year. Race composition describes the coverage segment and does not measure access to a device. Family poverty status uses the public adult file’s first imputation.",
]


def load_year(folder, year):
    columns = set(BASE_COLUMNS)
    if year == END_YEAR:
        columns.update(value[1] for value in TRAITS.values())
    with zipfile.ZipFile(folder / f"{year}.zip") as archive:
        csv_name = next(n for n in archive.namelist() if n.lower().endswith(".csv"))
        with archive.open(csv_name) as file:
            df = pd.read_csv(file, usecols=list(columns))
    return df.loc[df["WTFA_A"].gt(0)].reset_index(drop=True)


def coverage(df):
    insured = df["NOTCOV_A"].eq(2)
    medicare = df["MEDICARE_A"]
    medicaid = df["MEDICAID_A"]
    private = df["PRIVATE_A"]
    public = df[PUBLIC_OTHER]
    has_medicare = medicare.isin([1, 2])
    has_medicaid = medicaid.isin([1, 2])
    neither = insured & medicare.eq(3) & medicaid.eq(3)

    groups = pd.Series(pd.NA, index=df.index, dtype="string")
    groups.loc[df["NOTCOV_A"].eq(1)] = "uninsured"
    groups.loc[insured & has_medicare & has_medicaid] = "dual"
    groups.loc[insured & has_medicare & medicaid.eq(3)] = "medicare"
    groups.loc[insured & has_medicaid & medicare.eq(3)] = "medicaid"
    groups.loc[neither & private.isin([1, 2]) & public.eq(3).all(axis=1)] = "private"
    groups.loc[neither & (private.eq(3) | public.isin([1, 2]).any(axis=1))] = "other"
    return groups


def scope_masks(df):
    diabetes = df["DIBEV_A"].eq(1)
    return {
        "All diagnosed": diabetes,
        "Type 2": diabetes & df["DIBTYPE_A"].eq(2),
        "Type 1": diabetes & df["DIBTYPE_A"].eq(1),
        "Prediabetes only": df["DIBEV_A"].eq(2) & df["PREDIB_A"].eq(1),
    }


def design_interval(df, denominator, numerator, proportion):
    """Taylor linearization for a survey domain ratio, retaining zero-contribution PSUs."""
    weight = df["WTFA_A"]
    total = weight[denominator].sum()
    linearized = weight * (numerator.astype(float) - denominator.astype(float) * proportion) / total
    clusters = linearized.groupby([df["PSTRAT"], df["PPSU"]]).sum()
    strata = clusters.groupby(level=0)
    counts = strata.size()
    if counts.min() < 2:
        raise ValueError("A full-sample design stratum has fewer than two PSUs.")
    variance = (strata.var(ddof=1) * counts).sum()
    critical = t.ppf(0.975, int((counts - 1).sum()))
    margin = critical * np.sqrt(variance) / (proportion * (1 - proportion))
    return [round(float(100 * expit(logit(proportion) + sign * margin)), 1) for sign in (-1, 1)]


def estimate(df, denominator, positive, include_ci=False):
    numerator = denominator & positive
    n_denom, n_positive = int(denominator.sum()), int(numerator.sum())
    if n_denom < 30 or min(n_positive, n_denom - n_positive) < 10:
        return None, None
    p = df.loc[numerator, "WTFA_A"].sum() / df.loc[denominator, "WTFA_A"].sum()
    ci = design_interval(df, denominator, numerator, p) if include_ci else None
    return round(float(100 * p), 1), ci


def calculate(folder):
    result = {
        "year": END_YEAR,
        "years": list(range(START_YEAR, END_YEAR + 1)),
        "segmentLabels": SEGMENTS,
        "traitLabels": {k: v[0] for k, v in TRAITS.items()},
        "scopes": {s: {"order": SMALL_SCOPE_SEGMENTS if s == "Type 1" else BASE_SEGMENTS, "trend": []}
                   for s in SCOPE_KEYS},
        "notes": NOTES,
        "sources": SOURCES,
    }
    for year in result["years"]:
        df = load_year(folder, year)
        groups = coverage(df)
        for scope, in_scope in scope_masks(df).items():
            section = result["scopes"][scope]
            grouped = groups.replace({"other": "otherUninsured", "uninsured": "otherUninsured"}) if scope == "Type 1" else groups
            valid = in_scope & grouped.notna()
            latest = year == END_YEAR
            if latest:
                section["sample"] = int(in_scope.sum())
                section["coverageSample"] = int(valid.sum())
                section["excludedCoverage"] = int((in_scope & ~valid).sum())
                section["weightedAdults"] = round(float(df.loc[valid, "WTFA_A"].sum()))
                section["segments"] = {}
            annual = []
            for key in section["order"]:
                in_segment = valid & grouped.eq(key).fillna(False)
                pct, interval = estimate(df, valid, in_segment, include_ci=latest)
                annual.append(pct)
                if latest:
                    traits = {}
                    for trait, (_, column, positive, valid_values) in TRAITS.items():
                        mask = in_segment & df[column].isin(valid_values)
                        traits[trait] = estimate(df, mask, df[column].isin(positive))[0]
                    section["segments"][key] = {
                        "share": pct, "ci": interval, "n": int(in_segment.sum()), "traits": traits,
                    }
            if latest:
                assert int(valid.sum()) == sum(v["n"] for v in section["segments"].values())
            section["trend"].append(annual)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_directory", type=Path)
    parser.add_argument("output_json", type=Path)
    args = parser.parse_args()
    output = calculate(args.input_directory)
    args.output_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
