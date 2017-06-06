const express = require('express');
const body-parser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;

const restService = express();

restService.post('/hook', function(req, res){
  console.log(req);
});

restService.listen((process.env.PORT || 5000), function() {
  console.log("Server listening");
});
