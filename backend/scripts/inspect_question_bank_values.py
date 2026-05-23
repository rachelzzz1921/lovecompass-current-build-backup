from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [ROOT / 'data/suite1_female.json', ROOT / 'data/suite1_male.json']

counter: Counter[str] = Counter()
by_file: dict[str, Counter[str]] = {}

for path in FILES:
    data = json.loads(path.read_text(encoding='utf-8'))
    c: Counter[str] = Counter()
    for question in data.get('questions') or []:
        value = str(question.get('direction') or 'positive')
        c[value] += 1
        counter[value] += 1
    by_file[path.name] = c

for name, c in by_file.items():
    print(name + ': ' + ', '.join(f'{k}={v}' for k, v in sorted(c.items())))
print('all: ' + ', '.join(f'{k}={v}' for k, v in sorted(counter.items())))
