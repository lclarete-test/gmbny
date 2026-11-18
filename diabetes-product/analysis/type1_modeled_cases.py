"""Extract the all-ages 2024 modeled T1D count from Wang et al., JAMA Network Open.

Usage: python type1_modeled_cases.py type1-cases-2024.json --cache brfss_cache
Uses the adjacent state_conditions.py module for state codes and the download cache.
"""
import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from state_conditions import CODES, download

SOURCE = 'https://doi.org/10.1001/jamanetworkopen.2026.27732'
ARTICLE = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13451973/'
JATS = 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13451973/fullTextXML'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    parser.add_argument('--cache',type=Path,default=Path('brfss_cache'))
    args = parser.parse_args()
    args.cache.mkdir(parents=True,exist_ok=True)
    source = ET.parse(download(args.cache,'jama.xml',JATS))
    table = source.find(".//table-wrap[@id='zld260149t1']")
    header = ' '.join(table.find('table/thead').itertext())
    assert 'Prevalent cases' in header and 'Among all individuals' in header
    codes = {name:postal for postal,name in CODES.values()}
    data = {'label':'People living with type 1 diabetes','unit':'Modeled number of people','period':'2024',
            'denominator':'All ages','source':'Wang and colleagues · JAMA Network Open, 2026','sourceUrl':SOURCE,
            'sources':[['Wang et al. · State type 1 model estimates, table',ARTICLE]],
            'notes':['The T1D Index model combines SEARCH youth incidence, adult incidence assumptions and state demographics to estimate how many residents of all ages were living with type 1 diabetes in 2024. A count reflects the size of the population as well as disease frequency.',
                     'The intervals reflect 1,000 simulations. Published constraints include limited state-specific adult incidence and mortality data. The national row is the authors’ published estimate.'],
            'national':None,'states':{}}
    for row in table.findall('table/tbody/tr'):
        cells = [' '.join(''.join(cell.itertext()).split()) for cell in row]
        name = cells[0]
        numbers = re.fullmatch(r'(\d+)\((\d+)[–-](\d+)\)',cells[3].replace(' ',''))
        count,low,high = map(int,numbers.groups())
        assert 0 < low <= count <= high
        entry = {'value':count,'ci':[low,high]}
        if name == 'US':
            data['national'] = entry
        else:
            assert codes[name] not in data['states']
            data['states'][codes[name]]=entry
    assert set(data['states']) == set(codes.values()) and data['national']['value'] == 1476859
    args.output.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')

if __name__=='__main__':
    main()
