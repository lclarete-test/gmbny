"""Add crude 2024 all-age percentages to Wang et al.'s state type 1 case counts.

Usage: python type1_resident_rates.py counts.json enriched.json --cache downloads
Input: output of type1_modeled_cases.py. Output can be used directly by the map.
"""
import argparse
import csv
import json
from pathlib import Path

from state_conditions import CODES, download

CENSUS_URL = 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/state/totals/NST-EST2024-ALLDATA.csv'
LAYOUT_URL = 'https://www2.census.gov/programs-surveys/popest/technical-documentation/file-layouts/2020-2024/NST-EST2024-ALLDATA.pdf'
RATE_NOTE = ('All-age percentages divide each published 2024 modeled case count by the Census Bureau’s July 1, 2024 '
             'resident population (Vintage 2024). The bounds divide the model’s published count bounds by the same denominator. '
             'These are crude estimates. States with different age distributions can have different crude percentages.')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('counts', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--cache', type=Path, default=Path('downloads'))
    args = parser.parse_args()
    args.cache.mkdir(exist_ok=True, parents=True)
    path = download(args.cache, 'NST-EST2024-ALLDATA.csv', CENSUS_URL)
    model = json.loads(args.counts.read_bytes())
    assert model['period'] == '2024'
    populations = {}
    with path.open(encoding='latin-1', newline='') as stream:
        for row in csv.DictReader(stream):
            level = int(row['SUMLEV'])
            if level == 10:
                region = 'US'
            elif level == 40 and int(row['STATE']) in CODES:
                region = CODES[int(row['STATE'])][0]
            else:
                continue
            assert region not in populations
            populations[region] = int(row['POPESTIMATE2024'])
    assert set(populations) == set(model['states']) | {'US'}
    assert sum(v for k,v in populations.items() if k != 'US') == populations['US']
    for region, item in {**model['states'], 'US':model['national']}.items():
        total = populations[region]
        assert 0 < item['ci'][0] <= item['value'] <= item['ci'][1] < total
        item['residents'] = total
        item['percent'] = round(100 * item['value'] / total, 5)
        item['percentCI'] = [round(100 * n / total, 5) for n in item['ci']]
    for source in [['U.S. Census Bureau · July 2024 resident population by state (CSV)',CENSUS_URL],
                   ['U.S. Census Bureau · Vintage 2024 data definitions',LAYOUT_URL]]:
        if source not in model['sources']:
            model['sources'].append(source)
    if RATE_NOTE not in model['notes']:
        model['notes'].append(RATE_NOTE)
    args.output.write_text(json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n')
if __name__ == '__main__':
    main()
