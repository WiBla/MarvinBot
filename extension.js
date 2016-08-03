(function(){
	var fork = "WiBla";
	var gifCooldown = new Date().getTime();
	var settings = JSON.parse(localStorage.getItem("basicBotsettings"));
	var emote = [
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':skull:',      -50, 10],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':bomb:',       -25, 15],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':troll:',      0,   10],
		[':apple:',      5,   5],
		[':apple:',      5,   5],
		[':apple:',      5,   5],
		[':apple:',      5,   5],
		[':apple:',      5,   5],
		[':lemon:',      5,   5],
		[':lemon:',      5,   5],
		[':lemon:',      5,   5],
		[':lemon:',      5,   5],
		[':lemon:',      5,   5],
		[':cherries:',   10,  3],
		[':cherries:',   10,  3],
		[':cherries:',   10,  3],
		[':grapes:',     10,  3],
		[':grapes:',     10,  3],
		[':grapes:',     10,  3],
		[':watermelon:', 10,  3],
		[':watermelon:', 10,  3],
		[':watermelon:', 10,  3],
		[':pineapple:',  10,  3],
		[':pineapple:',  10,  3],
		[':pineapple:',  10,  3],
		[':zap:',        10,  3],
		[':zap:',        10,  3],
		[':zap:',        10,  3],
		[':cookie:',     20,  2],
		[':cookie:',     20,  2],
		[':strawberry:', 25,  2],
		[':strawberry:', 25,  2],
		[':panda_face:', 30,  2],
		[':panda_face:', 30,  2],
		[':coffee:',     100, 1],
		[':ice_cream:',  250, 1],
		[':gift:',       500, 1]
	];
	var cd = [];
	window.wins = [];

	function chat(msg) {
		if (msg.type !== 'log' && msg.message.toLowerCase().trim() == '!loto') {
			if (cd.length == 0) {
				loto(msg);
				cd.push([msg.un, msg.uid, new Date().getTime()]);
			} else {
				for (var i = 0; i < cd.length; i++) {
					if (msg.uid == cd[i][1]) {
						var day = new Date(cd[i][2]).getDate();
						if (day !== new Date().getDate()) {
							loto(msg);
							cd[i][2] == new Date().getTime();
							break;
						} else {
							API.sendChat('@'+msg.un+', only one chance per day, retry tomorrow !');
						}
					} else if (i+1 >= cd.length) {
						loto(msg);
						cd.push([msg.un, msg.uid, new Date().getTime()]);
						break;
					}
				}
			}
		}
	}
	function loto(msg) {
		var row1 = Math.floor(Math.random()*emote.length);
		var row2 = Math.floor(Math.random()*emote.length);
		var row3 = Math.floor(Math.random()*emote.length);
		var earn = 0;

		for (var i = 0; i < emote.length; i++) {
			if (row1 == i) {
				row1 = emote[i][0];
				earn += emote[i][1];
			}
			if (row2 == i) {
				row2 = emote[i][0];
				earn += emote[i][1];
			}
			if (row3 == i) {
				row3 = emote[i][0];
				earn += emote[i][1];
			}
		}

		if (earn <= 0) API.sendChat(row1+'|'+row2+'|'+row3+', @'+msg.un+', you lost, retry tomorrow !');
		else {
			API.sendChat(row1+'|'+row2+'|'+row3+' @'+msg.un+', you won '+earn+'PP ! :tada: :confetti_ball:');
			if (wins.length > 0) {
				for (var i = 0; i < wins.length; i++) {
					// If user already in wins, update
					if (msg.uid == wins[i][1]); {
						return wins[i][2] += earn;
					}
				}
				wins.push([msg.un, msg.uid, earn]);
				// else add user to wins list
			}	else wins.push([msg.un, msg.uid, earn]);
		}
	}

	function extend() {
		if (!window.bot) return setTimeout(extend, 1 * 1000);

		var bot = window.bot;
		bot.retrieveSettings();
		var spamWords = ['skip'];
		for (var i = 0; i < spamWords.length; i++) {
			window.bot.chatUtilities.spam.push(spamWords[i]);
		}

		// Redefining gifCommand to be bouncer min and with 60s cooldown
		bot.commands.gifCommand = {
			command: ['gif', 'giphy'],
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				if ((new Date().getTime() - gifCooldown)/1000/60 < 1) return void (0); // if less than a minute
				else {
					gifCooldown = new Date().getTime();
					var msg = chat.message;
					if (msg.length !== cmd.length) {
						function get_id(api_key, fixedtag, func)
						{
							$.getJSON(
								"https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating,
									"tag": fixedtag
								},
								function(response)
								{
									func(response.data.id);
								}
								)
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "pg-13"; // PG 13 gifs
						var tag = msg.substr(cmd.length + 1);
						var fixedtag = tag.replace(/ /g,"+");
						var commatag = tag.replace(/ /g,", ");
						get_id(api_key, tag, function(id) {
							if (typeof id !== 'undefined') {
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Tags: '+commatag+']');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid tags, try something different. [Tags: '+commatag+']');
							}
						});
					}
					else {
						function get_random_id(api_key, func)
						{
							$.getJSON(
								"https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating
								},
								function(response)
								{
									func(response.data.id);
								}
								)
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "pg-13"; // PG 13 gifs
						get_random_id(api_key, function(id) {
							if (typeof id !== 'undefined') {
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Random GIF]');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid request, try again.');
							}
						});
					}
				}
			}
		};
		// Redefine kick to use ajax
		bot.commands.kickCommand = {
			command: 'kick',
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var msg = chat.message;
					var lastSpace = msg.lastIndexOf(' ');
					var time;
					var name;
					if (lastSpace === msg.indexOf(' ')) {
						time = 15;
						name = msg.substring(cmd.length + 2);
					}
					else {
						time = msg.substring(lastSpace + 1);
						name = msg.substring(cmd.length + 2, lastSpace);
					}

					var user = null;
					var users = API.getUsers();
					for (var i = 0; i < users.length; i++) {
						var match = users[i].username.trim() == name.trim();
						if (match) {
							user = users[i];
						}
					}
					
					var from = chat.un;
					if (typeof user == 'null') return API.sendChat('/me [@'+chat.un+'] No user specified.');

					var permFrom = API.getUser(chat.uid).role;
					var permTokick = API.getUser(user.id).role;
					if (permFrom <= permTokick) return API.sendChat('/me [@'+chat.un+'] you can\'t kick users with an equal or higher rank than you!');

					if (!isNaN(time)) {
						var duration;
						if (time>=24*60*60) duration = 'f';
						else if (time>=60*60) duration = 'd';
						else duration = 'h';
						$.ajax({
							type: 'POST',
							url: 'https://plug.dj/_/bans/add',
							data: JSON.stringify({'userID':user.id,'reason':1,'duration':duration}),
							dataType: 'json',
							contentType: 'application/json',
							error: function(e) {console.log(e);},
							success: function(){
								API.sendChat('/me '+user.username+' was kicked for '+time+' seconds.');
								setTimeout(function(){
									$.ajax({
										type: 'DELETE',
										url: 'https://plug.dj/_/bans/'+user.id,
										error: function(e) {console.log(e);},
										success: function(){
											API.sendChat('/me '+user.username+' was successfully unbaned.');
										}
									});
								}, time*1000);
							}
						});
					} else API.sendChat('/me [@'+chat.un+'] Invalid time specified');
				}
			}
		};
		// Fixing link cmd to display soundcloud links
		bot.commands.linkCommand = {
			command: 'link',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var thisMedia = API.getMedia();
					if (thisMedia.format == 1) API.sendChat('/me [@'+chat.un+'] Link to current song: https://youtu.be/'+thisMedia.cid);
					else {
						var sound = SC.get('/tracks/' + thisMedia.cid);
					  // setTimeout is used because SC doesn't return immediately the track
					  setTimeout(function(){API.sendChat('/me [@'+chat.un+'] Link to current song: '+sound['_result'].permalink_url);}, 1000);
					}
				}
			}
		};
		// Improving clearlocalstorage to save plug settings, send a chat message and reload automaticaly
		bot.commands.clearlocalstorageCommand = {
			command: 'clearLS',
			rank: 'manager',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var plugSettings = localStorage.getItem('settings');
					localStorage.clear();
					localStorage.setItem('settings', plugSettings);
					API.sendChat('/me [@'+chat.un+'] localStorage cleared ! Be right back..');
					location.reload();
				}
			}
		};
		// Tell someone "I'm a bot"
		bot.commands.bot = {
			command: 'bot',
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var msg = chat.message;
					if (msg.length === cmd.length) return API.sendChat("I am indeed a bot.");
					var name = msg.substr(cmd.length + 1);
					if (msg.length > cmd.length + 1) {
						API.sendChat("/me " + name + ", I am a bot, you can try to talk to me but I won't answer unless you use commands.");
					}
				}
			}
		};
		bot.commands.blocop = {
			command: 'blocop',
			rank: 'user',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var msg = chat.message;
					if (msg.length === cmd.length) return API.sendChat('/me [@'+chat.un+'] No user specified');

					var name = msg.substr(cmd.length + 1).replace('@','');
					if (name.length > 0) {
						var audience = API.getUsers();
						for (var i = 0; i < audience.length; i++) {
							if (audience[i].rawun == name) return API.sendChat('/me Le bloc opératoire N°404 est disponible pour une ablation de côtes ' + name + '.');;
						}
						API.sendChat('/me [@'+chat.un+'] There is no user by this name.');
					}
				}
			}
		};
		// Fixing voteSkip
		API.on(API.SCORE_UPDATE, function(){
			var voteskip = settings.voteSkip;
			var voteSkipLimit = settings.voteSkipLimit;

			if (voteskip && API.getScore().negative >= voteSkipLimit) {
				API.sendChat("/me Too many mehs, skipping..");
				API.moderateForceSkip()
			}
		});
		// Auto skip songs with 'nightcore' in title as it's not allowed
		API.on(API.ADVANCE, function(e){
			if (e.media.title.toLowerCase().search('nightcore') != -1 || e.media.author.toLowerCase().search('nightcore') != -1) {
				API.sendChat('/me [@'+e.dj.rawun+'] nightcore is not allowed. Skipping..');
				API.moderateForceSkip();
			}
		});
		// Export all chat since bot has been loaded into a log.txt
		API.on(API.CHAT_COMMAND, function(cmd){
			if (cmd == '/exportchat') {
				var logs = JSON.parse(localStorage.getItem('basicBotRoom'));
				logs = logs.chatMessages;

				var log = '';
				for (var i=0; i<logs.length; i++) {
				  log += '['+logs[i].join('] [')+']\n';
				}

				var dl = document.createElement('a');
				dl.href = 'data:attachment/text,' + encodeURI(log);
				dl.target = '_blank';
				dl.download = 'log.txt';
				dl.click();
		  }
		});
		API.on(API.CHAT, function(msg){chat(msg);});

		bot.loadChat();
	}

	localStorage.setItem("basicBotsettings", JSON.stringify({
		botName: "MarvinBot",
		language: "english",
		chatLink: "https://rawgit.com/WiBla/custom/master/lang/en.json",
		scriptLink: "https://rawgit.com/bscBot/source/master/basicBot.js",
		roomLock: false,
		startupCap: 1,
		startupVolume: 0,
		startupEmoji: true,
		autowoot: true,
		autoskip: true,
		smartSkip: true,
		cmdDeletion: true,
		maximumAfk: 240,
		afkRemoval: false,
		maximumDc: 120,
		bouncerPlus: true,
		blacklistEnabled: true,
		lockdownEnabled: false,
		lockGuard: false,
		maximumLocktime: 10,
		cycleGuard: true,
		maximumCycletime: 30,
		voteSkip: true,
		voteSkipLimit: 5,
		historySkip: true,
		timeGuard: true,
		maximumSongLength: 7.5,
		autodisable: false,
		commandCooldown: 30,
		usercommandsEnabled: true,
		skipPosition: 3,
		skipReasons: [
			["theme", "This song does not fit the room theme. "],
			["op", "This song is on the OP list. "],
			["history", "This song is in the history. "],
			["sound", "The song you played had bad sound quality or no sound. "],
			["unavailable", "The song you played was not available for some users. "],
			["indispo", "The song you played was not available for some users. "]
		],
		afkpositionCheck: 0,
		afkRankCheck: "admin",
		motdEnabled: false,
		motdInterval: 10,
		motd: "",
		filterChat: false,
		etaRestriction: true,
		welcome: true,
		opLink: "http://wibla.free.fr/plug/room#op",
		rulesLink: "http://wibla.free.fr/plug/rules",
		themeLink: "http://a2.files.magneticmag.com/image/upload/c_fill,cs_srgb,q_60,w_768/MTMzNzAxMTUzMjI0NDAzNTg3.png",
		fbLink: null,
		youtubeLink: null,
		website: "http://wibla.free.fr/plug",
		intervalMessages: [
			"Join the discord: https://discord.gg/eJGAVBT",
			"Try the new !loto and get a chance to win PPs ! One chance per day !"
		],
		messageInterval: 10,
		songstats: true,
		commandLiteral: "!",
		blacklists: {
			NSFW: null,
			OP: "https://rawgit.com/WiBla/custom/master/blacklists/OPlist.json",
			BANNED: "https://rawgit.com/WiBla/custom/master/blacklists/BANNEDlist.json"
		}
	}));

	$.getScript("https://rawgit.com/bscBot/source/master/basicBot.js", extend);
}).call(this);
