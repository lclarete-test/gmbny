"""Rebuild fda-decisions.js from the FDA's public premarket decision archive.

Run: python fda_decisions.py /path/to/fda-decisions.js
Optional: --archive /path/to/pmn96cur.zip      (use an existing FDA bulk download)
          --through YYYY-MM-DD                 (last decision date, inclusive)
          --verify-api                         (compare IDs with openFDA by code)

The checked-in 2026 period ends October 31, the last complete month before
the research edition. The archive can change when FDA corrects a record.
Primary product codes cover the classifications listed for 21 CFR 862.1355,
862.1356 and 880.5730 on November 17, 2026.
"""
import argparse
import csv
from datetime import date, datetime
import io
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import zipfile

ARCHIVE_URL = "https://www.accessdata.fda.gov/premarket/ftparea/pmn96cur.zip"
OPENFDA = "https://api.fda.gov/device/510k.json"
START = date(2018, 1, 1)
CODES = {"QBJ", "QDK", "QDL", "QII", "QLG", "SAF", "SBH", "QFG", "QJI", "QJS"}
DECISIONS = {"SESE": "K", "DENG": "DEN"}


def get(url):
    request = Request(url, headers={"User-Agent": "Diabetes research dashboard"})
    with urlopen(request, timeout=45) as response:
        return response.read()


def records(raw_archive, through):
    matches = {}
    with zipfile.ZipFile(io.BytesIO(raw_archive)) as archive:
        with archive.open("pmn96cur.txt") as raw:
            rows = csv.DictReader(io.TextIOWrapper(raw, encoding="cp1252"), delimiter="|")
            for row in rows:
                code, decision = row["PRODUCTCODE"], row["DECISION"]
                if code not in CODES or decision not in DECISIONS:
                    continue
                decided = datetime.strptime(row["DECISIONDATE"], "%m/%d/%Y").date()
                if not START <= decided <= through:
                    continue
                application = row["KNUMBER"]
                if not application.startswith(DECISIONS[decision]):
                    raise ValueError(f"Unexpected application {application} for {decision}")
                record = [decided.isoformat(), application, code, row["DEVICENAME"].strip()]
                if application in matches and matches[application] != record:
                    raise ValueError(f"Conflicting records for {application}")
                matches[application] = record
    return sorted(matches.values())


def verify_openfda(rows, through):
    for code in sorted(CODES):
        search = f"product_code:{code} AND decision_date:[{START:%Y%m%d} TO {through:%Y%m%d}]"
        response = json.loads(get(OPENFDA + "?" + urlencode({"search": search, "limit": 1000})))
        if response["meta"]["results"]["total"] > len(response["results"]):
            raise ValueError(f"Incomplete openFDA response for {code}")
        api_ids = {r["k_number"] for r in response["results"] if r["decision_code"] in DECISIONS}
        archive_ids = {r[1] for r in rows if r[2] == code}
        if api_ids != archive_ids:
            raise ValueError(f"{code}: openFDA and bulk extract differ: {api_ids ^ archive_ids}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--through", type=date.fromisoformat, default=date(2026, 10, 31))
    parser.add_argument("--verify-api", action="store_true")
    args = parser.parse_args()
    raw = args.archive.read_bytes() if args.archive else get(ARCHIVE_URL)
    rows = records(raw, args.through)
    if args.verify_api:
        verify_openfda(rows, args.through)
    serialized = ",\n".join("  " + json.dumps(row, ensure_ascii=False) for row in rows)
    args.output.write_text(
        f"// FDA decision date, application number, primary product code, device name.\n"
        f"export const throughDate = '{args.through.isoformat()}';\n"
        f"export const decisions = [\n{serialized}\n];\n", encoding="utf-8"
    )
    print(f"{len(rows)} unique FDA decisions through {args.through}.")


if __name__ == "__main__":
    main()
