const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const request = require('request');

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res) {
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  function welcomeUser(app) {
    app.setContext("wakeUpGame", 2);
    app.ask("Hi! this is spelling bee, do you want to play?", ['do you want to play?', 'Say yes if you want to play', 'We can stop here. See you soon!']);
  }

  function gameAction(app) {
    var userResponse = app.getArgument("confirm_command");
    if (userResponse == "positive") {
      sendRandomWord(app);
    } else {
      app.tell("Too bad, see you later!");
    }
  }

  function sendRandomWord(app) {
    request.get({
      url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=-1&maxDictionaryCount=-1&minLength=15&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }, function(err, response, body) {
      body = JSON.parse(body);
      var word = body.word;
      word.replace(/\s/g,''); //removes spaces if any in between
      var parameters = {}
      parameters["word"] = word;
      app.setContext("wordgiven", 5, parameters);
      app.tell("Awesome! Lets start. Spell the word " + word);
    });
  }

  function askingDetail(app){
    var detail_type = app.getArgument("detail_type");
    console.log("detail_type: " + detail_type);
    if(detail_type == "definition"){
      sendDefinition(app);
    }
    else if(detail_type == "usage"){
      sendUsage(app);
    }
  }

  function sendDefinition(app){
    console.log("inside define function");
    var word = app.getContextArgument("wordgiven", "word");
    console.log("In definition: " + word.value);
    request.get({
      url: "http://api.wordnik.com:80/v4/word.json/" + word.value + "/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }, function(err, response, body){
      body = JSON.parse(body);
      console.log(body);
      var definition = body[0].text;
      app.tell("One of the meanings of the word is, " + definition);
    });
  }

  function sendUsage(app){
    console.log("inside usage function");
    var word = app.getContextArgument("wordgiven", "word");
    request.get({
      url: "http://api.wordnik.com:80/v4/word.json/" + word.value + "/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }, function(err, response, body){
      body = JSON.parse(body);
      var usage = body.text;
      console.log("response body: ");
      console.log(body);
      console.log("usage: " + usage);
      app.tell("One of the usage of the word is, " + usage);
    });
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('game.action', gameAction);
  actionMap.set('asking.detail', askingDetail);
  app.handleRequest(actionMap);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
