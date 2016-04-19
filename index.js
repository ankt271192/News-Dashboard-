var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var client = redis.createClient("6379","localhost");

var app = express();

client.on("error", function (err) {
    console.log("Error " + err);
});

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
    var getpass;
    client.get(username,function(err, reply) {
        // reply is null when the key is missing 
        console.log(reply);
        getpass = reply;
    });
    if (getpass && password === getpass) {
        res.send('You are logged in with Username: '+username+' Password: '+password);
    }
    else {
        res.send('Invalid Username/Password');
    }
});

app.post('/signup',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    client.set(username, password, redis.print);
    res.send('Account Created');
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log("App is running at localhost:" + app.get('port'));
});