"""Rebuild annual diabetes-linked medical service estimates from the public 2021–22 MEPS.

Run: python treatment_services.py --cache /path/to/cache --output treatment-service-data.js
Requires pandas. ZIP files stay in the cache. Only aggregate estimates leave the script.
"""
import argparse
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

import pandas as pd

BASE = "https://meps.ahrq.gov/mepsweb/data_files/pufs"
DIABETES_CODES = {"END002", "END003", "END004", "END005", "END006"}
YEARS = {
    2021: ("h229", "h231", "h233", 110.240 / 107.572),
    2022: ("h239", "h241", "h243", 1.0),
}
# HC-036 provides common strata and PSUs for pooled MEPS years.
DESIGN = ["STRA9624", "PSU9624"]
SERVICES = {
    "office": ("g", 1, "OB"),
    "home": ("h", 7, "HH"),
    "inpatient": ("d", 4, "IP"),
    "outpatient": ("f", 2, "OP"),
    "emergency": ("e", 3, "ER"),
}
HOSPITAL_SERVICES = {"inpatient", "outpatient", "emergency"}


def read_stata(cache, code, columns=None):
    archive = cache / (code + ".zip")
    if not archive.is_file():
        name = {"h229i": "h229if1dta.zip", "h036": "h36u24dta.zip"}.get(code, code + "dta.zip")
        request = Request(f"{BASE}/{code}/{name}", headers={"User-Agent": "Diabetes research dashboard"})
        with urlopen(request, timeout=90) as response:
            data = response.read()
        with ZipFile(BytesIO(data)) as downloaded:
            if downloaded.testzip() is not None:
                raise ValueError(f"Incomplete archive for {code}")
        archive.write_bytes(data)
    with ZipFile(archive) as files:
        members = [name for name in files.namelist() if name.lower().endswith(".dta")]
        if len(members) != 1:
            raise ValueError(f"Unexpected members in {archive}")
        return pd.read_stata(BytesIO(files.read(members[0])), columns=columns, convert_categoricals=False)


def estimate(values, respondents, pooled_psus, denominator=None):
    """Annual total or ratio and Taylor-linearized standard error using the pooled design."""
    point = values.sum()
    linear = values
    if denominator is not None:
        total = denominator.sum()
        point /= total
        linear = (values - point * denominator) / total
    scores = respondents[DESIGN].copy()
    scores["linear"] = linear
    cluster = scores.groupby(DESIGN).linear.sum().reindex(pooled_psus, fill_value=0)
    by_stratum = cluster.groupby(level=0)
    number_psus = by_stratum.count()
    if number_psus.min() < 2:
        raise ValueError("Unexpected single-PSU stratum in the pooled design")
    se = (by_stratum.var(ddof=1) * number_psus).sum() ** 0.5
    positive_people = respondents.loc[values.gt(0), "DUPERSID"].nunique()
    return {
        "value": round(point, 6),
        "se": round(se, 6),
        "rse": round(se / point, 4) if point else None,
        "respondents": int(positive_people),
    }


