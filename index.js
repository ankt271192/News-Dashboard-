var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var client = redis.createClient();

var app = express();

client.on("error", function (err) {
    console.log("Error " + err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.post('/login',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    equals(username, password, function() {
        res.send('You are logged in with Username: '+username+' Password: '+password);
    }, function () {
        res.send('Invalid Username/Password');
    });
});

app.post('/create',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    client.set(username, password, redis.print);
    res.send('Account Created');
});

app.post('/submit',function(req,res) {
    console.log(req.body);
});


app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log("App is running at localhost:" + app.get('port'));
});

function equals(key, value, success, failure) {
    client.get(key, function(err, reply) {
        if (reply && reply === value) {
            success();
        } else {
            failure();
        }
    });
}