var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var logger = require('morgan');

var PORT = 3000;
var app = express();

// ROUTES ======================================
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}))

app.use(express.static('./public'));

// MAIN ROUTE =================================
app.get('/', function(req, res){
    res.sendFile('./public/index.html');
});

// MONGO CONNECTION =================================
mongoose.connect('mongodb://localhost/portfolioDB');
var db = mongoose.connection;

db.on('error', function (err) {
  console.log('Mongoose Error: ', err);
});
db.once('open', function () {
  console.log('Mongoose connection successful.');
});

app.listen(process.env.PORT || 3000);
console.log("Listening on port", PORT);

