class RockPaperScissors {
  constructor(database) {
    this.database = database;
  }

  run() {
    this.handlePlayerData();
  }

  handlePlayerData() {
    this.database.ref("players").on("value", (snapshot) => {
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
    });

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

  submitName(name) {
    if(!this.player1) {
      this.addPlayer(name, "player1");
    }
    else if(!this.player2) {
      this.addPlayer(name, "player2");
    }
  }

  addPlayer(name, player) {
    console.log("Adding", name, "as", player);
    this[player] = {
      name: name,
      move: "",
      wins: 0,
      losses: 0,
      ties: 0
    }
    $("#" + player + "-name").text(name);
    $("#" + player + "-buttons").removeClass("d-none");
    
    const db = this.database;
    $("." + player + "-move").on("click", function() {
      // Update player move
      const update = {};
      update["players/" + player + "/move"] = $(this).data("move");
      db.ref().update(update);

      // Hide buttons
      $("#" + player + "-buttons").addClass("d-none");
    });
    this.database.ref("players/" + player).set(this[player]);
    this.database.ref("players/" + player).onDisconnect().remove();
  }

}

const game = new RockPaperScissors(database);
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
