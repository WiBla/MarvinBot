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
		['💀',        0, 95],    // skull
		['💊',        0, 95],    // pill
		['💣',        0, 95],    // bomb
		['👾',        0, 95],    // space_invader
		['📦',        0, 95],    // package
		[':troll:',  0, 95],    // 95% chance to lose
		['🍒',      500, 95],    // 5%
		['🍇',     1000, 98],    // 2%
		['⚡',     2000, 99.7],  // 0.3%
		['🎲',     5000, 99.9],  // 0.1%
		['👑',    10000, 99.95], // 0.05%
		['🎁',    25000, 99.999] // 0.001%
	];
	var tuneStrings = [
		"%%DJ%%, %%USER%% would like you to know that this is a great tune !",
		"%%DJ%%, %%USER%% thinks this is an awesome track !",
		"%%DJ%%, keep playing such great tracks because %%USER%% seems to like them !",
		"%%USER%% absolutely love this music %%DJ%% !",
		'%%DJ%%, %%USER%% is really enjoying this track !',
		'%%DJ%%, %%USER%% is dancing his feet of this track !',
		'"%%DJ%% DUDE, this is awesome !" -from %%USER%%'
	];
	var propsStrings = [
		"%%DJ%% Aye mate, %%USER%% says props to you for your play!",
		"[%%USER%%] %%DJ%% Damn, you're on :fire:!",
		"%%DJ%%, %%USER%% thinks you're a great DJ!",
		"%%DJ%%, if %%USER%% could buy you flowers 💐, they would! (That means you're a good DJ!)",
		"Hey %%DJ%%, I think %%USER%% really likes you 😘"
	];
	var modules = {
		roomInfo: _.find(require.s.contexts._.defined,m=>m&&m.attributes&&m.attributes.shouldCycle)
	};
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
			if (['💀', '💊', '💣', '👾', '📦', ':troll:'].indexOf(row1) === -1) {
				earn *= 3;
				row3 += ' Jackpot ! PPs multiplied by 3 !';
			}
		}
		// Two same values
		else if (row1 == row2 || row1 == row3 || row2 == row3) {
			// No need to verify the third value since either the first or second contains at least one item of the pair
			if (['💀', '💊', '💣', '👾', '📦', ':troll:'].indexOf(row1) === -1 &&
				  ['💀', '💊', '💣', '👾', '📦', ':troll:'].indexOf(row2) === -1) {
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
	function toggleCycle() {
		let shouldCycle = modules.roomInfo.attributes.shouldCycle;

		if (shouldCycle && API.getUsers().length > 11) {
			API.moderateDJCycle(false);
		} else if (!shouldCycle && API.getUsers().length < 9) {
			API.moderateDJCycle(true);
		}
	}
	function waitlistBan(options, callback) {
		if (typeof options.reason === 'undefined') options.reason = 1;

		$.ajax({
			url: '/_/booth/waitlistban',
			type: 'POST',
			data: JSON.stringify({'userID':options.ID,'reason':options.reason,'duration':options.duration}),
			contentType: 'application/json',
			error: function(err) {
				if (typeof callback !== 'function') return;
				switch(err.responseJSON.data[0]) {
					case 'You are not authorized to access this resource.':
						callback("/me [@%%USER%%] I am somehow not authorized to do this :thinking:");
					break;

					case 'Not a valid ban duration':
						callback("/me [@%%USER%%] Please make sure that the duration of the ban is correct.");
					break;

					case 'Not a valid ban reason':
						callback("/me [@%%USER%%] Please make sure that the reason of the ban is correct.");
					break;

					case 'Not in a room':
						console.error('Trying to waitlist ban while not being in a room?!');
					break;

					case 'Nice try buddy, bouncers can\'t perm ban':
						callback("/me [@%%USER%%] As a bouncer, I cannot permanently ban a user.");
					break;

					case 'That user is too powerful to ban':
						callback("/me [@%%USER%%] Trying to ban an Admin/BA ? Well no luck here..");
					break;

					case 'Cannot ban a >= ranking user':
						callback("/me [@%%USER%%] You can't ban users with an equal or higher rank than you!");
					break;

					case 'Not a moderator':
						callback("/me [@%%USER%%] I need to be bouncer minimum to perform this action.");
					break;

					case 'Trying to ban yourself?':
						callback("/me [@%%USER%%] Hey! Don't try to ban me!");
					break;

					default:
						callback("/me [@%%USER%%] An error occured, please try again.");
					break;
				}
			}
		});
	}
	// Pendu
	String.prototype.replaceAt=function(index, replacement) {
		return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
	};
	const words = ['chorus', 'clef', 'maestro', 'piano', 'music', 'symphony', 'rythm', 'requiem', 'serenade', 'sonata', 'soprano', 'vibrato', 'virtuoso', 'table', 'television', 'drawer', 'computer', 'laptop', 'house', 'church', 'fruits', 'vegetable', 'speakers', 'games', 'keyboard', 'coins', 'money', 'happy', 'share', 'disco', 'country', 'paper', 'magnetophone', 'xylophone', 'guitare'];
	const abc = 'abcdefghijklmnopqrstuvwxyz';
	var penduActive = false;
	var secret = '';
	var underline = '';
	var guess = 10;
	var guessed = [];
	var hangMessaged = [];
	function startPendu() {
		if (!penduActive) {
			penduActive = true;
			secret = words[Math.floor(Math.random()*words.length)];

			for (var i=0; i<secret.length; i++) {
				underline+='-';
			}

			API.sendChat(`A new hangman has started! ${underline} ${guess} guesses left!`);
		} else {
			API.sendChat('A hangman is already active!');
		}
	}
	function resetPendu() {
		penduActive = false;
		underline = '';
		secret = '';
		guess = 10;
		guessed = [];
		hangMessaged.forEach((e,i,a) => {API.moderateDeleteChat(e);});
		hangMessaged = [];
	}

	Number.prototype.spaceOut = function() {
		if (isNaN(this) || this < 999) return this;
		return (this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};
	API.moderateForceQuit = function() {
		if (API.hasPermission(null, API.ROLE.BOUNCER)) {
			$.ajax({
				url: '/_/booth/remove/'+API.getDJ().id,
				method: 'DELETE'
			});
		}
	};

	if (lotoCDLS !== null) cooldown.loto = JSON.parse(lotoCDLS);
	if (lotoWinsLS !== null) wins = JSON.parse(lotoWinsLS);

	function extend() {
		if (!window.bot) return setTimeout(extend, 1000);

		var bot = window.bot;
		bot.retrieveSettings();

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
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] http:\/\/i.giphy.com\/'+id+'.gif');
							} else {
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] Invalid tags, try something different.');
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
								API.sendChat('/me ['+chat.un+'] [Random GIF] http:\/\/i.giphy.com\/'+id+'.gif');
							} else {
								API.sendChat('/me ['+chat.un+'] Invalid request, try again.');
							}
						});
					}
				}
			}
		};
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
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] http:\/\/i.giphy.com\/'+id+'.gif');
							} else {
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] Invalid tags, try something different.');
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
								API.sendChat('/me ['+chat.un+'] [Random GIF] http:\/\/i.giphy.com\/'+id+'.gif');
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
					if (typeof user === null) return API.sendChat('/me [@'+chat.un+'] No user specified.');

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
		bot.commands.waitlistBanCommand = {
			command: ['wlban', 'wlBan', 'waitlistban', 'waitlistBan'],
			rank: 'bouncer',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				if (chat.message === cmd) return API.sendChat(`/me [@${chat.un}] Please provide a user and duration.`);
				else {
					let cmdRegEx = /(?: @?)(.*\b)(?:( [smlf]$)|(15mins?|15m|(?:one|une|1)? ?(?:hour|heure)|1?h)|((?:one|un|1)? ?(?:day|jour))|(forever|toujours?))/gi;
					let match = cmdRegEx.exec(chat.message);

					if (match === null) return API.sendChat(`/me [@${chat.un} something went wrong, are you sure you specified a correct user and duration?`);

					let ID = match[1];
					let duration = '';

					if (isNaN(ID)) {
						let users = API.getUsers();
						for (var i = 0; i < users.length; i++) {
							if (users[i].username === ID) ID = users[i].id;
						}
						if (isNaN(ID)) return API.sendChat(`/me [@${chat.un}] Wrong user specified. Is that user ghosting?`);
					}

					// If we're not using s,m,l, or f
					if (match[3] === '') {
						// The regExp is build in a way that each duration has its own match so we just see the one that isn't empty and correlate the wanted duration
						if (match[4] !== '') duration = 's';
						else if (match[5] !== '') duration = 'm';
						else if (match[6] !== '') duration = 'l';
						else if (match[7] !== '') duration = 'l';
					}

					if ('smlf'.indexOf(duration) === -1) duration = 's';

					if (duration === 'f' && (API.getUser(chat.uid).role < API.ROLE.MANAGER && API.getUser(chat.uid).gRole === API.ROLE.NONE))
						API.sendChat(`/me [@${chat.un}] You do not have sufficent permissions to ban a user indefinitely.`);

					waitlistBan(
						{ID: ID, duration: duration},
						(error) => API.sendChat(error.split('%%USER%%').join(chat.un))
					);
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
		bot.commands.englishCommand = {
			command: ['english', 'en'],
			rank: 'residentdj',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
					var name = chat.message.substring(cmd.length + 2);
					var user = bot.userUtilities.lookupUserName(name);
					if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
					var lang = bot.userUtilities.getUser(user).language;
					var ch = '/me @' + name + ' ';

					if (lang === 'en') {
						ch += 'Please, speak either French or English.';
						API.sendChat(ch);
					} else {
						$.ajax({
							type: 'GET',
							url: 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t'+
							'&sl=en'+
							'&tl='+lang+
							"&q="+ encodeURI('Please, speak either French or English.'),
							success: function(data) {
								ch += data[0][0][0];
								API.sendChat(ch);
							},
							error: function(err) {
								ch += err.responseText.split('"')[1];
								API.sendChat(ch);
							}
						});
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
		bot.commands.helpCommand = {
			command: 'help',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('This image will get you started on plug: https://i.imgur.com/ZeRR07N.png');
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
		bot.commands.staff = {
			command: 'staff',
			rank: 'user',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					if (API.getUsers().filter(u => (u.role >= API.ROLE.MANAGER && u.id !== 5285179)).length > 0) {
						API.sendChat(`/me [@${chat.un}] @staff ${chat.message.substr(cmd.length + 1)}`);
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
		bot.commands.woot = {
			command: 'woot',
			rank: 'bouncer',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					$("#woot").click();
				}
			}
		};
		bot.commands.meh = {
			command: 'meh',
			rank: 'bouncer',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bot.commands.executable(this.rank, chat)) return void(0);
				else {
					$("#meh").click();
					API.sendChat('http://i.imgur.com/NGpjdvp.gif');
				}
			}
		};
		bot.commands.tune = {
			command: 'tune',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var users = {
						dj: '@'+API.getDJ().username,
						user: '@'+chat.un
					};
					var string = tuneStrings[Math.floor(Math.random()*tuneStrings.length)];

					// Self tuning your own track are you ?
					if (users.dj === users.user) return API.sendChat('/me Le bloc opératoire N°404 est disponible pour une ablation de côtes ' + users.dj + '.');

					for (var key in users) {
						string = string.split('%%'+key.toUpperCase()+'%%').join(users[key]);
					}
					API.sendChat('/me ' + string);
				}
			}
		};
		bot.commands.props = {
			command: 'props',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var users = {
						dj: '@'+API.getDJ().username,
						user: '@'+chat.un
					};
					var string = propsStrings[Math.floor(Math.random()*propsStrings.length)];

					// Self proping are you ?
					if (users.dj === users.user) return API.sendChat(`/me You shall not give yourself props ${users.dj}.`);

					for (var key in users) {
						string = string.split('%%'+key.toUpperCase()+'%%').join(users[key]);
					}
					API.sendChat(`/me ${string}`);
				}
			}
		};
		bot.commands.info = {
			command: 'info',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat(`I have ${API.getUser().pp.spaceOut()}PP, ${API.getUser().xp.spaceOut()}XP, I am level ${API.getUser().level} [${$('.info .bar .value')[0].innerText} XP]`);
				}
			}
		};
		bot.commands.helpRanks = {
			command: ['helpranks', 'rank'],
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('https://i.imgur.com/eZV5Hc5.png');
				}
			}
		};
		bot.commands.diy = {
			command: 'diy',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('For useful informations about how to get started on plug.dj, check this guide: https://goo.gl/qcYqFz');
				}
			}
		};
		bot.commands.helpXP = {
			command: ['helpxp', 'xp'],
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('https://yennyan.me/tsy/xppp.png');
				}
			}
		};
		bot.commands.discord = {
			command: 'discord',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('Connect with us on our Discord: ' + bot.settings.discordLink);
				}
			}
		};
		bot.commands.pendu = {
			command: 'pendu',
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					startPendu();
				}
			}
		};
		bot.commands.stopPendu = {
			command: 'stoppendu',
			rank: 'bouncer',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					resetPendu();
					API.sendChat('Hangman has been reset!');
				}
			}
		};
		bot.commands.eval = {
			command: ['eval', 'code', 'exec'],
			rank: 'cohost',
			type: 'startsWith',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					if ([4613422, 4272266].indexOf(chat.uid) === -1) return API.sendChat('This command can only be executed by trusted users.');
					try {
						var code = chat.message.substr(cmd.length + 1);
						eval(code);
					} catch (err) {
						API.sendChat(err.toString());
					}
				}
			}
		};
		API.on(API.ADVANCE, function(e) {
			// if no media, no need to check
			if (typeof e.media === 'undefined') return;

			// I know I know.. It's ugly but ain't nobody got time for dat
			if (e.media.title.toLowerCase().indexOf('nightcore') != -1 || e.media.author.toLowerCase().indexOf('nightcore') != -1) {
				API.sendChat('/me [@'+e.dj.username+'] nightcore is not allowed. Skipping..');
				bot.roomUtilities.smartSkip();
			} else if (e.media.title.toLowerCase().indexOf('ear rape') != -1 || e.media.author.toLowerCase().indexOf('ear rape') != -1) {
				API.sendChat('/me [@'+e.dj.username+'] Ear rape I see? Pathetic..');
				waitlistBan(e.dj.id, 'f', 1);
			} else if (e.media.title.toLowerCase().indexOf('gemidão do zap') != -1 || e.media.author.toLowerCase().indexOf('gemidão do zap') != -1) {
				API.sendChat('/me [@'+e.dj.username+'] Ear rape I see? Pathetic..');
				waitlistBan(e.dj.id, 'f', 1);
			} else if (e.media.format === 2) {
				SC.get('/tracks/' + e.media.cid).catch((error) => {
					if (error.status === 404) {
						API.sendChat('/me [@'+e.dj.username+'] this track is unavailable, please update your playlists and chose another song before you play again.');
						bot.roomUtilities.smartSkip();
					}
				});
			} else {
				let limit = bot.settings.maximumSongLength*60;
				if (bot.settings.smartSkip && e.media.duration > limit) {
					API.sendChat(`Song is longer than ${Math.floor(limit/60)}min ${limit%60}s, skipping after the limit.`);
					setTimeout(function(data) {
						// Is it still the same music or has it been skipped already ?
						if (data.media.cid === API.getMedia().cid) {
							API.sendChat('Skipping after the time limit..');
							API.moderateForceSkip();
						}
					}, limit*1000, e);
				}
			}

			var media = e.media;
			var history = API.getHistory();
			var dj = e.dj;
			var warns = 0;

			// i = 1 to jump the first item being the current song
			for (var i = 1; i < history.length; i++) {
				if (media.format == history[i].media.format && media.cid == history[i].media.cid)
					warns++;
			}

			switch(warns) {
				case 0: break;

				case 1:
					API.sendChat(`/me First Warning @${dj.username}, you have two songs in history, if this continue, you will be removed from the waitlist.`);
				break;

				case 2:
					API.sendChat(`/me Second Warning @${dj.username}, please check your playlists or you will be removed.`);
				break;

				case 3:
					bot.settings.smartSkip = false;
					API.moderateForceQuit();
					API.sendChat(`/me @${dj.username} you have been removed from the waitlist for having too many songs in history. If this happens once more, you will be waitlist banned for 15 minutes.`);
					setTimeout(() => bot.settings.smartSkip = true, 10*1000);
				break;

				default:
					bot.settings.smartSkip = false;
					waitlistBan({
						ID: dj.id,
						duration: 's',
						reason: 4
					});
					setTimeout(() => bot.settings.smartSkip = true, 10*1000);
				break;
			}
		});
		API.on(API.CHAT, function(msg) {
			// Auto-delete socket app promotion
			if (
				msg.message.indexOf('http://socket.dj') !== -1 &&
				API.hasPermission(null, API.ROLE.BOUNCER)
			) {
				API.moderateDeleteChat(msg.cid);
			} else if (
				/((http(?:s)?:\/\/(?:[a-z]+\.)*)?plug\.dj\/)(?!enjoy-the-drop$|about$|ba$|forgot-password$|founders$|giftsub\/\d|jobs$|legal$|merch$|partners$|plot$|privacy$|purchase$|subscribe$|team$|terms$|press$|_\/|@\/|!\/)(.+)/i
				.test(msg.message) &&
				!API.hasPermission(msg.uid, API.ROLE.BOUNCER)
			) {
				API.moderateDeleteChat(msg.cid);
				API.sendChat(`/me [@${msg.un}] You are not allowed to post other room links.`);
			}
			if (msg.type === 'log' || msg.type === 'emote') return;
			if (msg.uid === API.getUser().id) hangMessaged.push(msg.cid);

			msg.message = msg.message.toLowerCase();
			if (msg.message.length === 1 && penduActive && abc.indexOf(msg.message) !== -1) {
				if (secret.indexOf(msg.message) !== -1 && guessed.indexOf(msg.message) === -1) {
					guessed.push(msg.message);
					for (var i = 0; i < secret.length; i++) {
						if (secret.charAt(i) === msg.message) {
							underline = underline.replaceAt(i, msg.message);
						}
					}

					if (underline.indexOf('-') !== -1)
						API.sendChat(`${underline} ${guess} guesses left!  ${guessed.join(',')}`);
					else {
						API.sendChat(`/me @${msg.un} You found the secret word "${secret}"! :clap:`);
						resetPendu();
					}
				} else if (guessed.indexOf(msg.message) !== -1) {
					API.sendChat(`This letter has already been guessed! ${underline} ${guess} guesses left!  ${guessed.join(',')}`);
				} else {
					guess--;
					guessed.push(msg.message);

					if (guess !== 0)
						API.sendChat(`${underline} ${guess} guesses left! ${guessed.join(',')}`);
					else {
						API.sendChat(`0 guesses left! Nobody found the secret word "${secret}" :disappointed:`);
						resetPendu();
					}
				}

				API.moderateDeleteChat(msg.cid);
			} else if (msg.message.length === secret.length && penduActive && msg.message.indexOf(bot.settings.commandLiteral) !== 0) {
				if (msg.message.toLowerCase() !== secret)
					API.sendChat(`${msg.message} is not the searched word! Try again!`);
				else {
					API.sendChat(`/me @${msg.un} You found the secret word "${secret}"! :clap:`);
					resetPendu();
				}
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
		API.on(API.SCORE_UPDATE, function(score) {
			if (score.negative < bot.settings.voteSkipLimit) return;

			if (bot.settings.voteSkip) {
				API.sendChat("/me Too many mehs, skipping..");
				API.moderateForceSkip();
			}
		});
		API.on(API.USER_JOIN, () => toggleCycle());
		API.on(API.USER_LEAVE, () => toggleCycle());

		bot.loadChat();
	}

	var settings = {
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
		afkRemoval: false,
		maximumAfk: 60,
		afkpositionCheck: 50,
		afkRankCheck: "admin",
		maximumDc: 120,
		bouncerPlus: true,
		blacklistEnabled: true,
		lockdownEnabled: false,
		lockGuard: false,
		maximumLocktime: 10,
		cycleGuard: false,
		maximumCycletime: 30,
		voteSkip: true,
		voteSkipLimit: 5,
		historySkip: true,
		timeGuard: false,
		maximumSongLength: 7.5,
		autodisable: false,
		commandCooldown: 5,
		usercommandsEnabled: true,
		thorCommand: true,
    thorCooldown: 15,
		skipPosition: 3,
		skipReasons: [
			["history",     "This song is in the history."],
			["sound",       "The song you played had bad sound quality or no sound."],
			["unavailable", "The song you played was not available for some users."],
			["indispo",     "The song you played was not available for some users. "],
			["troll",       "We do not allow this type of music/video."],
			["nsfw",        "The song you played contained not safe for work content."]
		],
		motdEnabled: false,
		motdInterval: 5,
		motd: "",
		filterChat: false,
		etaRestriction: false,
		welcome: true,
		opLink: "http://wibla.free.fr/plug/room#op",
		rulesLink: "http://wibla.free.fr/plug/rules",
		themeLink: "https://i.imgur.com/2riDvuR.png",
		fbLink: null,
		youtubeLink: null,
		discordLink: "https://discord.gg/9GPAeYF",
		website: "http://wibla.free.fr/plug",
		intervalMessages: [
			"Give the !loto a try, you can win up to 225K PP !! :gift:",
			"If you have any feedback, feel free to hit us on Discord or in the chat !",
			"Our favorite autowoot https://github.com/Plug-It",
			"https://i.imgur.com/ji5Uzkg.gif Remember to put the room in your favorite if we deserve it ! ♥",
			":warning: If your songs has more than 5 mehs, it will be skipped !",
			"The DJ rotation is automaticly enabled if there are less than 10 users :)",
			"Invite your friends ! The more people, the more fun !",
			"You can play music up to 7min 30sec. After that, it will be skipped !",
			"Try the !pendu if you're in a gaming mood !",
			"Try to shuffle your playlists as much as possible, here's a great script for it: https://plugmixer.sunwj.com/"
		],
		messageInterval: 10,
		songstats: false,
		commandLiteral: "!",
		blacklists: {
			NSFW: null,
			OP: "https://rawgit.com/WiBla/custom/master/blacklists/OPlist.json",
			BANNED: "https://rawgit.com/WiBla/custom/master/blacklists/BANNEDlist.json"
		}
	};
	settings.skipReasons.push(["theme", "This song does not fit the room theme: "+settings.themeLink]);
	settings.intervalMessages.push("Join us on discord ! "+settings.discordLink);
	localStorage.setItem("basicBotsettings", JSON.stringify(settings));

	$.getScript("https://rawgit.com/bscBot/source/master/basicBot.js", extend);
}).call(this);
