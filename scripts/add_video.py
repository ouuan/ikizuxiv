import json
from pathlib import Path

public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'

date = input('Date (YYYY-MM-DD): ').strip()
year, month, day = date.split('-')

with open(tweets_root / year / month / f'{date}.json') as f:
    data = json.load(f)

website = input('Video Website (y/b): ').strip()
if website == 'y':
    website = 'youtube'
elif website == 'b':
    website = 'bilibili'

id = input('Video ID: ').strip()

data.setdefault('videos', []).append({ 'website': website, 'id': id })

with open(tweets_root / year / month / f'{date}.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
