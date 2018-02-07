var PlugAPI = require('plugapi');
var creds = require('./creds.js');
var fs = require('fs');
var logger = require('jethro');

const coinPerPlay = 1;
const list = 2926288; // Bot playlist ID. Login as them, then go to https://plug.dj/_/playlists to see the ID's.

var bot = new PlugAPI({
	email: creds.email,
	password: creds.password
});

function fileChecks(){
	var fileUnparsed = '',
		fileContents;

	try {
		fileUnparsed = fs.readFileSync('usr.json').toString();
		fileContents = JSON.parse(fs.readFileSync('usr.json').toString());
	} catch (e) {
		logger('info', 'fileChecks Error', fileUnparsed + ':' + e);
		fileContents = { 'users': [] };
	}
	return fileContents;
}

function updateFile(contents){
	if (contents != null && typeof contents != 'undefined' && typeof contents != 'null' && contents != 'null'){
		logger('info', 'updateFile', contents);
		fs.truncateSync('usr.json');
		fs.writeFileSync('usr.json', contents, {'encoding': 'utf8'});
	} else {
		logger('info', 'updateFile', 'contents is: ' + contents);
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
		fileContents.users.push({ 'username': user.username, 'coins': 0 });
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
		logger('info', 'addCoin', 'user ' + user + ' doesn\'t exist');
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
		logger('info', 'getCoin', user + ' has ' + coins + ' coins.');
		return coins;
	} else {
		logger('info', 'getCoin', user + ' is not found.');
		return 0;
	}
}

bot.on('roomJoin', function(room) {
	logger('info', 'Joined', 'Joined' + room);
	bot.sendChat('Successfully started PLUR Bot: '+bot.getSelf().username+'. Type !help for a list of commands');
	var djs = 0;

	bot.getWaitList().forEach(function(){
		djs++;
	});

	logger('info', 'DJs', djs);

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

bot.on('command:help', function(data){
	bot.sendChat('Hey, @' + data.from.username + '! I am ' + bot.getSelf().username + ', auto-moderator in this room! I keep a credits system for DJs, which is kind of like a DJ rank for this room specifically. You can see your credit balance by typing !credits.');
	bot.sendChat('I will auto skip a song if it reaches 5 Mehs. I also play music when no one else is playing.');
});

bot.on('command:credits', function(data){
	bot.sendChat('@' + data.from.username + ' You have ' + getCoin(data.from.username) + ' credits.');
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
		bot.woot();
	}
	if (bot.getDJ() != null){
		var dj = bot.getDJ();
		updateFile(JSON.stringify(addCoin(dj.username, coinPerPlay)));
	}
});

bot.on('chat', function(data){
	if (data.message.indexOf('@' + bot.getSelf().username) > -1){
		bot.sendChat('Hey @' + data.from.username + '! I am a robot. Learn more by typing \'!help\'');
	}
});

bot.on('vote', function(data){
	if(bot.getRoomScore.negative >= 5){
		bot.sendChat('5 Mehs reached, skipping song...');
		bot.moderateForceSkip();
	}
});

bot.connect(creds.room);
