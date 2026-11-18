"""Build the 2021 CDC diabetes-attributable direct medical spending map.

Usage: python state_payer_costs.py OUTPUT.json [--input extracted-cdc-rows.json]
No credentials or external dependencies are needed. Published totals are in
millions of 2021 dollars. Per-person amounts use the CDC denominator for each
payer. The original national estimates are retained alongside all jurisdictions.
"""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DATASET = "https://data.cdc.gov/d/58s6-s24x"
METHOD = "https://www.cdc.gov/diabetes/burden-toolkit/docs/technical_documentation.pdf"
REPORT = "https://doi.org/10.2337/dc24-0832"
MAP = "https://www.cdc.gov/diabetes/burden-toolkit/state-burden-toolkit-economic-burden.html?cove-tab=1"
PERSPECTIVE = MAP.replace("tab=1", "tab=3")
FIPS = dict(pair.split(":") for pair in (
    "01:AL 02:AK 04:AZ 05:AR 06:CA 08:CO 09:CT 10:DE 11:DC 12:FL 13:GA "
    "15:HI 16:ID 17:IL 18:IN 19:IA 20:KS 21:KY 22:LA 23:ME 24:MD 25:MA "
    "26:MI 27:MN 28:MS 29:MO 30:MT 31:NE 32:NV 33:NH 34:NJ 35:NM 36:NY "
    "37:NC 38:ND 39:OH 40:OK 41:OR 42:PA 44:RI 45:SC 46:SD 47:TN 48:TX "
    "49:UT 50:VT 51:VA 53:WA 54:WV 55:WI 56:WY"
).split())
FIELDS = ("lower_location,fips,year,short_indicator_text,"
          "stratification_group2,stratification3,data_type,data_value")
FILTER = ("year='2021' AND stratification_group1='Overall' AND "
          "stratification_group2_label='Total' AND "
          "short_indicator_text IN ('By Payer','Private Insurers')")
METRICS = {
    "Total Cost (Dollars in Millions)": 0,
    "Per Person with Diabetes (Dollars)": 1,
    "Estimated Total Cost (Dollars in Millions)": 0,
    "Estimated Cost Per Person (Dollars)": 1,
}
PAYERS = {"All Payers":"all", "Medicare":"medicare", "Medicaid":"medicaid", "Other":"other"}


def download():
    query = urlencode({"$select": FIELDS, "$where": FILTER, "$limit": 1000,
                       "$order":"lower_location,short_indicator_text,stratification3,data_type"})
    request = Request("https://data.cdc.gov/resource/58s6-s24x.json?" + query,
                      headers={"User-Agent": "US-diabetes-research-dashboard"})
    with urlopen(request, timeout=60) as response:
        return json.load(response)


def build(rows):
    out = {}
    for row in rows:
        if row["year"] != "2021" or row["stratification_group2"] != "19+":
            raise ValueError("Unexpected year or age group: " + str(row))
        state = "US" if row["lower_location"] == "United States" else FIPS[row["fips"]]
        payer = ("private" if row["short_indicator_text"] == "Private Insurers"
                 else PAYERS[row["stratification3"]])
        slot = METRICS[row["data_type"]]
        pair = out.setdefault(state, {}).setdefault(payer, [None, None])
        value = float(row["data_value"])
        if pair[slot] is not None or not value > 0:
            raise ValueError("Duplicate or nonpositive estimate: " + str(row))
        pair[slot] = value if slot == 0 else int(row["data_value"])
    expected = set(FIPS.values()) | {"US"}
    if set(out) != expected:
        raise ValueError("Missing or unexpected locations")
    for state, values in out.items():
        if set(values) != set(PAYERS.values()) | {"private"} or any(None in p for p in values.values()):
            raise ValueError("Incomplete payer coverage for " + state)
        total = values["all"][0]
        components = sum(values[p][0] for p in ("medicare", "medicaid", "other"))
        if abs(total - components) > 0.201 or values["private"][0] > values["other"][0]:
            raise ValueError("Direct cost components do not reconcile for " + state)
    for p in out["US"]:
        state_sum = sum(out[s][p][0] for s in FIPS.values())
        if abs(state_sum - out["US"][p][0]) > 52 * 0.05:
            raise ValueError("State totals differ from the national estimate for " + p)
    return {
        "year": 2021,
        "age": "Adults aged 19 and older with diagnosed diabetes",
        "unit": ["Millions of 2021 U.S. dollars", "2021 U.S. dollars per person"],
        "source": DATASET,
        "sources": [
            ["CDC · State economic burden data", DATASET],
            ["CDC · Medical costs by payer", MAP],
            ["CDC · Private insurer perspective", PERSPECTIVE],
            ["CDC · Economic burden methods, sections 2.2.2 and 2.2.4", METHOD],
            ["Khavjou et al. · State diabetes costs in 2021", REPORT],
        ],
        "payers": {
            "all": {"label": "All payers", "basis": "Per adult with diagnosed diabetes"},
            "medicare": {"label": "Medicare", "basis": "Per Medicare beneficiary with diagnosed diabetes"},
            "medicaid": {"label": "Medicaid", "basis": "Per Medicaid beneficiary with diagnosed diabetes"},
            "other": {"label": "Other payers", "basis": "Per adult with diagnosed diabetes"},
            "private": {"label": "Private insurers", "basis": "Per privately insured, noninstitutionalized adult with diagnosed diabetes"},
        },
        "methods": [
            "CDC models annual direct medical spending attributable to diagnosed diabetes, including the cost of associated complications. Totals use millions of 2021 dollars. The national row is the published estimate.",
            "Medicare, Medicaid and other payers cover the total to rounding. Other payers include private plans, military insurance, out-of-pocket payments and additional sources. CDC reports household out-of-pocket spending within this group.",
            "The separate private insurer estimate covers noninstitutionalized adults. CDC applies each state’s private share to other-payer spending after excluding nursing homes. Private insurer spending overlaps the other-payer total.",
            "The Medicare and Medicaid per-person estimates use beneficiaries with diagnosed diabetes in the respective program. Other-payer costs use the full diabetes population. Private costs use privately insured adults with diagnosed diabetes in the community. A person can have multiple forms of coverage.",
        ],
        "locations": {state: {p: out[state][p] for p in (*PAYERS.values(), "private")}
                      for state in sorted(out)},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--input", type=Path)
    options = parser.parse_args()
    records = json.loads(options.input.read_text()) if options.input else download()
    result = build(records)
    options.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
