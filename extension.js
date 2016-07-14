(function(){
	var fork = "WiBla";
	var gifCooldown = new Date().getTime();
	var settings = JSON.parse(localStorage.getItem("basicBotsettings"));

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
		},
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
				API.moderateForceSkip()
			}
		});

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
			["mix", "You played a mix, which is against the rules. "],
			["sound", "The song you played had bad sound quality or no sound. "],
			["nsfw", "The song you contained was NSFW (image or sound). "],
			["unavailable", "The song you played was not available for some users. "]
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
		themeLink: "http://wibla.free.fr/plug/rules#9",
		fbLink: null,
		youtubeLink: null,
		website: "http://wibla.free.fr/plug",
		intervalMessages: [
			"Join the discord: https://discord.gg/eJGAVBT"
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
