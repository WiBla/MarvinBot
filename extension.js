(function(){
	const fork = "WiBla";
	window.cooldown = {
		"gif": 0,
		"loto": []
	};
	window.wins = [];
	var lotoCDLS = localStorage.getItem('loto-CD');
	var lotoWinsLS = localStorage.getItem('loto-Wins');
	var emote = [
		[':skull:',            0, 95],
		[':pill:',             0, 95],
		[':bomb:',             0, 95],
		[':space_invader:',    0, 95],
		[':package:',          0, 95],
		[':troll:',            0, 95],    // 95% chance to lose
		[':cherries:',       500, 95],    // 5%
		[':grapes:',        1000, 98],    // 2%
		[':zap:',           2000, 99.7],  // 0.3%
		[':game_die:',      5000, 99.9],  // 0.1%
		[':crown:',        10000, 99.95], // 0.05%
		[':gift:',         25000, 99.999] // 0.001%
	];
	function loto(msg) {
		var row1 = generateEmote();
		var row2 = generateEmote();
		var row3 = generateEmote();
		var earn = row1[1] + row2[1] + row3[1];
		row1 = row1[0];
		row2 = row2[0];
		row3 = row3[0];

		// Jackpot
		if (row1 == row2 && row2 == row3) {
			// Only applies to win emotes
			if ([':skull:', ':pill:', ':bomb:', ':space_invader:', ':package:', ':troll:'].indexOf(row1) === -1) {
				earn *= 3;
				row3 += ' Jackpot ! PPs multiplied by 3 !';
			}
		}
		// Two same values
		else if (row1 == row2 || row1 == row3 || row2 == row3) {
			// No need to verify the third value since either the first or second contains at least one item of the pair
			if ([':skull:', ':pill:', ':bomb:', ':space_invader:', ':package:', ':troll:'].indexOf(row1) === -1 &&
				  [':skull:', ':pill:', ':bomb:', ':space_invader:', ':package:', ':troll:'].indexOf(row2) === -1) {
				earn *= 2;
				row3 += ' Pair ! PPs multiplied by 2 !';
			}
		}

		if (earn <= 0) API.sendChat('/me '+row1+'|'+row2+'|'+row3+' @'+msg.un+', you lost, retry tomorrow !');
		else {
			if (earn >= 1000) earn = (earn /= 1000) + 'k';

			API.sendChat('/me '+row1+'|'+row2+'|'+row3+' @'+msg.un+', you won '+earn+'PP ! :tada:');

			if (wins.length > 0) {
				for (var i = 0; i < wins.length; i++) {
					if (i+1 >= wins.length && msg.uid !== wins[i][1]) {
						wins.push([msg.un, msg.uid, earn]);
						return localStorage.setItem('loto-Wins', JSON.stringify(wins));
					}
					else if (msg.uid === wins[i][1]) {
						wins[i][2] = earn;
						return localStorage.setItem('loto-Wins', JSON.stringify(wins));
					}
				}
			}	else {
				wins.push([msg.un, msg.uid, earn]);
				return localStorage.setItem('loto-Wins', JSON.stringify(wins));
			}
		}
	}
	function generateEmote() {
		var rdm = Math.random()*100; // 0 - 99.999999999999999

		if (rdm >= emote[11][2]) {
			return emote[11];
		} else if (rdm >= emote[10][2]) {
			return emote[10];
		} else if (rdm >= emote[9][2]) {
			return emote[9];
		} else if (rdm >= emote[8][2]) {
			return emote[8];
		} else if (rdm >= emote[7][2]) {
			return emote[7];
		} else if (rdm >= emote[6][2]) {
			return emote[6];
		} else {
			return emote[Math.floor(Math.random()*6)];
		}
	}
	function whatPercent(a,b) {
		if (a>b) return a/b*100;
		else return 100 / (b/a);
	}

	if (lotoCDLS !== null) cooldown.loto = JSON.parse(lotoCDLS);
	if (lotoWinsLS !== null) wins = JSON.parse(lotoWinsLS);

	function extend() {
		if (!window.bot) return setTimeout(extend, 1000);

		var bot = window.bot;
		bot.retrieveSettings();

		// Same as gif, but nsfw
		bot.commands.gif18Command = {
			command: ['gif18', 'giphy18'],
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				if ((new Date().getTime() - cooldown.gif)/1000/60 < 1) return void (0); // if less than a minute
				else {
					var msg = chat.message;
					if (msg.length !== cmd.length) {
						function get_id(api_key, fixedtag, func) {
							$.getJSON("https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating,
									"tag": fixedtag
								},
								function(response) {
									func(response.data.id);
								}
							);
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "nsfw";
						var tag = msg.substr(cmd.length + 1);
						var fixedtag = tag.replace(/ /g,"+");
						var commatag = tag.replace(/ /g,", ");
						get_id(api_key, tag, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Tags: '+commatag+']');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid tags, try something different. [Tags: '+commatag+']');
							}
						});
					}
					else {
						function get_random_id(api_key, func) {
							$.getJSON("https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating
								},
								function(response) {
									func(response.data.id);
								}
							);
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "nsfw";
						get_random_id(api_key, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Random GIF]');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid request, try again.');
							}
						});
					}
				}
			}
		}
		bot.commands.gifCommand = {
			command: ['gif', 'giphy'],
			rank: 'user',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				if ((new Date().getTime() - cooldown.gif)/1000/60 < 1) return void (0); // if less than a minute
				else {
					var msg = chat.message;
					if (msg.length !== cmd.length) {
						function get_id(api_key, fixedtag, func) {
							$.getJSON("https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating,
									"tag": fixedtag
								},
								function(response) {
									func(response.data.id);
								}
							);
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "pg-13"; // PG 13 gifs
						var tag = msg.substr(cmd.length + 1);
						var fixedtag = tag.replace(/ /g,"+");
						var commatag = tag.replace(/ /g,", ");
						get_id(api_key, tag, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Tags: '+commatag+']');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid tags, try something different. [Tags: '+commatag+']');
							}
						});
					}
					else {
						function get_random_id(api_key, func) {
							$.getJSON("https://tv.giphy.com/v1/gifs/random?",
								{
									"format": "json",
									"api_key": api_key,
									"rating": rating
								},
								function(response) {
									func(response.data.id);
								}
							);
						}
						var api_key = "dc6zaTOxFJmzC"; // public beta key
						var rating = "pg-13"; // PG 13 gifs
						get_random_id(api_key, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] http:\/\/i.giphy.com\/'+id+'.gif [Random GIF]');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid request, try again.');
							}
						});
					}
				}
			}
		};
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
					  // setInterval is used because SC doesn't return immediately the track
						var uInt = setInterval(function() {
							if (typeof sound._result === "undefined") return;
							API.sendChat('/me [@'+chat.un+'] Link to current song: '+sound._result.permalink_url);
							clearInterval(uInt);
						}, 10);
					}
				}
			}
		};
		bot.commands.clearlocalstorageCommand = {
			command: 'clearLS',
			rank: 'manager',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var plugSettings = localStorage.getItem('settings');
					var lotoWinsLS = localStorage.getItem('loto-Wins');
					var lotoCDLS = localStorage.getItem('loto-CD');

					localStorage.clear();

					if (plugSettings !== null) localStorage.setItem('settings', plugSettings);
					if (lotoWinsLS !== null) localStorage.setItem('loto-Wins', lotoWinsLS);
					if (lotoCDLS !== null) localStorage.setItem('loto-CD', lotoCDLS);

					API.sendChat('/me [@'+chat.un+'] localStorage cleared ! Be right back..');
					location.reload();
				}
			}
		};
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
							if (audience[i].rawun == name) return API.sendChat('/me Le bloc opératoire N°404 est disponible pour une ablation de côtes ' + name + '.');
						}
						API.sendChat('/me [@'+chat.un+'] There is no user by this name.');
					}
				}
			}
		};
		bot.commands.loto = {
			command: 'loto',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					if (cooldown.loto.length) {
						for (var i = 0; i < cooldown.loto.length; i++) {
							if (i+1 >= cooldown.loto.length && chat.uid !== cooldown.loto[i][1]) {
								cooldown.loto.push([chat.un, chat.uid, new Date().getTime()]);
								localStorage.setItem('loto-CD', JSON.stringify(cooldown.loto));
								return loto(chat);
							}
							else if (chat.uid == cooldown.loto[i][1]) {
								var day = new Date(cooldown.loto[i][2]).getDate();
								var now = new Date();
								if (day !== now.getDate()) {
									cooldown.loto[i][2] = now.getTime();
									localStorage.setItem('loto-CD', JSON.stringify(cooldown.loto));
									return loto(chat);
								} else {
									return API.sendChat('/me @'+chat.un+' you already played today !');
								}
							}
						}
					} else {
						cooldown.loto.push([chat.un, chat.uid, new Date().getTime()]);
						localStorage.setItem('loto-CD', JSON.stringify(cooldown.loto));
						loto(chat);
					}
				}
			}
		};
		bot.commands.wins = {
			command: 'wins',
			rank: 'host',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					if (wins.length == 0) API.sendChat('/me No winners yet !');
					else {
						for (var i = 0; i < wins.length; i++) {
							setTimeout(function(wins, i) {
								API.sendChat('/me '+wins[i][0]+' won '+wins[i][2]+'PP on the last try.');
							}, i*1000, wins, i);
						}
					}
				}
			}
		};
		API.on(API.SCORE_UPDATE, function() {
			var voteskip = bot.settings.voteSkip;
			var voteSkipLimit = bot.settings.voteSkipLimit;

			if (voteskip && API.getScore().negative >= voteSkipLimit) {
				API.sendChat("/me Too many mehs, skipping..");
				API.moderateForceSkip()
			}
		});
		API.on(API.ADVANCE, function(e) {
			if (e.media.title.toLowerCase().indexOf('nightcore') != -1 || e.media.author.toLowerCase().indexOf('nightcore') != -1) {
				API.sendChat('/me [@'+e.dj.rawun+'] nightcore is not allowed. Skipping..');
				API.moderateForceSkip();
			}
		});
		API.on(API.CHAT_COMMAND, function(cmd) {
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
		API.on(API.CHAT, function(msg) {
			if (msg.uid === API.getUser().id) return;
			if (msg.message.length <= 10) return;

			// If message.length > 10 && msg.UpperCase percentage > 50
			if (whatPercent(msg.message.replace(/[^A-Z]/g, '').length, msg.message.length) > 50) {
				API.moderateDeleteChat(msg.cid);
				API.sendChat('/me @'+msg.un+' Unglue your caps lock please.');
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
		startupEmoji: false,
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
		commandCooldown: 5,
		usercommandsEnabled: true,
		skipPosition: 3,
		skipReasons: [
			["theme", "This song does not fit the room theme. "],
			["op", "This song is on the OP list. "],
			["history", "This song is in the history. "],
			["sound", "The song you played had bad sound quality or no sound. "],
			["unavailable", "The song you played was not available for some users. "],
			["indispo", "The song you played was not available for some users. "],
			["troll", "We do not allow this type of music/video. "]
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
			"Join us on discord ! https://discord.gg/eJGAVBT",
			"Give the !loto a try, you can win up to 225KPP !!",
			"Remember to read the rules at least once http://wibla.free.fr/plug/rules"
		],
		messageInterval: 10,
		songstats: false,
		commandLiteral: "!",
		blacklists: {
			NSFW: null,
			OP: "https://rawgit.com/WiBla/custom/master/blacklists/OPlist.json",
			BANNED: "https://rawgit.com/WiBla/custom/master/blacklists/BANNEDlist.json"
		}
	}));

	$.getScript("https://rawgit.com/bscBot/source/master/basicBot.js", extend);
}).call(this);
