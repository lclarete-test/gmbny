"""Rebuild the November 2026 U.S. diabetes nonprofit roster with Python 3.10+.

For the original IRS files: python diabetes_nonprofits.py --cache ./irs-files --output ./snapshot
For the published roster: python diabetes_nonprofits.py --from-roster diabetes-nonprofits.csv --output ./snapshot
Input hashes pin the three mutable registry extracts and the four financial extracts.
This script writes public registry identifiers, classifications and return amounts only.
"""

import argparse
import bisect
import csv
import hashlib
import io
import json
import re
import shutil
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

REGISTRY_DATE = "2026-11-10"
FISCAL_YEAR = "2024"
JURISDICTIONS = set(
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN "
    "MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split()
)
NAME_PATTERN = re.compile(
    r"DIABET|\bT[12]D(?:M|S)?\b|\bJDRF\b|\bTYPE\s*(?:ONE|TWO|II?|[12])\b|\bINSULIN\b"
)
# All additional type/insulin names and all secondary-name-only results were reviewed.
# The excluded entities serve animals, a different disease or a workplace speaking club.
EXCLUSIONS = {
    "454519681": "Diabetic Cats in Need",
    "453859561": "Equine Cushing's and Insulin Resistance Group",
    "320241819": "APS Type 1 Foundation (autoimmune polyendocrine syndrome type 1)",
    "901249600": "Toastmasters club at Medtronic Diabetes",
}
REGIONS = [f"eo{region}.csv" for region in (1, 2, 3)]
FINANCES = [f"{year}eoextract{form}.zip" for year in ("24", "25") for form in ("990", "990EZ")]
IRS_FILES = "https://www.irs.gov/pub/irs-soi/"
NTEE = {
    "G": "Disease associations and medical disciplines",
    "H": "Medical research",
    "E": "Health care",
    "T": "Philanthropy and grantmaking",
    "P": "Human services",
    "B": "Education, youth and recreation",
    "O": "Education, youth and recreation",
    "N": "Education, youth and recreation",
}
SIZE_BANDS = ["Under $100,000", "$100,000 to <$1 million", "$1 million to <$10 million", "$10 million or more"]
CHECKSUMS = {'24eoextract990.zip': 'dc3898cad2007fdb194d73281c3eb625773ea90626c22ca167e842d205a49d10',
 '24eoextract990EZ.zip': 'da6a12f42c300031b33a624f6e3ecee108bc25113a4262384ea65747fbd61313',
 '25eoextract990.zip': 'd762918a76ec6eefc62dab072d3d82a82e0a8819328b6b6bbffd94f2e2f79a8b',
 '25eoextract990EZ.zip': '723d958d7b737d29a777e6d76061d7f566d05fd645d506b7ec72edd5f233d117',
 'eo1.csv': '5d1047c15cb6109b73ed244da97961b92a3ec122ac4419f354d248dc059df4e6',
 'eo2.csv': '46db809791e9cfe785c74fd6028ed18612f8a639edf763142c017cce3446ccfa',
 'eo3.csv': '4902eab594c4be7312192bb03ee5082580ca208bd4f6b9b5a6bcfc009c8f27f4'}

def source_file(cache, name):
    path = cache / name
    if not path.exists():
        temporary = path.with_suffix(path.suffix + ".download")
        with urllib.request.urlopen(IRS_FILES + name, timeout=180) as response, temporary.open("wb") as dest:
            shutil.copyfileobj(response, dest)
        temporary.replace(path)
    checksum = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            checksum.update(block)
    if name in CHECKSUMS and checksum.hexdigest() != CHECKSUMS[name]:
        raise ValueError(f"{name} differs from the November 2026 analysis. Supply the archived copy in --cache.")
    return path

def registry(paths):
    records = {}
    for path in paths:
        with path.open(encoding="utf-8-sig", newline="") as source:
            for row in csv.DictReader(source):
                if row["SUBSECTION"] != "03" or row["STATUS"] != "01" or row["STATE"] not in JURISDICTIONS:
                    continue
                legal, other = row["NAME"], row["SORT_NAME"]
                if not (NAME_PATTERN.search(legal) or NAME_PATTERN.search(other)):
                    continue
                ein = row["EIN"]
                if ein in EXCLUSIONS:
                    continue
                if ein in records:
                    raise ValueError(f"Duplicate registry EIN {ein}")
                records[ein] = {
                    "ein": ein, "registered_name": legal, "registered_secondary_name": other,
                    "state_dc": row["STATE"], "ntee": row["NTEE_CD"],
                    "matched_field": "Registered name" if NAME_PATTERN.search(legal) else "Secondary name",
                    "fiscal_period_end": "", "total_revenue_usd": "", "irs_extract": "",
                    "financial_status": "No comparable return in the selected extracts"
                }
    return records

