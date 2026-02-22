import json
from pathlib import Path
from datetime import datetime, timedelta, timezone

public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'

TOKYO_TZ = timezone(timedelta(hours=9))

translator = 'D字头列车'
source = None

for path in tweets_root.glob('*/*/*.json'):
    with open(path) as f:
        data = json.load(f)
    translations = data.setdefault('translations', {})
    tweets = sorted(data['tweets'].values(), key=lambda tweet: tweet['created_at'])
    for tweet in tweets:
        id = tweet['id']
        if id not in translations:
            created_at = datetime.fromisoformat(tweet["created_at"]).astimezone(TOKYO_TZ).strftime('%Y-%m-%d %H:%M:%S')
            while True:
                print(f'{"-" * 80}\n{created_at} @{tweet["screen_name"]}:\n\n{tweet["full_text"]}\n{"-" * 80}')
                new_translator = input(f'Translator (default: {translator}): ').strip()
                if new_translator:
                    translator = new_translator
                if source:
                    new_source = input('Source Link (leave blank if same as the last one): ').strip()
                    if new_source:
                        source = new_source
                else:
                    source = input('Source Link: ').strip()
                translation = input('Translation (end with two blank lines): ')
                while not translation.endswith('\n\n'):
                    translation += '\n' + input().strip()
                translation = translation.strip()
                comments = input('Comments (optional, end with two blank lines): ')
                while not comments.endswith('\n\n'):
                    comments += '\n' + input().strip()
                comments = comments.strip()
                print(f'{"-" * 35} Original {"-" * 35}\n{tweet["full_text"]}')
                print(f'{"-" * 34} Translation {"-" * 33}\n{translation}')
                if comments:
                    print(f'{"-" * 35} Comments {"-" * 35}\n{comments}')
                print('-' * 80)
                print(f'Translator: {translator}')
                print(f'Source Link: {source}')
                print('-' * 80)
                confirm = ''
                while confirm not in ['y', 'n', 'yes', 'no']:
                    confirm = input('Confirm? (y/n): ').strip().lower()
                if confirm == 'y' or confirm == 'yes':
                    translations[id] = {
                        'translator': translator,
                        'source': source,
                        'translation': translation,
                    }
                    if comments:
                        translations[id]['comments'] = comments
                    break
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
