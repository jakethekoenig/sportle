
var players = player_names;

// Copied mostly from https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function get_match_from_server(player) {
    fetch("/player/" + player).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        append_guess(player, data);
        get_compatible();
        document.getElementById("playerguess").value = "";
        // document.getElementById("playerguess").placeholder = "test";
    });
}

function append_guess(guess, match) {
    var guess = document.getElementById("playerguess").value;
    var guess_record = document.createElement("li");
    var guess_record_header = document.createElement("h2");
    guess_record_header.innerHTML = guess;
    guess_record_header.classList.add("guess_n");
    guess_record.appendChild(guess_record_header);

    var match_record = document.createElement("ul");
    match_record.classList.add("guess_info");

    var img_container = document.createElement("li");
    img_container.classList.add("img_container");
    var img = document.createElement("img");
    img.classList.add("guess_img");
    img.src = match.guess_info.team_pic;
    if (match.team) {
        img_container.classList.add("correct");
        var check = document.createElement("img");
        check.src = "/icon/check.svg";
        check.classList.add("X");
        img_container.appendChild(check);
    } else {
        img_container.classList.add("incorrect");
        var X = document.createElement("img");
        X.src = "/icon/x.svg";
        X.classList.add("X");
        img_container.appendChild(X);
    }
    img_container.appendChild(img);

    var position_li = document.createElement("li");
    var position_text = document.createElement("p");
    position_text.classList.add("guess_position");
    position_text.innerHTML = match.guess_info.position;
    if (match.position) {
        position_li.classList.add("correct");
        var check = document.createElement("img");
        check.src = "/icon/check.svg";
        check.classList.add("X");
        position_li.appendChild(check);
    } else {
        position_li.classList.add("incorrect");
        var X = document.createElement("img");
        X.src = "/icon/x.svg";
        X.classList.add("X");
        position_li.appendChild(X);
    }
    position_li.appendChild(position_text);

    var jersey_li = document.createElement("li");
    var jersey_text = document.createElement("p");
    jersey_text.classList.add("guess_position");
    jersey_text.innerHTML = match.guess_info.jersey;
    if (match.jersey > 0) {
        jersey_li.classList.add("incorrect");
        var up = document.createElement("img");
        up.src = "/icon/down.svg";
        up.classList.add("X");
        jersey_li.appendChild(up);
    }
    if (match.jersey < 0) {
        jersey_li.classList.add("incorrect");
        var up = document.createElement("img");
        up.src = "/icon/up.svg";
        up.classList.add("X");
        jersey_li.appendChild(up);
    }
    if (match.jersey == 0) {
        jersey_li.classList.add("correct");
        var up = document.createElement("img");
        up.src = "/icon/check.svg";
        up.classList.add("X");
        jersey_li.appendChild(up);
    }
    jersey_li.appendChild(jersey_text);

    var debut_li = document.createElement("li");
    var debut_text = document.createElement("p");
    debut_text.classList.add("guess_position");
    debut_text.innerHTML = match.guess_info.debut;
    if (match.debut_year > 0) {
        debut_li.classList.add("incorrect");
        var up = document.createElement("img");
        up.src = "/icon/down.svg";
        up.classList.add("X");
        debut_li.appendChild(up);
    }
    if (match.debut_year < 0) {
        debut_li.classList.add("incorrect");
        var up = document.createElement("img");
        up.src = "/icon/up.svg";
        up.classList.add("X");
        debut_li.appendChild(up);
    }
    if (match.debut_year == 0) {
        debut_li.classList.add("correct");
        var up = document.createElement("img");
        up.src = "/icon/check.svg";
        up.classList.add("X");
        debut_li.appendChild(up);
    }
    debut_li.appendChild(debut_text);

    match_record.appendChild(img_container);
    match_record.appendChild(position_li);
    match_record.appendChild(jersey_li);
    match_record.appendChild(debut_li);

    guess_record.appendChild(match_record);
    document.getElementById("guess_records").appendChild(guess_record);
}

function guess_player() {
    get_match_from_server(document.getElementById("playerguess").value);
}

function get_compatible() {
    var players = [];
    for (var guess of document.getElementsByClassName("guess_n")) {
        players.push(guess.innerHTML);
    }

    const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(players)
    }
    console.log(players);
    console.log(options);

    fetch("/compatible/players", options).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        autocomplete(document.getElementById("playerguess"), data);
    });
}

window.onload = function() {
    console.log("Autocomplete loaded");
    autocomplete(document.getElementById("playerguess"), players);
    document.getElementById("guess_button").addEventListener("click", guess_player);
    document.getElementById("playerguess").addEventListener("keydown", function (e) {
        if (e.keyCode == 13) {
            guess_player();
        }
    });
}

