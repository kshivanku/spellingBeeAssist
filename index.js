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
    app.setContext("wakeUpGame", 2);
    app.ask("Hi! this is spelling bee, do you want to play?", ['do you want to play?', 'Say yes if you want to play', 'We can stop here. See you soon!']);
  }

  function gameAction(app){
    var userResponse = app.getArgument("confirm_command");
    if(userResponse == "positive") {
      var word = generateRandomWord();
      app.tell("Awesome! Lets start. Spell the word ");
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

function generateRandomWord(){
  request.get({
    url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=-1&maxDictionaryCount=-1&minLength=15&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
  }, function (err, response, body){
    body = JSON.parse(body);
    console.log(body);
  })
}

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
