from datetime import datetime, timedelta, timezone
from pathlib import Path
from sys import argv
import json
import pyperclip
import re
import subprocess

audio_source_dir = Path(argv[1]) if len(argv) > 1 else None

public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'
audio_root = public_root / 'assets' / 'audio'
audio_root.mkdir(parents=True, exist_ok=True)

subprocess.run(['mpv', '--version'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

TOKYO_TZ = timezone(timedelta(hours=9))

with open(Path(__file__).parent / 'replacement.json') as f:
    replacement = json.load(f)

last_sender = None

for path in sorted(tweets_root.glob('*/*/*.json')):
    with open(path) as f:
        data = json.load(f)
    audio = data.setdefault('audio', [])
    translations = data.setdefault('translations', {})
    tweets = sorted(data['tweets'].values(), key=lambda tweet: tweet['created_at'])
    for tweet in tweets:
        id = tweet['id']
        if id not in audio:
            sender = tweet['screen_name']
            text = tweet['full_text']
            for src, dst in replacement.items():
                text = re.sub(src, dst, text)
            pyperclip.copy(text.strip())
            created_at = datetime.fromisoformat(tweet["created_at"]).astimezone(TOKYO_TZ).strftime('%Y-%m-%d %H:%M:%S')
            print(f'{"-" * 80}\n{created_at} @{sender} #{id}:\n\n{tweet["full_text"]}')
            translation = translations.get(id)
            if translation:
                print(f'{"-" * 34} Translation {"-" * 33}\n{translation['translation']}')
            print('-' * 80)
            if sender != last_sender:
                print(f'{"=" * 40}\n     Sender: @{sender}\n{"=" * 40}')
                last_sender = sender
            if audio_source_dir:
                input('Enter to continue...')
            default_src = None
            while True:
                if audio_source_dir:
                    mp3_files = list(audio_source_dir.glob('*.mp3'))
                    if mp3_files:
                        default_src = max(mp3_files, key=lambda f: f.stat().st_mtime)
                if default_src:
                    src_input = input(f'Audio path (default: {default_src}): ').strip()
                    src_path = Path(src_input) if src_input else default_src
                else:
                    src_path = Path(input(f'Audio path: ').strip())
                if src_path.suffix != '.mp3':
                    print('Invalid file type. Please provide an mp3 file.')
                    continue
                if not src_path.is_file():
                    print('File does not exist. Please provide a valid file path.')
                    continue
                subprocess.run(["mpv", "--no-config", "--no-video", "--really-quiet", src_path])
                confirm = ''
                while confirm not in ['y', 'n', 'yes', 'no']:
                    confirm = input('Confirm? (y/n): ').strip().lower()
                if confirm == 'y' or confirm == 'yes':
                    break
            dst_path = audio_root / path.parts[-3] / path.parts[-2] / f'{id}.mp3'
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            src_path.move(dst_path)
            audio.append(id)
        with open(path, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
