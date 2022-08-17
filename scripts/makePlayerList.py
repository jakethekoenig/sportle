import json

players = json.load(open("players.json"))["players"]

with open("players.js", "w") as f:
    f.write("[")
    for player in players:
        f.write("['%s', %s],\n"%(player["displayName"], player["id"]))
    f.write("]")

