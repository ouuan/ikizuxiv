import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from sys import argv

public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'

TIMEZONE = timezone(timedelta(hours=9))
DATE_TIMEZONE = timezone(timedelta(hours=3)) # UTC+9 with 30-hour clock
FORMAT = '%Y-%m-%d %H:%M'

for source in argv[1:]:
    with open(source, 'r') as f:
        source_items = json.load(f)
    for source_item in source_items:
        original = source_item['original'].strip()
        try:
            created_at = datetime.strptime(source_item['date'], FORMAT)
        except Exception as e:
            print(f'Error parsing date: {json.dumps(source_item["date"])}')
            raise e
        created_at = created_at.replace(tzinfo=TIMEZONE)
        date = created_at.astimezone(DATE_TIMEZONE).date()
        path = tweets_root / str(date.year) / f"{date.month:02d}" / f"{date.strftime('%Y-%m-%d')}.json"
        with open(path) as f:
            data = json.load(f)
        translations = data.setdefault('translations', {})
        labels = data.setdefault('labels', {})
        tweets = data['tweets']
        for tweet in tweets.values():
            if datetime.fromisoformat(tweet['created_at']).astimezone(TIMEZONE).strftime(FORMAT) != source_item['date']:
                continue
            if original[0] != tweet['full_text'][0] or original[-1] != tweet['full_text'].replace('#いきづらい部', '').strip()[-1]:
                continue
            id = tweet['id']
            annotations = {}
            for annotation in source_item.get('annotations', []):
                annotations[annotation['term']] = annotation['definition']
            translations[id] = {
                'pikapaca': True,
                'translation': source_item['translation'].strip(),
                'annotations': annotations,
            }
            labels[id] = source_item.get('hidden_label', [])
            with open(path, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            break
        else:
            if source_item.get('hidden'):
                continue
            print(f'Warning: No matching tweet')
            print(source_item)
            input()
