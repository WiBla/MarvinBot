(function(){
	const YTAPIkey = 'AIzaSyC8pk0f57a_UcAIbHdrvRhsmHSG1KZk2SM';
	const giphyKey = 'dc6zaTOxFJmzC';
	const roomRE = /(plug\.dj\/)(?!enjoy-the-drop\b|about\b|ba\b|forgot-password\b|founders\b|giftsub\/\d|jobs\b|legal\b|merch\b|partners\b|plot\b|privacy\b|purchase\b|subscribe\b|team\b|terms\b|press\b|_\/|@\/|!\/)(.+)/i;
	const tuneStrings = [
		"%%DJ%%, %%USER%% would like you to know that this is a great tune!",
		"%%DJ%%, %%USER%% thinks this is an awesome track!",
		"%%DJ%%, keep playing such great tracks because %%USER%% seems to like them!",
		"%%USER%% absolutely love this music %%DJ%%!",
		'%%DJ%%, %%USER%% is really enjoying this track!',
		'%%DJ%%, %%USER%% is dancing his feet of this track!',
		'"%%DJ%% DUDE, this is awesome!" -from %%USER%%'
	];
	const propsStrings = [
		"%%DJ%% Aye mate, %%USER%% is on board with your ",
		"[%%USER%%] %%DJ%% Damn, you're on 🔥!",
		"%%DJ%%, %%USER%% wants you to know that you're a great DJ!",
		"%%DJ%%, %%USER%% has bought you some 💐 for your awesome play!",
		"Hey %%DJ%%, I think %%USER%% really likes you 😘"
	];
	/*const modules = {
		roomInfo: _.find(require.s.contexts._.defined,m=>m&&m.attributes&&m.attributes.shouldCycle)
	};*/
	function subChat(chat, obj) {
		if (typeof chat === 'undefined') return chat;
		var lit = '%%';
		for (var prop in obj) {
			chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
		}
		return chat;
	}
	function getGiphyID(options, callback) {
		$.getJSON("https://tv.giphy.com/v1/gifs/random?",
			{
				format: 'json',
				api_key: giphyKey,
				rating: options.rating,
				tag: options.fixedtag
			},
			function(response) {
				callback(response.data.id);
			}
		);
	}
	function getRandomGiphyID(rating, callback) {
		$.getJSON("https://tv.giphy.com/v1/gifs/random?",
			{
				format: 'json',
				api_key: giphyKey,
				rating: rating
			},
			function(response) {
				callback(response.data.id);
			}
		);
	}
	/*function toggleCycle() {
		let shouldCycle = modules.roomInfo.attributes.shouldCycle;
		let disableCycle = shouldCycle && API.getUsers().length >= 10;
		let enableCycle = !shouldCycle && API.getUsers().length <= 8;

		if (disableCycle) API.moderateDJCycle(false);
		else if (enableCycle) API.moderateDJCycle(true);
	}*/
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
						callback('/me [@%%USER%%] I am somehow not authorized to do this :thinking:');
					break;

					case 'Not a valid ban duration':
						callback('/me [@%%USER%%] Please make sure that the duration of the ban is correct.');
					break;

					case 'Not a valid ban reason':
						callback('/me [@%%USER%%] Please make sure that the reason of the ban is correct.');
					break;

					case 'Not in a room':
						console.error('Trying to waitlist ban while not being in a room?!');
					break;

					case 'Nice try buddy, bouncers can\'t perm ban':
						callback('/me [@%%USER%%] As a bouncer, I cannot permanently ban a user.');
					break;

					case 'That user is too powerful to ban':
						callback('/me [@%%USER%%] Trying to ban an Admin/BA ? Well no luck here..');
					break;

					case 'Cannot ban a >= ranking user':
						callback('/me [@%%USER%%] You can\'t ban users with an equal or higher rank than you!');
					break;

					case 'Not a moderator':
						callback('/me [@%%USER%%] I need to be bouncer minimum to perform this action.');
					break;

					case 'Trying to ban yourself?':
						callback('/me [@%%USER%%] Hey! Don\'t try to ban me!');
					break;

					default:
						callback('/me [@%%USER%%] An error occured, please try again.');
					break;
				}
			}
		});
	}
	API.moderateForceQuit = function() {
		if (API.hasPermission(null, API.ROLE.BOUNCER)) {
			$.ajax({
				url: '/_/booth/remove/'+API.getDJ().id,
				method: 'DELETE'
			});
		}
	};
	Number.prototype.spaceOut = function() {
		if (isNaN(this) || this < 999) return this;
		return (this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	// Loto stuff
	window.cooldown = {
		gif: 0,
		loto: JSON.parse(localStorage.getItem('loto-CD')) || []
	};
	const lotoBlacklist = [
		4613422,  // WiBla
		6553384,  // <~ Tene ~>
		31441561, // Vitus34
		31254834, // oli-roux,
		30611116, // sam_1
		31465051, // Y0l0hentai69
		31442496, // Montcalmxv5
		31256054  // miguou888
	];
	const emote = [
		// [Emote, value, %chance]
		['💀',        0, 90],    // skull
		['💊',        0, 90],    // pill
		['💣',        0, 90],    // bomb
		['👾',        0, 90],    // space_invader
		['📦',        0, 90],    // package
		[':troll:',  0, 90],    // 90% chance to lose
		['🍒',      500, 90],    // 10%
		['🍇',     1000, 96],    // 4%
		['⚡',     2000, 99.4],  // 0.6%
		['🎲',     5000, 99.8],  // 0.2%
		['👑',    10000, 99.9],  // 0.1%
		['🎁',    25000, 99.999] // 0.001%
	];
	function generateEmote(msg) {
		let chanceMultiplier;
		if (lotoBlacklist.indexOf(msg.uid) > -1) chanceMultiplier = 0;
		else chanceMultiplier = 100;

		let rdm = Math.random()*chanceMultiplier; // 0 - 99.999999999999999

		for (let i = emote.length-1; i >= 0; i--) {
			if (rdm >= emote[i][2]) return emote[i];
			else if (i <= 5) return emote[Math.floor(Math.random()*6)];
		}
	}
	function loto(msg) {
		var row1 = generateEmote(msg);
		var row2 = generateEmote(msg);
		var row3 = generateEmote(msg);
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

		if (earn <= 0) API.sendChat(`/me ${row1}|${row2}|${row3} @${msg.un}, you lost, retry tomorrow !`);
		else {
			if (earn >= 1000) earn = (earn /= 1000) + 'k';

			API.sendChat(`/me ${row1}|${row2}|${row3} @${msg.un}, you won ${earn}PP ! :tada:`);
		}
	}
	// Hangmann stuff
	String.prototype.replaceAt = function(index, replacement) {
		return this.substr(0, index) + replacement + this.substr(index + replacement.length);
	};
	const words = [
		'chorus',
		'maestro',
		'piano',
		'music',
		'symphony',
		'rythm',
		'requiem',
		'serenade',
		'sonata',
		'soprano',
		'vibrato',
		'virtuoso',
		'magnetophone',
		'microphone',
		'xylophone',
		'guitare',
		'table',
		'television',
		'drawer',
		'computer',
		'laptop',
		'house',
		'church',
		'fruits',
		'kiwi',
		'vegetable',
		'speakers',
		'games',
		'video-games',
		'keyboard',
		'coins',
		'money',
		'happy',
		'sharing',
		'disco',
		'country',
		'paper',
		'mysterious',
		'sphinx',
		'egypt'
	];
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

			for (var i = 0; i < secret.length; i++) {
				underline += secret.charAt(i) === '-' ? '-' : '_';
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
		hangMessaged.forEach((cid) => {API.moderateDeleteChat(cid);});
		hangMessaged = [];
	}
	// Live stuff
	const playlistID = '10722938';
	var errorState = 0;
	function getCurrentLive(callback) {
		$.ajax({
			url: `/_/playlists/${playlistID}/media`,
			method: 'GET',
			dataType: 'json',
			success: function(data) {
				errorState = 0;

				let medias = data.data;
				medias.forEach((media) => {
					if (media.duration === 86400) callback(media);
				});
			},
			error: function() {
				if (errorState === 0) {
					getCurrentLive(callback);
					errorState = 1;
				} else {
					API.sendChat('/me [Error @WiBla] Could not get Current live.');
				}
			}
		});
	}
	function isUnavailable(media, callback) {
		$.ajax({
			url: `https://www.googleapis.com/youtube/v3/videos?id=${media.cid}&key=${YTAPIkey}&part=snippet,status`,
			type: 'GET',
			success: function(data) {
				errorState = 0;

				if (data.items.length === 0 ||
				    (data.items.length == 1 && ['processed', 'uploaded'].indexOf(data.items[0].status.uploadStatus) < 0)) {
					callback(true, media);
				}
				else callback(false, media);
			},
			error: function() {
				if (errorState === 0) {
					isUnavailable(media, callback);
					errorState = 1;
				} else {
					API.sendChat('/me [Error @WiBla] Could not check live availability.');
				}
			}
		});
	}
	function deleteMedia(media, callback) {
		$.ajax({
			url: `/_/playlists/${playlistID}/media/delete`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				ids: [media.id]
			}),
			success: function() {
				errorState = 0;

				callback();
			},
			error: function() {
				if (errorState === 0) {
					deleteMedia(media, callback);
					errorState = 1;
				} else {
					API.sendChat('/me [Error @WiBla] Could not delete current live.');
				}
			}
		});
	}
	function getNewLive(callback) {
		$.ajax({
			url: 'https://content.googleapis.com/youtube/v3/search?'+
				'type=video'+
				'&eventType=live'+
				'&q='+encodeURI('24/7 Monstercat Radio')+
				'&maxResults=25'+
				'&part=snippet'+
				'&key=AIzaSyC8pk0f57a_UcAIbHdrvRhsmHSG1KZk2SM',
			type: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				errorState = 0;

				if (data.items.length === 0) return;
				data.items.forEach((item) => {
					if (item.snippet.channelId === "UCJ6td3C9QlPO9O_J5dF4ZzA") {
						callback({
							cid:    item.id.videoId,
							author: item.snippet.title.split(' - ')[0],
							title:  item.snippet.title.split(' - ').slice(1).join(' - '),
							image:  item.snippet.thumbnails.default.url,
							duration: 86400,
							format: 1,
							id: 1
						});
					}
				});
			},
			error: function() {
				if (errorState === 0) {
					getNewLive(callback);
					errorState = 1;
				} else {
					API.sendChat('/me [Error @WiBla] Could not get new live.');
				}
			}
		});
	}
	function addMedia(media, callback) {
		$.ajax({
			url: `/_/playlists/${playlistID}/media/insert`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				media: [media],
				append: false
			}),
			success: function() {
				errorState = 0;

				callback();
			},
			error: function() {
				if (errorState === 0) {
					addMedia(media, callback);
					errorState = 1;
				} else {
					API.sendChat('/me [Error @WiBla] Could not add live.');
				}
			}
		});
	}

	function extend() {
		if (!window.bot) return setTimeout(extend, 1000);

		var bot = window.bot;
		bot.retrieveSettings();

		function playLive() {
			if (API.getDJ() !== undefined || API.getWaitList().length !== 0) return;

			let liveWarn = ' Join the waitlist and I\'ll stop playing!';
			let _welcome = bot.chat.welcome;
			let _welcomeback = bot.chat.welcomeback;

			bot.settings.smartSkip = false;
			bot.settings.historySkip = false;
			bot.chat.welcome += liveWarn;
			bot.chat.welcomeback += liveWarn;
			if (API.djJoin() === 0) {
				API.once(API.WAIT_LIST_UPDATE, () => {
					API.once(API.WAIT_LIST_UPDATE, () => {
						bot.settings.smartSkip = true;
						bot.settings.historySkip = true;
						bot.chat.welcome = _welcome;
						bot.chat.welcomeback = _welcomeback;
						$.ajax({url:'/_/booth',type:'DELETE'});
					});
				});
			}
		}
		function naModSkip(name) {
			API.sendChat(subChat(bot.chat.notavailable, {
				name: name
			}));
			if (bot.settings.smartSkip) {
				return bot.roomUtilities.smartSkip();
			} else {
				return API.moderateForceSkip();
			}
		}
		function storeToStorage() {
			localStorage.setItem('basicBotsettings', JSON.stringify(bot.settings));
			localStorage.setItem('basicBotRoom', JSON.stringify(bot.room));
			var basicBotStorageInfo = {
				time: Date.now(),
				stored: true,
				version: bot.version
			};
			localStorage.setItem('basicBotStorageInfo', JSON.stringify(basicBotStorageInfo));
		}
		function skip() {
			if (API.getWaitList().length === 0) API.moderateForceQuit();
			else if (bot.settings.smartSkip) bot.roomUtilities.smartSkip();
			else API.moderateForceSkip();
		}

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
						var tag = msg.substr(cmd.length + 1);
						var fixedtag = tag.replace(/ /g,"+");
						var commatag = tag.replace(/ /g,", ");

						getGiphyID({rating: 'nsfw', fixedtag: fixedtag}, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] http:\/\/i.giphy.com\/'+id+'.gif');
							} else {
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] Invalid tags, try something different.');
							}
						});
					}
					else {
						getRandomGiphyID('nsfw', function(id) {
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
						var tag = msg.substr(cmd.length + 1);
						var fixedtag = tag.replace(/ /g,"+");
						var commatag = tag.replace(/ /g,", ");

						getGiphyID({rating: 'pg-13', fixedtag: fixedtag}, function(id) {
							if (typeof id !== 'undefined') {
								cooldown.gif = new Date().getTime();
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] http:\/\/i.giphy.com\/'+id+'.gif');
							} else {
								API.sendChat('/me ['+chat.un+'] [Tags: '+commatag+'] Invalid tags, try something different.');
							}
						});
					}
					else {
						getRandomGiphyID('pg-13', function(id) {
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
			command: ['clearLS', 'clearls'],
			rank: 'manager',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					var plugSettings = localStorage.getItem('settings');
					var lotoCDLS = localStorage.getItem('loto-CD');

					localStorage.clear();

					if (plugSettings !== null) localStorage.setItem('settings', plugSettings);
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
		bot.commands.mehCommand = {
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
		bot.commands.event = {
			command: ['event', 'roomevent'],
			rank: 'manager',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					bot.room.roomevent = !bot.room.roomevent;

					if (bot.room.roomevent) {
						bot.settings.afkRemoval = false;
						bot.settings.blacklistEnabled = false;
						bot.settings.lockGuard = false;
						bot.settings.timeGuard = false;
						bot.settings.cycleGuard = false;
						bot.settings.voteSkip = false;
						bot.settings.historySkip = false;
						bot.settings.thorCommand = false;
					} else {
						bot.settings.afkRemoval = settings.afkRemoval;
						bot.settings.blacklistEnabled = settings.blacklistEnabled;
						bot.settings.lockGuard = settings.lockGuard;
						bot.settings.timeGuard = settings.timeGuard;
						bot.settings.cycleGuard = settings.cycleGuard;
						bot.settings.voteSkip = settings.voteSkip;
						bot.settings.historySkip = settings.historySkip;
						bot.settings.thorCommand = settings.thorCommand;
					}

					API.sendChat(`/me [@${chat.un}] Event mode ${(bot.room.roomevent ? 'enabled. Things like historySkip or timeGuard have been disabled.' : 'disabled.')}`);
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
					if (chat.uid === 4613422) return loto(chat); // testing stuff
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
		bot.commands.favorite = {
			command: ['favorite', 'fav'],
			rank: 'user',
			type: 'exact',
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bot.commands.executable(this.rank, chat)) return void (0);
				else {
					API.sendChat('https://i.imgur.com/ji5Uzkg.gif Remember to put the room in your favorite if we deserve it ! ♥');
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
			command: ['pendu', 'hangman'],
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
			command: ['stoppendu', 'stophangman'],
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
		// Remove basicBot advance handler
		API._events.advance.shift();
		// To use our own
		API.on(API.ADVANCE, function(obj) {
			// Clear timers
			if (typeof bot.room.historySkip !== 'undefined') clearTimeout(bot.room.historySkip);
			if (typeof bot.room.autoskipTimer !== 'undefined') clearTimeout(bot.room.autoskipTimer);
			// Check if a song is playing and woot
			if (typeof obj.media === 'undefined') return;
			if (bot.settings.autowoot) $('#woot').click();

			for (var i = 0; i < bot.room.users.length; i++) {
				if (bot.room.users[i].id === obj.dj.id) {
					bot.room.users[i].lastDC = {
						time: null,
						position: null,
						songCount: 0
					};
				}
			}

			let blacklistRE = /(nightcore|ear rape|gemidão do zap)/gi;
			var blacklistArray = ['nightcore', 'ear rape', 'gemidão do zap'];
			let wholeTitle = `${obj.media.author} - ${obj.media.title}`;

			wholeTitle.split(blacklistRE).forEach((word) => {
				let indexOfBlacklist = blacklistArray.indexOf(word);
				if (indexOfBlacklist > -1) {
					switch(indexOfBlacklist) {
						case 0:
							API.sendChat(`/me [@${obj.dj.username}] nightcore is not allowed. Skipping..`);
							bot.roomUtilities.smartSkip();
						break;

						case 1:
						case 2:
							API.sendChat(`/me [@${obj.dj.username}] Good luck playing that again. @staff`);
							if (obj.dj.role > 0 || obj.dj.gRole > 0)
								waitlistBan({ID: obj.dj.id, duration: 'd', reason: 3});
							else
								waitlistBan({ID: obj.dj.id, duration: 'f', reason: 3});
						break;
					}

					return;
				}
			});

			var lastplay = obj.lastPlay;
			if (typeof lastplay === 'undefined') return;
			if (bot.settings.songstats) {
				if (typeof bot.chat.songstatistics === 'undefined') {
					API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.');
				} else {
					API.sendChat(subChat(bot.chat.songstatistics, {
						artist: lastplay.media.author,
						title: lastplay.media.title,
						woots: lastplay.score.positive,
						grabs: lastplay.score.grabs,
						mehs: lastplay.score.negative
					}));
				}
			}
			bot.room.roomstats.totalWoots += lastplay.score.positive;
			bot.room.roomstats.totalMehs += lastplay.score.negative;
			bot.room.roomstats.totalCurates += lastplay.score.grabs;
			bot.room.roomstats.songCount++;
			bot.roomUtilities.intervalMessage();
			bot.room.currentDJID = obj.dj.id;

			var newMedia = obj.media;
			var format = obj.media.format;
			var cid = obj.media.cid;
			setTimeout(function() {
				var mid = obj.media.format + ':' + obj.media.cid;
				for (var bl in bot.room.blacklists) {
					if (bot.settings.blacklistEnabled) {
						if (bot.room.blacklists[bl].indexOf(mid) > -1) {
							API.sendChat(subChat(bot.chat.isblacklisted, {
								blacklist: bl
							}));
							if (bot.settings.smartSkip) {
								return bot.roomUtilities.smartSkip();
							} else {
								return API.moderateForceSkip();
							}
						}
					}
				}
			}, 2000);
			setTimeout(function() {
				let limit = bot.settings.maximumSongLength*60;
				if (bot.settings.timeGuard && newMedia.duration > limit && !bot.room.roomevent) {
					API.sendChat(`Song is longer than ${Math.floor(limit/60)}min ${limit%60}s, skipping after the limit.`);
					setTimeout(function(data) {
						// Is it still the same music or has it been skipped already ?
						if (data.cid === API.getMedia().cid) {
							API.sendChat('Skipping after the time limit..');
							API.moderateForceSkip();
						}
					}, limit*1000, newMedia);
				}
			}, 2000);
			setTimeout(function() {
				if (format == 1) {
					$.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
						if (typeof(track.items[0]) === 'undefined') {
							var name = obj.dj.username;
							API.sendChat(subChat(bot.chat.notavailable, {
								name: name
							}));
							if (bot.settings.smartSkip) {
								return bot.roomUtilities.smartSkip();
							} else {
								return API.moderateForceSkip();
							}
						}
					});
				} else {
					SC.get('/tracks/' + cid, function(track) {
						if (typeof track.title === 'undefined') naModSkip(obj.dj.username);
					}).catch((error) => {
						if (error.status === 404) naModSkip(obj.dj.username);
					});
				}
			}, 2000);

			if (bot.settings.historySkip) {
				var alreadyPlayed = false;
				var apihistory = API.getHistory();
				var dj = obj.dj;
				var warns = 0;

				bot.room.historySkip = setTimeout(function() {
					for (var i = 0; i < apihistory.length; i++) {
						if (apihistory[i].media.cid === obj.media.cid) {
							alreadyPlayed = true;
							warns++;

							if (bot.room.historyList[i])
								bot.room.historyList[i].push(+new Date());
						}
					}

					if (alreadyPlayed) {
						if (warns === 0) {
							API.sendChat(subChat(bot.chat.songknown, {
								name: dj.username
							}));
							skip();
						} else if (warns === 1) {
							API.sendChat(`/me First Warning @${dj.username}, you have two songs in history, if this continue, you will be removed from the waitlist.`);
							skip();
						} else if (warns === 2) {
							API.sendChat(`/me Second Warning @${dj.username}, please check your playlists or you will be removed.`);
							skip();
						} else if (warns === 3) {
							API.moderateForceQuit();
							API.sendChat(`/me @${dj.username} you have been removed from the waitlist for having too many songs in history. If this happens once more, you will be waitlist banned for 15 minutes.`);
						} else if (warns >= 4) {
							waitlistBan({
								ID: dj.id,
								duration: 's',
								reason: 4
							});
							API.sendChat(`/me @${dj.username} you have been waitlist banned for 15 minutes, please disable any auto-join and check your playlists regularly to prevent this from happening again.`);
						}
					} else {
						bot.room.historyList.push([obj.media.cid, +new Date()]);
					}
				}, 2000);
			}
			if (bot.settings.autoskip) {
				var remaining = obj.media.duration * 1000;
				var startcid = API.getMedia().cid;
				bot.room.autoskipTimer = setTimeout(function() {
					var endcid = API.getMedia().cid;
					if (startcid === endcid) {
						//API.sendChat('Song stuck, skipping...');
						API.moderateForceSkip();
					}
				}, remaining + 5000);
			}
			storeToStorage();
		});
		API.on(API.CHAT, function(msg) {
			// trying to be low on ram
			API.sendChat('/clear');
			// Auto-delete socket app promotion
			if (
				msg.message.indexOf('http://socket.dj') !== -1 &&
				API.hasPermission(null, API.ROLE.BOUNCER)
			) {
				API.moderateDeleteChat(msg.cid);
			} else if (
				roomRE.test(msg.message) &&
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

					if (underline.indexOf('_') !== -1)
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
		// API.on(API.USER_JOIN, () => toggleCycle());
		// API.on(API.USER_LEAVE, () => toggleCycle());
		API.on(API.WAIT_LIST_UPDATE, () => {
			if (typeof window.wluInt !== 'undefined') clearTimeout(window.wluInt);
			if (API.getDJ() !== undefined || API.getWaitList().length !== 0) return;

			window.wluInt = setTimeout(() => {
				if (API.getDJ() !== undefined || API.getWaitList().length !== 0) return;

				getCurrentLive((media) => {
					isUnavailable(media, (unavailable, media) => {
						if (!unavailable) playLive();
						else {
							deleteMedia(media, () => {
								getNewLive((newMedia) => {
									addMedia(newMedia, () => {
										playLive();
									});
								});
							});
						}
					});
				});
			}, 2*60*1000);
		});

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
		timeGuard: true,
		maximumSongLength: 7.5,
		autodisable: false,
		commandCooldown: 5,
		usercommandsEnabled: true,
		thorCommand: true,
		thorCooldown: 15,
		skipPosition: 2,
		skipReasons: [
			["history",     "This song is in the history."],
			["sound",       "The song you played had bad sound quality or no sound."],
			["unavailable", "The song you played was not available for some users."],
			["indispo",     "The song you played was not available for some users. "],
			["troll",       "We do not allow this type of music/video."],
			["nsfw",        "The song you played contained not safe for work content."],
			["outro",       "The song you played had a long/irrelevant outro."]
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
		fbLink: "https://facebook.com/ElectroHousenjoythedrop",
		youtubeLink: null,
		discordLink: "https://discord.gg/9GPAeYF",
		website: "http://wibla.free.fr/plug",
		intervalMessages: [
			"Give the !loto a try, you can win up to 75k PP daily!! :gift:",
			"Our favorite autowoot https://github.com/Plug-It",
			"https://i.imgur.com/ji5Uzkg.gif Remember to put the room in your favorite if we deserve it! ♥",
			":warning: If your songs has more than 5 mehs, it will be skipped!",
			"Invite your friends! The more people, the more fun!",
			"You can play music up to 7min 30sec. After that, it will be skipped!",
			"Feel free to use !tune or !props whenever you hear a banging tune!",
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
	settings.skipReasons.push(['theme', 'This song does not fit the room theme: '+settings.themeLink]);
	settings.intervalMessages.push('Join us on discord ! '+settings.discordLink);
	localStorage.setItem('basicBotsettings', JSON.stringify(settings));

	$.getScript("https://rawgit.com/bscBot/source/master/basicBot.js", extend);
}).call(this);
