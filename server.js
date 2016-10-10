var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var logger = require('morgan');
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;
var app = express();

app.listen(PORT, function() {
	console.log("App listening on PORT: " + PORT);
});

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

// // MODELS =======================================
// var User = require('./models/User.js');

// var exampleUser = new User ({
// 	name: 'Sherlock Holmes'
// });

// exampleUser.save(function(err, doc) {
// 	if (err) {
// 		console.log(err);
// 	}
// 	else {
// 		console.log(user);
// 	}
// });


// MONGO URI: mongodb://heroku_ndp8gp94:sb9svak977ksqmhni15m5a72vo@ds053126.mlab.com:53126/heroku_ndp8gp94