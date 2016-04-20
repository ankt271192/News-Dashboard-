var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var sessions = require('client-sessions');

var client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var app = express();

app.use(sessions({
    cookieName: 'authSession', 
    secret: 'dashboard@ycomb', 
    duration: 60 * 60 * 1000 
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

//Routes

app.get('/posts', function (req,res) {
    client.hgetall("posts", function(err,obj) {
        if (err) {
            console.log(err);
        } else {
            console.dir(obj);
            res.send(obj);
        }
    });
});

app.post('/login',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    equals(username, password, function() {
        req.authSession.details = {
            user: username,
            login: true
        };
        res.send('You are logged in with Username: '+username+' Password: '+password);
    }, function () {
        res.send('Invalid Username/Password');
    });
});

app.get('/logout', function(req,res) {
    delete req.authSession.details;
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/create',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    client.set(username, password, redis.print);
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/submit',function(req,res) {
    var title = req.body.title;
    var desc = req.body.desc;
    client.hset("posts", title, JSON.stringify({ desc: desc, author: req.authSession.details.user }), redis.print);
    res.sendFile(__dirname + '/public/index.html');
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log("App is running at localhost:" + app.get('port'));
});

//Utility Functions

function equals(key, value, success, failure) {
    client.get(key, function(err, reply) {
        if (err) {
            console.log(err);
        } else if (reply && reply === value) {
            success();
        } else {
            failure();
        }
    });
}