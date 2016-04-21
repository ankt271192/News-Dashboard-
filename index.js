var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var sessions = require('client-sessions');

// Setting up database

if (process.env.REDISCLOUD_URL) {
    var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
} else {
    var client = redis.createClient();
}

client.on("error", function (err) {
    console.log("Error " + err);
});

// Creating Express App

var app = express();

// Creating Session

app.use(sessions({
    cookieName: 'authSession', 
    secret: 'dashboard@ycomb', 
    duration: 60 * 60 * 1000 
}));

// Including Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Routes

app.get('/posts', function (req,res) {
    client.hgetall("posts", function(err,obj) {
        if (err) {
            console.log(err);
        } else {
            if (req.authSession.details) {
                res.send({ obj: obj, name: req.authSession.details.user });    
            } else {
                res.send({ obj: obj, name: null });
            }
        }
    });
});

app.post('/like', function(req,res) {
    if (req.authSession.details) {
        var postID = "post:"+req.body.id;
        client.hget("posts",postID, function(err,obj) {
            if (err) {
                console.log(err);
            } else {
                var parsedObj = JSON.parse(obj);
                parsedObj.likes += 1;
                client.hset("posts", postID, JSON.stringify(parsedObj), redis.print);
                res.send({val: parsedObj.likes});    
            }
        });
    } else {
        res.send({error: true, message: "you are not logged in"});
    }
});

app.post('/login',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    getValue(username, function(value) {
        if (value === password) {
            req.authSession.details = {
            user: username,
            login: true
            };
            res.redirect('/');
        } else {
            res.send('Invalid Username/Password.<a href="/login.html">Try again</a>');
        }
    });
});

app.get('/logout', function(req,res) {
    delete req.authSession.details;
    res.redirect('/');
});

app.post('/create',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    client.set(username, password, redis.print);
    res.redirect('/login.html');
});

app.post('/submit',function(req,res) {
    var title = req.body.title;
    var url = req.body.url;
    if (req.authSession.details) {
        getValue("postID", function(value) {
            var id = Number(value) + 1;
            if (value) {
                client.incr("postID", redis.print);
            } else {
                client.set("postID","1", redis.print);
            }
            client.hset("posts", "post:"+id, JSON.stringify({ title: title, url: url, author: req.authSession.details.user, likes:0 }), redis.print);
            res.redirect('/');
        });
    } else {
        res.send('You are not logged in.<a href="/login.html">Login here</a>');
    }
});

// Setting Port

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log("App is running at localhost:" + app.get('port'));
});

// Utility Functions

function getValue(key, callback) {
    client.get(key, function(err, reply) {
        if (err) {
            console.log(err);
        } else {
            callback(reply);
        }
    });
}