(function () {

    // Change this to your GitHub username so you don't have to modify so many things.
    var fork = "WiBla";
    var gifCooldown = new Date();
    gifCooldown = gifCooldown.getTime();

    // Define our function responsible for extending the bot.
    function extend() {
        // If the bot hasn't been loaded properly, try again in 1 second(s).
        if (!window.bot) {
          return setTimeout(extend, 1 * 1000);
        }

        // Precaution to make sure it is assigned properly.
        var bot = window.bot;

        // Load custom settings set below
        bot.retrieveSettings();

        //Extend the bot here, either by calling another function or here directly.

        // You can add more spam words to the bot.
        var spamWords = ['skip'];
        for (var i = 0; i < spamWords.length; i++) {
          window.bot.chatUtilities.spam.push(spamWords[i]);
        }

        bot.commands.blocop = {
            command: 'blocop',
            rank: 'user',
            type: 'startsWith',
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!bot.commands.executable(this.rank, chat)) return void (0);
                else {
                    var msg = chat.message;
                    if (msg.length === cmd.length) return void (0);
                    var name = msg.substr(cmd.length + 1);
                    if (msg.length > cmd.length + 1) {
                        API.sendChat("/me Le bloc opératoire N°404 est disponible pour une ablation de côtes " + name + ".");
                    }
                }
            }
        };
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

        // Load the chat package again to account for any changes
        bot.loadChat();

      }

    //Change the bots default settings and make sure they are loaded on launch
    localStorage.setItem("basicBotsettings", JSON.stringify({
      botName: "marvinBot",
      language: "english",
      chatLink: "https://rawgit.com/bscBot/source/master/lang/en.json",
      scriptLink: "https://rawgit.com/bscBot/source/master/basicBot.js",
      roomLock: false, // Requires an extension to re-load the script
      startupCap: 1, // 1-200
      startupVolume: 0, // 0-100
      startupEmoji: true, // true or false
      autowoot: true,
      autoskip: true,
      smartSkip: true,
      cmdDeletion: true,
      maximumAfk: 240,
      afkRemoval: false,
      maximumDc: 60,
      bouncerPlus: true,
      blacklistEnabled: true,
      lockdownEnabled: false,
      lockGuard: false,
      maximumLocktime: 10,
      cycleGuard: false,
      maximumCycletime: 10,
      voteSkip: true,
      voteSkipLimit: 5,
      historySkip: true,
      timeGuard: true,
      maximumSongLength: 7.25,
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
      afkpositionCheck: 15,
      afkRankCheck: "user",
      motdEnabled: false,
      motdInterval: 10,
      motd: "",
      filterChat: false,
      etaRestriction: false,
      welcome: true,
      opLink: "http://wibla.free.fr/plug/room#op",
      rulesLink: "http://wibla.free.fr/plug/rules",
      themeLink: null,
      fbLink: null,
      youtubeLink: null,
      website: "http://wibla.free.fr/plug",
      intervalMessages: [
        "Join the discord: https://discord.gg/cXPG83s"
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

    // Start the bot and extend it when it has loaded.
    $.getScript("https://rawgit.com/bscBot/source/master/basicBot.js", extend);

}).call(this);
