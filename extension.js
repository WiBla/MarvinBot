(function(){
	const fork = "WiBla";
	window.cooldown = {
		// Allow use of !gif right after bot startup
		"gif": new Date().getTime()-60000,
		"loto": []
	};
	window.wins = [];
	const emote = [
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
	 	[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':skull:',        -50, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':pill:',         -25, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':bomb:',         -15, 10],
		[':space_invader:',-10,  5],
		[':space_invader:',-10,  5],
		[':space_invader:',-10,  5],
		[':space_invader:',-10,  5],
		[':space_invader:',-10,  5],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':troll:',        0,   10],
		[':apple:',        5,   5],
		[':apple:',        5,   5],
		[':apple:',        5,   5],
		[':apple:',        5,   5],
		[':apple:',        5,   5],
		[':lemon:',        5,   5],
		[':lemon:',        5,   5],
		[':lemon:',        5,   5],
		[':lemon:',        5,   5],
		[':lemon:',        5,   5],
		[':cherries:',     10,  3],
		[':cherries:',     10,  3],
		[':cherries:',     10,  3],
		[':grapes:',       20,  3],
		[':grapes:',       20,  3],
		[':grapes:',       20,  3],
		[':watermelon:',   20,  3],
		[':watermelon:',   20,  3],
		[':watermelon:',   20,  3],
		[':pineapple:',    25,  3],
		[':pineapple:',    25,  3],
		[':pineapple:',    25,  3],
		[':zap:',          50,  3],
		[':zap:',          50,  3],
		[':zap:',          50,  3],
		[':cookie:',       75,  2],
		[':cookie:',       75,  2],
		[':strawberry:',   100,  2],
		[':strawberry:',   100,  2],
		[':panda_face:',   200,  2],
		[':panda_face:',   200,  2],
		[':coffee:',       500,  1],
		[':ice_cream:',    1000, 1],
		[':gift:',         2500, 1]
	];

	let lotoCDLS = localStorage.getItem('loto-CD');
	let lotoWinsLS = localStorage.getItem('loto-Wins');

	if (lotoCDLS !== null) cooldown.loto = JSON.parse(lotoCDLS);
	if (lotoWinsLS !== null) wins = JSON.parse(lotoWinsLS);

	function extend() {
		if (!window.bot) return setTimeout(extend, 1000);

		var bot = window.bot;
		bot.retrieveSettings();

		bot.commands.gifCommand = {
			command: ['gif', 'giphy'],
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				if ((new Date().getTime() - cooldown.gif)/1000/60 < 1) return void (0); // if less than a minute
				else {
					cooldown.gif = new Date().getTime();
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
					  // setTimeout is used because SC doesn't return immediately the track
					  setTimeout(function(){API.sendChat('/me [@'+chat.un+'] Link to current song: '+sound['_result'].permalink_url);}, 1000);
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
					let plugSettings = localStorage.getItem('settings');
					let lotoWinsLS = localStorage.getItem('loto-Wins');
					let lotoCDLS = localStorage.getItem('loto-CD');

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
				function loto(msg) {
					var row1 = Math.floor(Math.random()*emote.length);
					var row2 = Math.floor(Math.random()*emote.length);
					var row3 = Math.floor(Math.random()*emote.length);
					var earn = 0;
					earn += emote[row1][1];
					earn += emote[row2][1];
					earn += emote[row3][1];
					row1 = emote[row1][0];
					row2 = emote[row2][0];
					row3 = emote[row3][0];
					
					// Jackpot
					if (row1 == row2 && row2 == row3) {
						// In case of jackpot from maluses emotes, do not display jackpot
						if ([':skull:', ':bomb:', ':pill:', ':space_invader', 'troll'].indexOf(row1) === -1) {
							earn *= 3;
							row3 += ' Jackpot ! PPs multiplied by 3 !';
						}
					}
					// Two same values
					else if (row1 == row2 || row1 == row3 || row2 == row3) {
						// No need to verify the third value since either the first or second contains at least one item of the pair
						if ([':skull:', ':bomb:', ':pill:', ':space_invader', 'troll'].indexOf(row1) === -1 ||
							  [':skull:', ':bomb:', ':pill:', ':space_invader', 'troll'].indexOf(row2) === -1) {
							earn *= 2;
							row3 += ' Pair ! PPs multiplied by 2 !';
						}
					}

					if (earn <= 0) API.sendChat('/me '+row1+'|'+row2+'|'+row3+' @'+msg.un+', you lost, retry tomorrow !');
					else {
						API.sendChat('/me '+row1+'|'+row2+'|'+row3+' @'+msg.un+', you won '+earn+'PP ! :tada:');
						if (wins.length > 0) {
							for (var i = 0; i < wins.length; i++) {
								if (i+1 >= wins.length && msg.uid != wins[i][1]) {
									wins.push([msg.un, msg.uid, earn]);
									return localStorage.setItem('loto-Wins', JSON.stringify(wins));
								}
								else if (msg.uid == wins[i][1]); {
									wins[i][2] += earn;
									return localStorage.setItem('loto-Wins', JSON.stringify(wins));
								}
							}
						}	else {
							wins.push([msg.un, msg.uid, earn]);
							return localStorage.setItem('loto-Wins', JSON.stringify(wins));
						}
					}
				};
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
								if (day !== new Date().getDate()) {
									cooldown.loto[i][2] == new Date().getTime();
									localStorage.setItem('loto-CD', JSON.stringify(cooldown.loto));
									return loto(chat);
								} else {
									var now = new Date();
									var h = 24 - now.getHours();
									var m = 60 - now.getMinutes();
									var s = 60 - now.getSeconds();
									// Get appropriate time
									m = s > 0 ? m-- : m;
									h = m > 0 ? h-- : h;
									// Add extra '0' if number is under 10
									h = h < 1 ? '' : h+'h';
									m = m < 10 ? '0'+m : m;
									s = s < 10 ? '0'+s : s;

									return API.sendChat('/me @'+chat.un+' you already played today, retry in '+h+m+'m'+s+'s !');
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
								API.sendChat('/me '+wins[i][0]+' won '+wins[i][2]+'PP in total.');
							}, i*1000, wins, i);
						}
					}
				}
			}
		};
		API.on(API.SCORE_UPDATE, function(){
			var voteskip = bot.settings.voteSkip;
			var voteSkipLimit = bot.settings.voteSkipLimit;

			if (voteskip && API.getScore().negative >= voteSkipLimit) {
				API.sendChat("/me Too many mehs, skipping..");
				API.moderateForceSkip()
			}
		});
		API.on(API.ADVANCE, function(e){
			if (e.media.title.toLowerCase().indexOf('nightcore') != -1 || e.media.author.toLowerCase().indexOf('nightcore') != -1) {
				API.sendChat('/me [@'+e.dj.rawun+'] nightcore is not allowed. Skipping..');
				API.moderateForceSkip();
			}
		});
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
			"Try the new !loto and get a chance to win PPs ! One chance per day !",
			"Read the rules here http://wibla.free.fr/plug/rules"
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