def medical_events(cache, participants):
    annual = {key: [] for key in SERVICES}
    for year, (prefix, condition_file, person_file, inflation) in YEARS.items():
        yy = str(year)[-2:]
        wt = f"PERWT{yy}F"
        conditions = read_stata(cache, condition_file)
        diabetes = conditions.filter(regex=r"^CCSR\dX$").isin(DIABETES_CODES).any(axis=1)
        conditions = conditions.loc[diabetes, ["CONDIDX", "DUPERSID"]]
        links = read_stata(cache, prefix + "i", ["CONDIDX", "DUPERSID", "EVNTIDX", "EVENTYPE"])
        associated = links.merge(conditions, on=["CONDIDX", "DUPERSID"], validate="many_to_one")
        people = read_stata(cache, person_file, ["DUPERSID", "AGELAST", wt])
        adults = people.loc[(people.AGELAST >= 18) & (people[wt] > 0)]
        adults = adults.merge(participants, on="DUPERSID", validate="one_to_one")

        for key, (suffix, event_type, payment_prefix) in SERVICES.items():
            ids = associated.loc[associated.EVENTYPE.eq(event_type), ["DUPERSID", "EVNTIDX"]].drop_duplicates()
            payment = f"{payment_prefix}XP{yy}X"
            columns = ["EVNTIDX", "DUPERSID", payment]
            if key == "office":
                columns.extend(["SEEDOC_M18", "DRSPLTY_M18"])
            elif key == "home":
                columns.extend(["SELFAGEN", "HHTYPE"])
            else:
                columns.extend(f"{payment_prefix}{code}XP{yy}X" for code in ["F", "D"])
            if key in {"office", "outpatient"}:
                columns.extend(["LABTEST_M18", "TELEHEALTHFLAG"])
            events = read_stata(cache, prefix + suffix, columns)
            df = events.merge(ids, on=["DUPERSID", "EVNTIDX"], validate="one_to_one")
            df = df.merge(adults, on="DUPERSID", validate="many_to_one")
            if key == "home":
                # The brief selects paid agencies and independent home health providers.
                # Family, friend and unpaid volunteer records have inapplicable spending.
                df = df.loc[df.HHTYPE.eq(4)].copy()
            if (df[payment] < 0).any():
                raise ValueError(f"Negative {key} event payment")
            weight = df[wt] / len(YEARS)
            df["weightedDollars"] = df[payment] * weight * inflation
            df["weightedEvents"] = weight
            if key in HOSPITAL_SERVICES:
                for part, code in [("facility", "F"), ("physicians", "D")]:
                    df[part] = df[f"{payment_prefix}{code}XP{yy}X"] * weight * inflation
                if (df.weightedDollars - df.facility - df.physicians).abs().max() > 1e-4:
                    raise ValueError(f"Inconsistent {key} facility and professional payments")
            annual[key].append(df)
    return {key: pd.concat(frames, ignore_index=True) for key, frames in annual.items()}


def assemble(cache):
    participants = read_stata(cache, "h036", ["DUPERSID", *DESIGN, "INH233", "INH243"])
    participants = participants.loc[participants[["INH233", "INH243"]].eq(1).any(axis=1)]
    all_psus = participants.groupby(DESIGN).size().index
    output = {}
    for key, df in medical_events(cache, participants).items():
        dollars = df.weightedDollars
        totals = {"spend": estimate(dollars, df, all_psus)}
        if key == "office":
            reported_specialty = df.SEEDOC_M18.eq(1) & df.DRSPLTY_M18.gt(0)
            family = reported_specialty & df.DRSPLTY_M18.isin([6, 8, 14])
            endocrine = reported_specialty & df.DRSPLTY_M18.eq(5)
            components = {
                "Family, general and internal medicine": dollars * family,
                "Endocrinology": dollars * endocrine,
                "Other physician specialties": dollars * (reported_specialty & ~family & ~endocrine),
                "Other providers or specialty unreported": dollars * ~reported_specialty,
            }
        elif key == "home":
            components = {
                "Agency, hospital or nursing home staff": dollars * df.SELFAGEN.eq(1),
                "Self-employed home health workers": dollars * df.SELFAGEN.eq(2),
            }
        else:
            components = {"Hospital facility": df.facility, "Separately billed physicians": df.physicians}

        if key in {"office", "outpatient"}:
            lab = df.LABTEST_M18
            # 95 = no listed services. -1 = telehealth, where the question was skipped.
            if not lab.isin([-8, -7, -1, 1, 2, 95]).all() or not lab.eq(-1).eq(df.TELEHEALTHFLAG.eq(1)).all():
                raise ValueError(f"Unexpected answer code or questionnaire universe for {key} lab tests")
            lab_visits = df.weightedEvents * lab.eq(1)
            totals["knownLabCount"] = estimate(lab_visits, df, all_psus)
            totals["knownLabRate"] = estimate(lab_visits, df, all_psus, df.weightedEvents * lab.isin([1, 2, 95]))

        breakdown = {name: estimate(amounts, df, all_psus) for name, amounts in components.items()}
        if abs(sum(x["value"] for x in breakdown.values()) - totals["spend"]["value"]) > 1:
            raise ValueError(f"Unreconciled component payments for {key}")
        # Estimates with a small sample or high relative uncertainty are not displayed.
        for item in breakdown.values():
            if item["respondents"] < 30 or item["rse"] > 0.30:
                item["value"] = None
                item["se"] = None
        output[key] = {**totals, "components": breakdown}
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--output", default="treatment-service-data.js", type=Path)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    data = assemble(args.cache)
    header = "// Weighted annual diabetes treatment payments in 2022 dollars. Generated by analysis/treatment_services.py.\n"
    args.output.write_text(header + "export const serviceData = " + json.dumps(data, indent=2) + ";\n")
