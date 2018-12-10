/********************************************************
 * PSEUDOCODE:
 * // instructor mentioned keeping track of time passed for this
 * 1. First player connects and is assigned to player 1
 *    -Maybe ask them to provide a name
 *    -At this point they can't do anything except maybe type in chat
 *    -If they leave we need to unassign player 1
 * 2. Second player connects and is assigned to player 2
 *    -Maybe require both players to hit "ready" to start game
 * 3. When the game starts we wait for each player to choose a move
 *    -Move is hidden until each player picks a move
 *    -Moves are sent to database, javascript waits until both moves are in
 *    -Local javascript compares moves and determines winner
 *    -Display each players move and the result
 *    -Update score for each player on screen (database? player 1 could be host and handle these updates while player 2 or specatators dont change anything)
 *    -Clear moves in database and wait for next move from each player
 * 4. Chat
 *    -Input form, player adds string to array and updates chat log to database
 *    -On change append newest message to chatbox
 * DATABASE:
 * Players: {player1: "dylan", player2: "tom"}
 * Moves: {player1: "rock", player2: "paper"}
 * 
 * player1 {name: "dylan", move: "rock", wins: 0, ties: 0, losses: 0}
********************************************************/

// console.log(database);

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
      }
      else {
        this.player1 = null;
      }
      if(snapshot.child("player2").exists()) {
        this.player2 = snapshot.val().player2;
      }
      else {
        this.player2 = null;
      }
    });
  }

  addPlayer(name) {
    if(!this.player1) {
      console.log("Adding", name, "as player1");
      this.player1 = {
        name: name,
        move: "",
        wins: 0,
        losses: 0,
        ties: 0
      }
      this.database.ref().child("players/player1").set(this.player1);
      this.database.ref("players/player1").onDisconnect().remove();
    }
    else if(!this.player2) {
      console.log("Adding", name, "as player2");
      this.player2 = {
        name: name,
        move: "",
        wins: 0,
        losses: 0,
        ties: 0
      }
      this.database.ref().child("players/player2").set(this.player2);
      this.database.ref("players/player2").onDisconnect().remove();
    }
  }

}

let game = new RockPaperScissors(database);
$(document).ready(()=> {
  game.run();

  $("#submit-name").on("click", (event) => {
    event.preventDefault();
    const name = $("#input-player-name").val().trim();
    if(name !== "") {
      game.addPlayer(name);
    }
    $("#input-player-name").val("");
  });
});

  // // Object.keys(connection)[0]
  // let connection;
  // let playerData;
  // let player;

  // let players;

  // function handlePlayerData() {
  //   database.ref("players").once("value").then((snapshot) => {
  //     if(snapshot.exists()) {
  //       players = snapshot.val();
  //     }
  //     else {
  //       database.ref().set({
  //         players: {
  //           player1: {
  //             name: "",
  //             move: "",
  //             score: 0,
  //             id: ""
  //           },
  //           player2: {
  //             name: "",
  //             move: "",
  //             score: 0,
  //             id: ""
  //           }
  //         }
  //       });
  //     }
  //     // console.log("CLEARING DATABASE", snapshot.val().players);
  //   });

  //   database.ref().on("value", (snapshot) => {
  //     console.log(snapshot.val());
  //     players = snapshot.val().players;
  //   });

  // }
  

  // function handleConnections() {
  //   const connectionsRef = database.ref("/connections");
  //   const connectedRef = database.ref(".info/connected");
  //   connectedRef.on("value", (snapshot) => {
  //     if(snapshot.val()) {
  //       let con = connectionsRef.push({timestamp: firebase.database.ServerValue.TIMESTAMP});
  //       connectionsRef.orderByChild("timestamp").limitToLast(1).once("value").then(snapshot => {
  //         console.log("our connection", snapshot.val());
  //         connection = Object.keys(snapshot.val())[0];
  //       });

  //       // TODO remove player for this connection
        
  //       con.onDisconnect().remove((error) => {

  //       });
  //     }
  //   });

  //   connectionsRef.on("child_removed", (snapshot) => {
  //     console.log("Disconnected", snapshot.key);
  //     const key = snapshot.key;
  //     console.log(key);
  //     if(players.player1.id === key) {
  //       console.log(players.player1.name, "disconnected")
  //       players.player1 = {
  //         name: "",
  //         move: "",
  //         score: 0,
  //         id: ""
  //       }
  //       database.ref("players/player1").set({
  //         name: "",
  //         move: "",
  //         score: 0,
  //         id: ""
  //       }, (error) => {
  //         if(error) {
  //           console.log("Error removing disconnected player", error);
  //         }
  //       });
  //     }
  //     if(players.player2.id === key) {
  //       console.log(players.player2.name, "disconnected")
  //       players.player2 = {
  //         name: "",
  //         move: "",
  //         score: 0,
  //         id: ""
  //       }
  //       database.ref("players/player2").set({
  //         name: "",
  //         move: "",
  //         score: 0,
  //         id: ""
  //       }, (error) => {
  //         if(error) {
  //           console.log("Error removing disconnected player", error);
  //         }
  //       });
  //     }
  //     // database.ref("players").once("value").then((snapshot) =>{
  //     //   console.log(snapshot.val());
  //     //   // Object.values(snapshot.val()).forEach((player) => {
  //     //   //   console.log(player.id, key, player);
  //     //   //   if(player.id === key) {
  //     //   //     console.log("deleting", player.name);
  //     //   //     database.ref("players").orderByChild("id").equalTo(key).removeValue();
  //     //   //     // database.ref("players").orderByChild("id").equalTo(key).once("value").then((snapshot) => {
  //     //   //     //   // console.log("DUDE", snapshot.remove());
  //     //   //     // });

  //     //   //   }
  //     //   });
  //     // });
  //     // console.log("players/" + player);
  //     // database.ref("players/" + player).set({
  //     //   name: "",
  //     //   move: "",
  //     //   score: 0,
  //     //   id: ""
  //     // });
  //   });
  // }

  // function setPlayer(name, playerNum) {
  //   database.ref("players/" + playerNum).set({
  //     name: name,
  //     move: "",
  //     score: 0,
  //     id: connection
  //   }, (error) => {
  //     if(error) {
  //       console.log("Error setting player", error);
  //     }
  //     else {
  //       player = {
  //         name: name,
  //         move: "",
  //         score: 0,
  //         id: connection
  //       };
  //       $("#input-player-name").val("");
  //     }
  //   });
  // }

  // $(document).ready(() => {
  //   handlePlayerData();
  //   handleConnections();

  //   $("#submit-name").on("click", (event) => {
  //     event.preventDefault();
  //     // Set player1 name first, otherwise set player2
  //     database.ref("players").once("value").then((snapshot) => { 
  //       if(!snapshot.val().player1.name) {
  //         setPlayer($("#input-player-name").val(), "player1");
  //       }
  //       else if(!snapshot.val().player2.name) {
  //         setPlayer($("#input-player-name").val(), "player2");
  //       }
  //     });
  //   });

  //   database.ref("players").on("value", (snapshot) => {
  //     console.log("new player data", snapshot.val());
  //     // console.log(snapshot.val().connections);
  //   });


  // });
