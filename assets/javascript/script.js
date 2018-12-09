  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyAK4zUxHVeOaUX3c5DibrX8dCGT5eSDWVY",
    authDomain: "rockpaperscissors-da080.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-da080.firebaseio.com",
    projectId: "rockpaperscissors-da080",
    storageBucket: "",
    messagingSenderId: "1079732630793"
  };
  firebase.initializeApp(config);
  const database = firebase.database();

  function initializeDatabaseData() {
    database.ref().set({
      players: {
        player1: {
          name: "",
          move: "",
          score: 0
        },
        player2: {
          name: "",
          move: "",
          score: 0
        }
      }
    });
    database.ref().once("value").then((snapshot) => {
      console.log("CLEARING DATABASE", snapshot.val().players);
    });
  }
  
  // Object.keys(connection)[0]
  let connection;
  let playerData;
  let player;

  // TODO STORE AND UPDATE PLAYERS LOCALLY AND UPDATE DATABASE USING THAT
  let players;

  function handleConnections() {
    const connectionsRef = database.ref("/connections");
    const connectedRef = database.ref(".info/connected");
    connectedRef.on("value", (snapshot) => {
      if(snapshot.val()) {
        let con = connectionsRef.push({timestamp: firebase.database.ServerValue.TIMESTAMP});
        connectionsRef.orderByChild("timestamp").limitToLast(1).once("value").then(snapshot => {
          console.log("our connection", snapshot.val());
          connection = Object.keys(snapshot.val())[0];
        });

        // TODO remove player for this connection
        con.onDisconnect().remove();
      }
    });

    connectionsRef.on("child_removed", (snapshot) => {
      console.log("Disconnected", snapshot.key);
      const key = snapshot.key;
      database.ref("players").once("value").then((snapshot) =>{
        console.log(snapshot.val());
        Object.values(snapshot.val()).forEach((player) => {
          console.log(player.id, key, player);
          if(player.id === key) {
            console.log("deleting", player.name);
            database.ref("players").orderByChild("id").equalTo(key).removeValue();
            // database.ref("players").orderByChild("id").equalTo(key).once("value").then((snapshot) => {
            //   // console.log("DUDE", snapshot.remove());
            // });

          }
        });
      });
      // console.log("players/" + player);
      // database.ref("players/" + player).set({
      //   name: "",
      //   move: "",
      //   score: 0,
      //   id: ""
      // });
    });
  }

  $(document).ready(() => {
    // initializeDatabaseData();
    handleConnections();

    $("#submit-name").on("click", (event) => {
      event.preventDefault();

      // Set player1 name first, otherwise set player2
      playerData = {
        name: $("#input-player-name").val(),
        move: "",
        score: 0,
        id: connection
      };
      database.ref("players").once("value").then((snapshot) => { 
        if(!snapshot.val().player1.name) {
          database.ref("players/player1").set({
            name: $("#input-player-name").val(),
            move: "",
            score: 0,
            id: connection
          });
        }
        else if(!snapshot.val().player2.name) {
          database.ref("players/player2").set({
            name: $("#input-player-name").val(),
            move: "",
            score: 0,
            id: connection
          });
        }
        $("#input-player-name").val("");
      });
    });

    database.ref("players").on("value", (snapshot) => {
      console.log("new player data", snapshot.val());
      // console.log(snapshot.val().connections);
    });


  });

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
   * player1 {name: "dylan", move: "rock", score: 0}
  ********************************************************/