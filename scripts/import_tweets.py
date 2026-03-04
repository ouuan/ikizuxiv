import json
import re
import requests
from datetime import datetime, timedelta, timezone
from pathlib import Path
from sys import argv

tweets = []

for source in argv[1:]:
    with open(source, 'r') as f:
        tweets += json.load(f)

public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'
tweets_root.mkdir(parents=True, exist_ok=True)
media_root = public_root / 'assets' / 'media'
media_root.mkdir(parents=True, exist_ok=True)

date_data = {}

for path in tweets_root.glob('*/*/*.json'):
    with open(path) as f:
        date_data[path] = json.load(f)

media_set = set()

for path in media_root.glob('**/*.*'):
    media_set.add(path.name)

DATE_TIMEZONE = timezone(timedelta(hours=3)) # UTC+9 with 30-hour clock
MEDIA_REGEX = r'^https://pbs\.twimg\.com/media/(.+)\?format=(.+)&name=orig$'

for tweet in tweets:
    if tweet['in_reply_to']:
        raise NotImplementedError('Reply not supported')
    if tweet['retweeted_status']:
        raise NotImplementedError('Retweet not supported')
    created_at = datetime.fromisoformat(tweet['created_at']).astimezone(DATE_TIMEZONE)
    path = tweets_root / str(created_at.year) / f"{created_at.month:02d}" / created_at.strftime("%Y-%m-%d.json")
    id = tweet['id']
    media = []
    for m in tweet['media']:
        if m['type'] != 'photo':
            raise NotImplementedError(f"Unsupported media type: {m['type']}")
        link = m['original']
        match = re.match(MEDIA_REGEX, link)
        if not match:
            raise ValueError(f"Invalid media link: {link}")
        filename = f'{match.group(1)}.{match.group(2)}'
        if filename not in media_set:
            res = requests.get(link)
            res.raise_for_status()
            with open(media_root / filename, 'wb') as f:
                f.write(res.content)
        media.append(filename)
    tweet = { k: tweet[k] for k in [
        'id',
        'created_at',
        'full_text',
        'screen_name',
        'favorite_count',
        'retweet_count',
        'bookmark_count',
        'quoted_status',
        'quote_count',
        'reply_count',
        'views_count',
    ] }
    tweet['media'] = media
    date_data.setdefault(path, { 'tweets': {} })['tweets'][id] = tweet

for path, data in date_data.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

index = {}

for path, data in date_data.items():
    m = index[path.stem] = {}
    for tweet in data['tweets'].values():
        m[tweet['screen_name']] = m.get(tweet['screen_name'], 0) + 1

with open(tweets_root / 'index.json', 'w') as f:
    json.dump(index, f, indent=2)
