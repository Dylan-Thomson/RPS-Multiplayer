class RockPaperScissors {
  constructor(database, moves) {
    this.database = database;
    this.moves = moves;
  }

  run() {
    this.handlePlayerData();
    this.handleChatData();
  }

  handlePlayerData() {
    // Handle player data changes
    this.database.ref("players").on("value", (snapshot) => {
      // Get player data if there is any
      if(snapshot.child("player1").exists()) {
        $("#player1-name").text(snapshot.val().player1.name);
        $("#player1-wins").text(snapshot.val().player1.wins);
        $("#player1-losses").text(snapshot.val().player1.losses);
        $("#player1-ties").text(snapshot.val().player1.ties);
      }
      if(snapshot.child("player2").exists()) {
        $("#player2-name").text(snapshot.val().player2.name);
        $("#player2-wins").text(snapshot.val().player2.wins);
        $("#player2-losses").text(snapshot.val().player2.losses);
        $("#player2-ties").text(snapshot.val().player2.ties);
      }

      // Check for moves and compare if both have moved
      if(snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
        if(this.spectator) {
          $("#name-form").addClass("d-none");
          $("#player-selection-container").removeClass("d-none");
        }
        if(snapshot.child("player1").val().move && snapshot.child("player2").val().move) {
          console.log("Both players have moved");
          console.log("Player1 move: " + snapshot.child("player1").val().move);
          $("#player1-move").removeClass();
          $("#player2-move").removeClass();
          $("#player1-move").addClass("text-warning fas fa-2x " + this.iconFromMove(snapshot.child("player1").val().move));
          $("#player2-move").addClass("text-warning fas fa-2x " + this.iconFromMove(snapshot.child("player2").val().move));
          console.log("Player2 move: " + snapshot.child("player2").val().move);

          // evaluate moves
          this.evalMoves(snapshot.child("player1").val().move, snapshot.child("player2").val().move);
        }
      }
      else if(this.spectator && (snapshot.child("player1").exists() || snapshot.child("player2").exists())) {
        $("#name-form").removeClass("d-none");
        $("#player-selection-container").addClass("d-none");
      }
      else if(!snapshot.child("player1").exists() && !snapshot.child("player2").exists()){
        // For now, clear chat if both players leave
        this.database.ref("chat").remove();
        $("#chatbox").empty();
      }
    });

    // Handle player disconnect
    this.database.ref("players").on("child_removed", (snapshot) => {
      console.log(snapshot.val().name, "has disconnected");

      // Add chat message saying playing disconnected
      if(!this.spectator) {
        let chatMessage = {
          name: snapshot.val().name,
          msg: "has disconnected",
          added: firebase.database.ServerValue.TIMESTAMP
        }
        this.database.ref("chat").push(chatMessage);
      }

      // Clear stats on page
      if($("#player1-name").text() === snapshot.val().name) {
        $("#player1-name").text("Player 1");
        $("#player1-wins").text("");
        $("#player1-losses").text("");
        $("#player1-ties").text("");
      }
      else {
        $("#player2-name").text("Player 2");
        $("#player2-wins").text("");
        $("#player2-losses").text("");
        $("#player2-ties").text("");
      }
    });
  }

  // Append a div to chatbox when message is added, auto scroll to bottom
  handleChatData() {
    this.database.ref("chat").on("child_added", (snapshot) => {
      console.log(snapshot.val().msg);
      $("#chatbox").append($("<div>").text(
        snapshot.val().name + ": " + snapshot.val().msg
      ));
      $("#chatbox").animate({
        scrollTop: $("#chatbox").get(0).scrollHeight
      }, 100);
    });
  }

  // Push new chat message to database
  submitChatMessage(msg) {
    if(this.player) {
      this.database.ref().once("value").then((snapshot) => {
          let chatMessage = {
            name: snapshot.val().players[this.player].name,
            msg: msg,
            added: firebase.database.ServerValue.TIMESTAMP
          };
          this.database.ref("chat").push(chatMessage);
      });
    }
    else if(this.spectator) {
      let chatMessage = {
        name: this.spectator,
        msg: msg,
        added: firebase.database.ServerValue.TIMESTAMP
      };
      this.database.ref("chat").push(chatMessage);
    }
  }

  // Decide what to do when a user submits a name
  submitName(name) {
    this.database.ref("players").once("value").then((snapshot) => {
      if(!snapshot.val()) {
        this.addPlayer(name, "player1");
        this.player = "player1";
        $("#name-form").addClass("d-none");
        $("#player-selection-container").removeClass("d-none");
        $("#player-selection").text("Player 1");
      }
      else if(!snapshot.val().player1) {
        this.addPlayer(name, "player1");
        this.player = "player1";
        $("#name-form").addClass("d-none");
        $("#player-selection-container").removeClass("d-none");
        $("#player-selection").text("Player 1");
      }
      else if(!snapshot.val().player2) {
        this.addPlayer(name, "player2");
        this.player = "player2";
        $("#name-form").addClass("d-none");
        $("#player-selection-container").removeClass("d-none");
        $("#player-selection").text("Player 2");
      }
      else {
        this.spectator = name;
        $("#name-form").addClass("d-none");
        $("#player-selection-container").removeClass("d-none");
        $("#player-selection").text("spectating");
      }
    });
  }

  // Adding a player
  addPlayer(name, player) {
    console.log("Adding", name, "as", player);
    const newPlayer = {
      name: name,
      move: "",
      wins: 0,
      losses: 0,
      ties: 0
    }

    // Display player's name and buttons
    $("#" + player + "-name").text(name);
    $("#" + player + "-buttons").removeClass("d-none");
    
    // Build event listeners for player's buttons
    const db = this.database;
    $("." + player + "-move").on("click", function() {
      // Update player move
      let update = {};
      update["players/" + player + "/move"] = $(this).data("move");
      db.ref().update(update);
      console.log(name + " picked " + $(this).data("move"));
      // Hide buttons
      $("#" + player + "-buttons").addClass("d-none");
    });

    // Add chat message when player joins
    let chatMessage = {
      name: name,
      msg: "has joined",
      added: firebase.database.ServerValue.TIMESTAMP
    }
    this.database.ref("chat").push(chatMessage);

    // Update database with player data and set to remove on disconnect
    this.database.ref("players/" + player).set(newPlayer);
    this.database.ref("players/" + player).onDisconnect().remove();
  }

  // Compare player moves and determine win/loss/tie
  evalMoves(move1, move2) {
    move1 = this.moves.indexOf(move1);
    move2 = this.moves.indexOf(move2);
    if(move1 == move2) {
      this.tie();
    }
    else if(move1 == this.moves.length - 1 && move2 == 0) {
      console.log("Player 2 wins"); // s vs r
      this.winLose("player2", "player1");
    }
    else if(move2 == this.moves.length - 1 && move1 == 0) {
      console.log("Player 1 wins"); // r vs s
      this.winLose("player1", "player2");
    }
    else if(move1 > move2) {
      console.log("Player 1 wins"); // p vs r or s vs p
      this.winLose("player1", "player2");
    }
    else {
      console.log("Player 2 wins"); // r vs p or p vs s
      this.winLose("player2", "player1");
    }
  }

  // Increment ties for each player, announce result, start new round
  tie() {
    this.database.ref("players").once("value").then((snapshot) => {
      let player1Ties = Number(snapshot.val().player1.ties);
      let player2Ties = Number(snapshot.val().player2.ties);
      player1Ties++, player2Ties++;
      console.log("TIED");
      let updates = {};
      updates["players/player1/ties"] = player1Ties;
      updates["players/player1/move"] = "";
      updates["players/player2/ties"] = player2Ties;
      updates["players/player2/move"] = "";
      this.database.ref().update(updates);

      $("#result").text("Tie!");
      $("#player-moves").removeClass("d-none");
      setTimeout(() => {
        $("#" + this.player + "-buttons").removeClass("d-none");
        $("#player-moves").addClass("d-none");
        $("#result").empty();
      }, 3000);
    });
  }
  
  // Update win/loss stats for each player, announce result, start new round
  winLose(winner, loser) {
    this.database.ref("players").once("value").then((snapshot) => {
      console.log(snapshot.val()[winner].name, "won!");
      console.log(snapshot.val()[loser].name, "lost!");
      let winnerWins = Number(snapshot.val()[winner].wins);
      winnerWins++;
      let loserLosses = Number(snapshot.val()[loser].losses);
      loserLosses++;
      let updates = {};
      updates["players/" + winner + "/wins"] = winnerWins;
      updates["players/" + loser + "/losses"] = loserLosses;
      updates["players/player1/move"] = "";
      updates["players/player2/move"] = "";
      this.database.ref().update(updates);
      
      $("#result").text(snapshot.val()[winner].name + " won!");
      $("#player-moves").removeClass("d-none");
      setTimeout(() => {
        $("#" + this.player + "-buttons").removeClass("d-none");
        $("#player-moves").addClass("d-none");
        $("#result").empty();
      }, 3000);
    });
  }

  // Return fontawesome class given a move
  iconFromMove(move) {
    if(move === "r") {
      return "fa-hand-rock";
    }
    if(move === "p") {
      return "fa-hand-paper";
    }
    if(move === "s") {
      return "fa-hand-scissors"
    }
  }

}

const game = new RockPaperScissors(database, ["r", "p", "s"]);
$(document).ready(()=> {
  game.run();

  $("#submit-name").on("click", (event) => {
    event.preventDefault();
    const name = $("#input-player-name").val().trim();
    if(name !== "") {
      game.submitName(name);
    }
    $("#input-player-name").val("");
  });

  $("#send-chat-msg").on("click", (event) => {
    event.preventDefault();
    const msg = $("#input-chat-msg").val().trim();
    if(msg !== "") {
      game.submitChatMessage(msg);
    }
    $("#input-chat-msg").val("");
  });
});
