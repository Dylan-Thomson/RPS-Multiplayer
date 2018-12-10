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