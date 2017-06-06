const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res){
  console.log("request: ");
  console.log(req);
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  function welcomeUser(app){
    app.ask("Hi! this is spelling bee, do you want to play?", ['do you want to play?', 'Say yes if you want to play', 'We can stop here. See you soon!']);
  }

  function gameAction(app){
    var userResponse = app.getArgument("confirm_command");
    if(userResponse == "positive") {
      app.tell("Awesome! Lets start.");
    }
    else {
      app.tell("Too bad, see you later!");
    }
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('game.action', gameAction);
  app.handleRequest(actionMap);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