def add_finances(records, paths):
    by_ein = defaultdict(set)
    for path in paths:
        ez = path.stem.endswith("EZ")
        period_column, revenue_column = ("taxpd", "totrevnue") if ez else ("tax_pd", "totrevenue")
        with zipfile.ZipFile(path) as archive, archive.open(archive.namelist()[0]) as binary:
            reader = csv.reader(io.TextIOWrapper(binary, encoding="utf-8-sig", newline=""))
            header = next(reader)
            e, p, r, s = [header.index(name) for name in ["EIN", period_column, revenue_column, "subseccd"]]
            for row in reader:
                ein = row[e].zfill(9)
                if ein not in records or row[s].zfill(2) != "03" or not row[p].startswith(FISCAL_YEAR):
                    continue
                if row[r].strip():
                    by_ein[ein].add((row[p], int(row[r]), path.name))
    ambiguous = []
    for ein, returns in by_ein.items():
        pairs = {(period, value) for period, value, _ in returns}
        if len(pairs) != 1:
            ambiguous.append(ein)
            records[ein]["financial_status"] = "Multiple periods or conflicting amounts"
            records[ein]["irs_extract"] = " | ".join(sorted({name for _, _, name in returns}))
            continue
        period, value = next(iter(pairs))
        records[ein].update(fiscal_period_end=period, total_revenue_usd=value,
                            irs_extract=" | ".join(sorted({name for _, _, name in returns})),
                            financial_status="Comparable FY2024 return")
    return ambiguous

def summarize(records, ambiguous):
    rows = records.values()
    divisions = Counter(NTEE.get(r["ntee"][:1], "Other fields" if r["ntee"] else "No classification listed") for r in rows)
    states = Counter(r["state_dc"] for r in rows)
    financed = [r for r in rows if r["total_revenue_usd"] != ""]
    ranked = sorted(financed, key=lambda r: (-r["total_revenue_usd"], r["ein"]))
    sizes = Counter(SIZE_BANDS[bisect.bisect_right([100000, 1000000, 10000000], r["total_revenue_usd"])] for r in financed)
    return {
        "registryDate": REGISTRY_DATE, "fiscalYear": FISCAL_YEAR, "count": len(records),
        "statesAndDc": len(states), "includesDc": "DC" in states,
        "financialCount": len(financed), "ambiguousReturns": len(ambiguous),
        "headquarters": sorted(states.items(), key=lambda pair: (-pair[1], pair[0])),
        "zeroReturns": sum(r["total_revenue_usd"] == 0 for r in financed),
        "roles": sorted(divisions.items(), key=lambda pair: (pair[0] in {"Other fields", "No classification listed"}, -pair[1], pair[0])),
        "sizeBands": [[band, sizes[band]] for band in SIZE_BANDS],
        "ranking": [{k: r[k] for k in ("ein", "registered_name", "state_dc", "fiscal_period_end", "total_revenue_usd")}
                    for r in ranked[:5]],
    }

def read_roster(path):
    records = {}
    ambiguous = []
    with path.open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            ein = row["ein"]
            if ein in records or row["state_dc"] not in JURISDICTIONS or not re.fullmatch(r"[0-9]{9}", ein):
                raise ValueError(f"Invalid roster record {ein}")
            if row["total_revenue_usd"] != "":
                row["total_revenue_usd"] = int(row["total_revenue_usd"])
            if row["financial_status"] == "Multiple periods or conflicting amounts":
                ambiguous.append(ein)
            records[ein] = row
    return records, ambiguous

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--cache", type=Path, help="Original domestic BMF and financial extracts")
    source.add_argument("--from-roster", type=Path, help="Replay the published frozen CSV without downloads")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(exist_ok=True, parents=True)
    if args.from_roster:
        records, ambiguous = read_roster(args.from_roster)
    else:
        args.cache.mkdir(exist_ok=True, parents=True)
        records = registry([source_file(args.cache, name) for name in REGIONS])
        ambiguous = add_finances(records, [source_file(args.cache, name) for name in FINANCES])
    summary = summarize(records, ambiguous)
    with (args.output / "diabetes-nonprofits.csv").open("w", encoding="utf-8", newline="") as dest:
        writer = csv.DictWriter(dest, fieldnames=list(next(iter(records.values())).keys()))
        writer.writeheader()
        writer.writerows(records[ein] for ein in sorted(records))
    module = "export const nonprofitSnapshot = " + json.dumps(summary, indent=2) + ";\n"
    (args.output / "nonprofit-data.js").write_text(module, encoding="utf-8")
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
