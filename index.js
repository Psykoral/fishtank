var PlugAPI = require('plugapi');
var creds = require('./creds.js');
var bot = new PlugAPI({
    email: creds.email,
    password: creds.password
});

var list = 10137463;

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
        if (bot.getDJ().username != "F!shtank"){
            bot.leaveBooth();
        }
    }
});

bot.on('command:hello', function(data){
    bot.sendChat("Hey, @" + data.from.username + "! I am F!shtank, a little decoration in this room! I also play music when noone else is playing. Ask me anything.");
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
        if (bot.getDJ().username != "F!shtank"){
            bot.leaveBooth();
        }
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
