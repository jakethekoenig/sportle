import json

players = json.load(open("players.json"))["players"]

with open("player_names.js", "w") as f:
    f.write("const player_names = [\n")
    for player in players:
        f.write('"%s",\n'%player["displayName"])
    f.write("]\n")

