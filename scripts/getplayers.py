import requests
import json

out_data = []
count = 0
for i in range(1, 19):
    request = requests.get('https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes?limit=1000&page=%s'%i)
    data = json.loads(request.text)
    for item in data["items"]:
        count += 1
        print('%s'%count, end='\r')
        try:
            ref = item["$ref"]
            player_request = requests.get(ref)
            player_data = json.loads(player_request.text)
            #print(player_data["displayName"])
            out_data.append(player_data)
        except:
            print(count)
            pass

json.dump({"players": out_data}, open("players.json", "w"))
