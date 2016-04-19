var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

/*
app.get('/',function(req,res) {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/login',function(req,res) {
    res.sendFile(__dirname+'/public/login.html');
});
*/

app.post('/login',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    res.send('Username: '+username+' Password: '+password);
});

app.post('/signup',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    res.send('Account Created');
});

app.listen(5000,function() {
    console.log("App is running at localhost:5000");
});