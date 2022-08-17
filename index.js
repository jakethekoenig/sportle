import fetch from 'node-fetch';
import express from 'express';
import player_id_mapping from './data/player_id_mapping.js';
import bodyParser from 'body-parser';
import fs from 'fs';
import random from 'random';
import seedrandom from 'seedrandom';
var player_db = fs.readFileSync('./players.json', {encoding:'ascii', flag:'r'});
player_db = JSON.parse(player_db);

const app = express();
app.use(bodyParser.json());
const port = 8000;

app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.static('static'))

app.get('/', function(req, res)
{
    res.render('index', {title: 'Sportle', message: 'Sportle'});
});

function todays_hidden_player() {
    random.use(seedrandom(new Date().toISOString().split('T')[0]));
    var start = random.int(0, player_id_mapping.length);

    for (var i = start;; i = (i+1) % player_id_mapping.length) {
        if (player_db.players[i].active) {
            return player_db.players[i].id;
        }
    }
}
var hidden_player = todays_hidden_player();

var hidden_player_data = null;
async function daily_player() {
    if (hidden_player_data == null) {
        const espn_response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${hidden_player}`)
        hidden_player_data = await espn_response.json();
        return hidden_player_data;
    } else {
        return hidden_player_data;
    }
}

function get_player_id_from_name(player) {
    for (var i = 0; i < player_id_mapping.length; i++) {
        if (player_id_mapping[i][0].toLowerCase() === player.toLowerCase()) {
            return player_id_mapping[i][1];
        }
    }
    return -1;
}

async function get_player_data(player) {
    const id = get_player_id_from_name(player);
    const espn_response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${id}`);
    const player_data = await espn_response.json();
    return player_data;
}

function get_debut_year(player_data) {
    if ("debutYear" in player_data) {
        return player_data.debutYear;
    }
    if ("experience" in player_data) {
        return 2022 - player_data.experience.years;
    }
    return 0;
}

app.get('/player/:player_name', async function(req, res) {
    var player = decodeURI(req.params.player_name);
    const id = get_player_id_from_name(player);
    if (id == -1) {
        res.status(200).send('Player not found');
        return;
    }
    var player_data = await get_player_data(player);
    const hidden_player_data = await daily_player();
    // Return an an array of True/False or integer of the following:
    // * debut year: integer difference of the two
    // * True/False: if the player has played in the hidden player's team
    // * True/False: if the player has played i the hidden player's position
    // * Integer difference of the jersey number
    const response = {};
    var hidden_debut = get_debut_year(hidden_player_data);
    var player_debut = get_debut_year(player_data);

    response.debut_year = player_debut - hidden_debut;
    response.team = player_data.team["$ref"] == hidden_player_data.team["$ref"];
    response.position = player_data.position.displayName == hidden_player_data.position.displayName;
    response.jersey = player_data.jersey - hidden_player_data.jersey;

    var info_on_guess = {};

    var team_info = await fetch(player_data.team["$ref"]);
    team_info = await team_info.json();
    if (team_info.logos) {
        info_on_guess.team_pic = team_info.logos[0].href;
    }

    info_on_guess.position = player_data.position.displayName;
    info_on_guess.jersey = player_data.jersey;
    info_on_guess.debut = player_debut;

    response.guess_info = info_on_guess;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response));
});

function compatible(guess_data, hidden_data, player_data) {
    try {
    // Check Team
    if ((guess_data.team["$ref"] == hidden_data.team["$ref"]) != (player_data.team["$ref"] == guess_data.team["$ref"])) {
        return false;
    }
    // Check Position
    if ((guess_data.position.displayName === hidden_data.position.displayName) != (player_data.position.displayName === guess_data.position.displayName)) {
        return false;
    }
    // Check Jersey Number
    if ((guess_data.jersey == hidden_data.jersey) != (player_data.jersey == guess_data.jersey)) {
        return false;
    }
    if ((guess_data.jersey > hidden_data.jersey) != (player_data.jersey < guess_data.jersey)) {
        return false;
    }
    // Check Debut Year
    if ((get_debut_year(guess_data) == get_debut_year(hidden_data)) != (get_debut_year(player_data) == get_debut_year(guess_data))) {
        return false;
    }
    if ((get_debut_year(guess_data) > get_debut_year(hidden_data)) != (get_debut_year(guess_data) > get_debut_year(player_data))) {
        return false;
    }
    } catch (e) {
        return false;
    }

    return true;
}

app.post('/compatible/players', async function(req, res) {
    var guessed_players = [];
    var hidden_player_data = await daily_player();
    for (var player in req.body) {
        const player_data = await get_player_data(req.body[player]);
        guessed_players.push(player_data);
    }
    var autocomplete_players = [];
    for (var player in player_db.players) {
        var compat = true;
        for(var guessed_player in guessed_players) {
            if (!compatible(guessed_players[guessed_player], hidden_player_data, player_db.players[player])) {
                compat = false;
                break;
            }
        }
        if (compat) {
            autocomplete_players.push(player_db.players[player].displayName);
        }
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(autocomplete_players));
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
