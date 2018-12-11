class RockPaperScissors {
  constructor(database, moves) {
    this.database = database;
    this.moves = moves;
  }

  run() {
    this.handlePlayerData();
  }

  handlePlayerData() {
    // Handle player data changes
    this.database.ref("players").on("value", (snapshot) => {
      // Get player data if there is any
      if(snapshot.child("player1").exists()) {
        this.player1 = snapshot.val().player1;
        $("#player1-name").text(this.player1.name);
      }
      else {
        this.player1 = null;
      }
      if(snapshot.child("player2").exists()) {
        this.player2 = snapshot.val().player2;
        $("#player2-name").text(this.player2.name);
      }
      else {
        this.player2 = null;
      }

      // Check for moves and compare if both have moved
      if(snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
        if(this.player1.move && this.player2.move) {
          console.log("Both players have moved");
          console.log("Player1 move: " + this.player1.move);
          console.log("Player2 move: " + this.player2.move);

          // evaluate moves
          this.evalMoves();
        }
      }
    });

    // Handle player disconnect
    this.database.ref("players").on("child_removed", (snapshot) => {
      console.log(snapshot.val().name, "has disconnected");
      if($("#player1-name").text() === snapshot.val().name) {
        $("#player1-name").text("Player 1");
      }
      else {
        $("#player2-name").text("Player 2");
      }
    });
  }

  // Decide what to do when a user submits a name
  submitName(name) {
    if(!this.player1) {
      this.addPlayer(name, "player1");
    }
    else if(!this.player2) {
      this.addPlayer(name, "player2");
    }
  }

  // Adding a player
  addPlayer(name, player) {
    console.log("Adding", name, "as", player);
    this[player] = {
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
      const update = {};
      update["players/" + player + "/move"] = $(this).data("move");
      db.ref().update(update);

      // Hide buttons
      $("#" + player + "-buttons").addClass("d-none");
    });

    // Update database with player data and set to remove on disconnect
    this.database.ref("players/" + player).set(this[player]);
    this.database.ref("players/" + player).onDisconnect().remove();
  }

  evalMoves() {
    console.log(this.player1.move + " vs " + this.player2.move);
    const move1 = this.moves.indexOf(this.player1.move);
    const move2 = this.moves.indexOf(this.player2.move);
    if(move1 === move2) {
      console.log("Tie");
    }
    else if(move1 === this.moves.length - 1 && move2 === 0) {
      console.log("Player 2 wins"); // s vs r
    }
    else if(move2 === this.moves.length - 1 && move1 === 0) {
      console.log("Player 1 wins"); // r vs s
    }
    else if(move1 > move2) {
      console.log("Player 1 wins"); // p vs r or s vs p
    }
    else {
      console.log("Player 2 wins"); // r vs p or p vs s
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
});
