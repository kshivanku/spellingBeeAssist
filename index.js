const express = require('express');
// const body-parser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;

const restService = express();

restService.post('/hook', function(req, res){
  console.log("request: ");
  console.log(req);
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  function gameAction(app){
    app.tell("this is a response from the webhook");
  }

  const actionMap = new Map();
  actionMap.set('game.action', gameAction);
  app.handleRequest(actionMap);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
