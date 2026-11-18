"""Append 2025 CDC USDSS diagnosed-diabetes rates to the dashboard's state series.

Run with dashboard/analysis on PYTHONPATH. The adjacent profile file supplies
figures from the new year while the existing 2024 state profiles remain intact.
"""
import argparse
import json
from pathlib import Path

from state_conditions import CODES, DATASET, TYPES_METHOD, query_usdss


STATES = {entry[0] for entry in CODES.values()}
AGGREGATES = {'age': 'Age-Adjusted', 'race': 'All', 'sex': 'All', 'education': 'All'}
SOURCE = "indicator='Diagnosed Diabetes' AND population='Adults Aged 18+ Years'"
SUBGROUPS = {'sex': 'Sex', 'race': 'Race and ethnicity', 'education': 'Education'}


def interval(row):
    if row.get('lowerlimit') is None or row.get('upperlimit') is None:
        return None
    return [float(row['lowerlimit']), float(row['upperlimit'])]


def validate_overlap(cache, series, profiles):
    dimensions = ' AND '.join(f"{k}='{v}'" for k, v in AGGREGATES.items())
    rows = query_usdss(cache, 'official-check-2024.json', f'{SOURCE} AND year=2024 AND {dimensions}')
    by_state = {r['state']: r['estimate'] for r in series if r['year'] == 2024}
    for r in rows:
        state = r['state']
        if state not in STATES and state != 'State Median':
            continue
        value = float(r['estimate']) if r.get('estimate') else None
        if state in STATES and profiles[state].get('adjusted') != value:
            raise ValueError(f'Existing 2024 profile differs from the published rate for {state}')
        published = by_state.get('All' if state == 'State Median' else state)
        if (published is None) != (value is None):
            raise ValueError(f'Missing-value mismatch for {state} in 2024')
        if value is not None and abs(published - value) > 0.050001:
            raise ValueError(f'Dashboard and source disagree beyond one-decimal rounding for {state}')


def profile(rowset):
    record = {'adjusted': None, 'adjustedCI': None, 'crude': None, 'crudeCI': None,
              'count': None, 'countCI': None, 'groups': {}, 'groupCI': {}}
    for r in rowset:
        age, unit = r['age'], r['unit']
        subgroups = [(dim, r[code]) for code, dim in SUBGROUPS.items() if r[code] != 'All']
        val = float(r['estimate']) if r.get('estimate') else None
        if val is None:
            continue
        if not subgroups:
            dim = {('Age-Adjusted','Percentage'): 'adjusted', ('Crude','Percentage'): 'crude',
                   ('Crude','Number'): 'count'}.get((age, unit))
            if dim:
                record[dim], record[dim + 'CI'] = (int(val) if dim == 'count' else val), interval(r)
                continue
            if unit == 'Percentage' and age not in ('Age-Adjusted', 'Crude'):
                subgroups = [('Age', age)]
            else:
                continue
        elif age != 'Age-Adjusted' or unit != 'Percentage':
            continue
        if len(subgroups) != 1:
            raise ValueError(f'Unexpected cross-tabulation: {r}')
        dim, label = subgroups[0]
        record['groups'].setdefault(dim, {})[label] = val
        record['groupCI'].setdefault(dim, {})[label] = interval(r)
    record['status'] = 'Available' if record['adjusted'] is not None else 'No published estimate'
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('base', type=Path, help='Directory containing 2000–24 state-series and 2024 state-profile JSON')
    parser.add_argument('output', type=Path, help='Directory to write the 2025 profile extension and the expanded series')
    parser.add_argument('--cache', type=Path, default=Path('downloads'))
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    args.output.mkdir(parents=True, exist_ok=True)
    old_series = json.loads((args.base / 'state-series.json').read_bytes())
    old_profiles = json.loads((args.base / 'state-profile.json').read_bytes())
    validate_overlap(args.cache, old_series, old_profiles)
    year = 2025
    rows = query_usdss(args.cache, f'official-all-{year}.json', f'{SOURCE} AND year={year}')
    if len(rows) >= 5000:
        raise ValueError('Results exceed the query page limit')
    states = {s: profile([r for r in rows if r['state'] == s]) for s in sorted(STATES)}
    median, = (r for r in rows if r['state'] == 'State Median' and r['unit'] == 'Median of States'
               and all(r[k] == v for k,v in AGGREGATES.items()))
    extension = {'years': [year], 'population': 'Adults aged 18+ with diagnosed diabetes, all types',
                 'source': DATASET, 'methods': TYPES_METHOD, 'states': states,
                 'stateMedian': {'estimate': float(median['estimate']), 'ci': interval(median)},
                 'reporting': sum(v['adjusted'] is not None for v in states.values())}
    old_series = [r for r in old_series if r['year'] != year]
    updated = [*old_series, {'state': 'All', 'year': year, 'estimate': extension['stateMedian']['estimate']}]
    updated.extend({'state': s, 'year': year, 'estimate': v['adjusted']}
                   for s, v in states.items() if v['adjusted'] is not None)
    for filename, result in [(f'state-total-{year}.json', extension), ('state-series.json', updated)]:
        (args.output / filename).write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    main()
