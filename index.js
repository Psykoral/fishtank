var PlugAPI = require('plugapi');
var creds = require('./creds.js');
var fs = require('fs');

const coinPerPlay = 1;
const list = 10137463;

var bot = new PlugAPI({
    email: creds.email,
    password: creds.password
});

function fileChecks(){
    var fileUnparsed = "";
    try {
        fileUnparsed = fs.readFileSync("usr.json").toString();
        var fileContents = JSON.parse(fs.readFileSync("usr.json").toString());
    } catch(e) {
        console.log("[fileCheckError] " + fileUnparsed + ":" + e);
        var fileContents = { "users": [] };
    }
    return fileContents;
}

function updateFile(contents){
    if (contents != null && typeof contents != "undefined" && typeof contents != "null" && contents != "null"){
        console.log("[fileUpdate] " + contents);
        fs.truncateSync("usr.json");
        fs.writeFileSync("usr.json", contents, {"encoding": "utf8"});
    } else {
        console.log("[fileUpdate] contents is " + contents);
    }
}

function newUser(user){
    var usrindex = -1;
    var fileContents = fileChecks();
    fileContents.users.forEach(function(filevalue, fileindex){
        if (user.username == filevalue.username){
            usrindex = fileindex;
        }
    });
    if (usrindex == -1){
        fileContents.users.push({ "username": user.username, "coins": 0 });
        return fileContents;
    } else {
        return null;
    }
}

function addCoin(user, amount){
    var fileContents = fileChecks();
    var usrindex = -1;
    fileContents.users.forEach(function(value,index){
        if (value.username == user){
            usrindex = index;
        }
    });
    if (usrindex != -1){
        fileContents.users[usrindex].coins += amount;
        return fileContents;
    } else {
        console.log("[addCoin] user " + user + " doesn't exist");
        return null;
    }
}

function getCoin(user){
    var fileContents = fileChecks();
    var coins = -1;
    fileContents.users.forEach(function(value,index){
        if (value.username == user){
            coins = value.coins;
        }
    });
    if (coins != -1){
        console.log("[getCoin] " + user + " has " + coins + " coins.");
        return coins;
    } else {
        console.log("[getCoin] " + user + " is not found.");
        return 0;
    }
}

bot.on('roomJoin', function(room) {
    console.log("Joined " + room + ".");
    var djs = 0;
    bot.getWaitList().forEach(function(){
        djs++;
    });
    console.log(djs);
    if (djs == 0 && bot.getDJ() == null){
        bot.activatePlaylist(list);
        bot.joinBooth();
    } else {
        if (bot.getDJ().id != bot.getSelf().id){
            bot.leaveBooth();
        }
    }
    bot.getUsers().forEach(function(value, index){
        updateFile(JSON.stringify(newUser(value)));
    });
});

bot.on('userJoin', function(data){
    updateFile(JSON.stringify(newUser(data)));
});

bot.on('command:hello', function(data){
    bot.sendChat("Hey, @" + data.from.username + "! I am " + bot.getSelf().username + ", a little decoration in this room! I also play music when noone else is playing. Ask me anything.");
});

bot.on('command:money', function(data){
    bot.sendChat("@" + data.from.username + " You have " + getCoin(data.from.username) + " coins.");
});

bot.on('advance', function(data){
    var djs = 0;
    bot.getWaitList().forEach(function(){
        djs++;
    });
    if (djs == 0 && bot.getDJ() == null){
        bot.activatePlaylist(list);
        bot.joinBooth();
    } else {
        if (bot.getDJ().id != bot.getSelf().id){
            bot.leaveBooth();
        }
    }
    if (bot.getDJ() != null){
        var dj = bot.getDJ();
        updateFile(JSON.stringify(addCoin(dj.username, coinPerPlay)));
    }
});

bot.on('chat', function(data){
    if (data.message.startsWith("@F!shtank")){
        bot.sendChat("Hey @" + data.from.username + "! I am a robot. Learn more by typing \"!hello\"");
    }
});

bot.on('vote', function(data){
    if(bot.getRoomScore.negative >= 5){
        bot.sendChat("5 Mehs reached, skipping song...");
        bot.moderateForceSkip();
    }
});

bot.connect('swaq-hanger');
