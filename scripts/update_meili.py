from pathlib import Path
from time import sleep
import json
import os
import random
import requests
import string


public_root = Path(__file__).parent.parent / 'public'
tweets_root = public_root / 'tweets'

documents = []

for path in sorted(tweets_root.glob('*/*/*.json')):
    with open(path) as f:
        data = json.load(f)
    for tweet in data['tweets'].values():
        id = tweet['id']
        tweet['date'] = path.stem
        tweet['translation'] = data.get('translations', {}).get(id)
        tweet['labels'] = data.get('labels', {}).get(id)
        tweet['hasAudio'] = id in data.get('audio', [])
        documents.append(tweet)

meili_url = os.environ["MEILI_URL"]
meili_admin_key = os.environ["MEILI_ADMIN_KEY"]


def meili(method, path, json):
    headers = {
        "Authorization": f"Bearer {meili_admin_key}",
    }
    if json is not None:
        headers["Content-Type"] = "application/json"
    return requests.request(
        method, f"{meili_url}{path}", headers=headers, json=json
    ).json()


def wait_meili(task, allow_failed=False):
    uid = task["taskUid"]
    while True:
        status = meili("GET", f"/tasks/{uid}", None).get("status")
        if status == "enqueued" or status == "processing":
            print(f"Waiting for Meili task {uid} [{status}] to finish...")
            sleep(1)
            continue
        if status == "succeeded" or allow_failed:
            print(f"Meili task {uid} {status}")
            return
        raise Exception(f"Meili task {uid} failed")


INDEX_NAME = 'ikizuxiv'

new_index = INDEX_NAME + "".join(random.choices(string.ascii_lowercase, k=10))

task = meili("POST", "/indexes", {"uid": new_index, "primaryKey": "id"})
wait_meili(task)

task = meili(
    "PATCH",
    f"/indexes/{new_index}/settings",
    {
        "searchableAttributes": ["full_text", "translation.translation", "labels"],
        "filterableAttributes": ["screen_name"],
        "sortableAttributes": ["created_at"],
        "localizedAttributes": [
            { "locales": ["ja"], "attributePatterns": ["full_text"] },
            { "locales": ["zh"], "attributePatterns": ["translation.translation", "labels"] },
        ],
        "rankingRules": [
            "sort",
            "words",
            "typo",
            "proximity",
            "attributeRank",
            "wordPosition",
            "exactness",
        ]
    },
)
wait_meili(task)

task = meili("POST", f"/indexes/{new_index}/documents", documents)
wait_meili(task)

task = meili("POST", "/indexes", {"uid": INDEX_NAME})
wait_meili(task, True)

task = meili("POST", "/swap-indexes", [{"indexes": [INDEX_NAME, new_index]}])
wait_meili(task)

task = meili("DELETE", f"/indexes/{new_index}", None)
wait_meili(task)
