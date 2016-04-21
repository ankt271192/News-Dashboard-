function request(method, url, body, type, callback){
    var req = new XMLHttpRequest();
    req.open(method, url);
    if (type) {
        req.setRequestHeader("Content-Type", type);
    }
    req.addEventListener("load", function() {
        if (req.status == 200) {
            if (req.getResponseHeader("Content-Type").match(/application\/json/)) {
                callback(null, JSON.parse(req.responseText));
            } else {
                callback(null, req.responseText);
            }
        } else {
            callback(req);
        }
    });
    req.send(body);
}
function createPost(title,url,author,likes,id) {
    var node = document.createElement("div");
    node.className = "node grey";
    var link = document.createElement("a");
    link.className = "bold";
    link.setAttribute("href",url);
    link.textContent = title;
    node.appendChild(link);
    var writer = document.createElement("div");
    writer.className = "inline";
    writer.textContent = "- "+author;
    node.appendChild(writer); 
    var about = document.createElement("div");
    var likebox= document.createElement("div");
    likebox.className = "inline actions";
    likebox.textContent = likes+" likes";
    about.appendChild(likebox);
    var button = document.createElement("button");
    button.className = "actions";
    button.addEventListener("click",function(e) {
        like(id,likebox);
    });
    button.textContent = "Like";
    about.appendChild(button);
    node.appendChild(about);
    return node;
}
function like(id,element) {
    request("POST","/like",JSON.stringify({id: id}),"application/json", function(err, res) {
        if (err) {
            alert("Connection Error");
        } else {
            if (res.error) {
                alert(res.message);
            } else {
                element.textContent = res.val+" likes";
            }
        }
    });
} 
function start(){
    var links = document.querySelector(".links")
    var span = links.querySelector("span"); 
    var login = links.querySelectorAll("a")[1];
    var container = document.querySelector(".posts");
    request("GET","/posts",null,null,function(err,res) {
        if (err) {
            alert("Connection Error");
        } else {
            if (res.error) {
                alert(res.message);
            } else {
                var name = res.name;
                var obj = res.obj;
                if (name) {
                    span.textContent = "| "+name+" |";
                    login.setAttribute("href","/logout");
                    login.textContent = "logout";
                }
                if (obj) {
                    for (var key in obj) {
                        var value = JSON.parse(obj[key]);
                        var id = /\d+/.exec(key)[0];
                        container.appendChild(createPost(value.title,value.url,value.author,value.likes,id));
                    }  
                } else {
                    container.textContent = "No posts in the database.";
                } 
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", function(){
    start();
});