const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const request = require('request');

const restService = express();
restService.use(bodyParser.json());

const NOREPLY = ['do you want to play?', 'Say yes if you want to play', 'We can stop here. See you soon!'];

restService.post('/hook', function(req, res) {
  const app = new ApiAiApp({
    request: req,
    response: res
  });

  function welcomeUser(app) {
    app.setContext("wakeUpGame", 2);
    app.ask("Hi! this is spelling bee, do you want to play?", NOREPLY);
  }

  function gameAction(app) {
    var userResponse = app.getArgument("confirm_command");
    if (userResponse == "positive") {
      sendRandomWord(app);
    } else {
      app.tell("Thats ok, come back later for more interesting words!");
    }
  }

  function sendRandomWord(app) {
    request.get({
      url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=-1&maxDictionaryCount=-1&minLength=15&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }, function(err, response, body) {
      body = JSON.parse(body);
      var word = body.word;
      var parameters = {}
      parameters["word"] = word;
      app.setContext("wordgiven", 10, parameters);
      app.tell("Awesome! Lets start. Spell the word " + word + ". You can ask me the meaning of the word or usage in a sentence. Say, I am ready to spell, whenever you are ready to give your answer.");
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
      app.tell("The meanings of the word is. " + definition + ". Say, I am ready to spell, whenever you are ready to give your answer.");
    });
  }

  function sendUsage(app){
    console.log("inside usage function");
    var word = app.getContextArgument("wordgiven", "word");
    request.get({
      url: "http://api.wordnik.com:80/v4/word.json/" + word.value + "/topExample?useCanonical=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }, function(err, response, body){
      body = JSON.parse(body);
      var usage = body.text;
      console.log("response body: ");
      console.log(body);
      console.log("usage: " + usage);
      app.tell("Here's how you can use it in a sentence. " + usage + ". Say, I am ready to spell, whenever you are ready to give your answer.");
    });
  }

  function repeatWord(app){
    var word = app.getContextArgument("wordgiven", "word");
    app.tell("The word is, " + word.value + ". Say, I am ready to spell, whenever you are ready to give your answer.");
  }

  function readytospell(app){
    app.setContext("readytospell", 3);
    app.tell("ok, start spelling");
  }

  function checkAnswer(app){
    app.setContext("wakeUpGame", 1);
    var userAnswer = app.getArgument("userAnswer");
    var word = app.getContextArgument("wordgiven", "word");
    var wordAlpha = word.value.replace(/[\s\-]/g,''); //removes spaces if any in between
    var userAnswerAlpha = userAnswer.replace(/[\s\-]/g,'');
    if(userAnswerAlpha == wordAlpha) {
      app.ask("Congratulations! Your spelling is correct. Would you like to try one more word?", NOREPLY);
    }
    else {
      var spelling = "";
      for(var i = 0 ; i < word.value.length ; i++){
        spelling += word.value[i] + ". "
      }
      app.ask("Oops! Your spelling is incorrect. The correct spelling is. " + spelling + word.value + ". Would you like to try another word?", NOREPLY);
    }
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', welcomeUser);
  actionMap.set('game.action', gameAction);
  actionMap.set('asking.detail', askingDetail);
  actionMap.set('repeat.word', repeatWord);
  actionMap.set('ready.tospell', readytospell);
  actionMap.set('answer.given', checkAnswer);
  app.handleRequest(actionMap);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
