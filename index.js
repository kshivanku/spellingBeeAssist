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
  actionMap.set('game.action', gameAction);
  app.handleRequest(actionMap);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
