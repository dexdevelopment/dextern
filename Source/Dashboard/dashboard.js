function init(client) {
    /* --- IMPORTS --- */
    const { dashboard, mongoURI } = require('../../Configs/main.json');
    const {
        MessageEmbed, 
        CommandInteraction, 
        MessageActionRow, 
        MessageButton
    } = require("discord.js");
    const DarkDashboard = require('dbd-dark-dashboard');
    const DBD = require("discord-dashboard");
    const mongoose = require("mongoose");
    const guildSchema = require("../Structures/Database/Schemas/Guild");
    const automodSchema = require('../Structures/Database/Schemas/ModerationDB');
    const loggingSchema = require("../Structures/Database/Schemas/Logging");
    const ticketSchema = require("../Structures/Database/Schemas/TicketSetup");

    const totalUsers = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
    const usersWord = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0) > 1
        ? "users"
        : "user";
    const totalGuilds = client.guilds.cache.size;
    const guildsWord = client.guilds.cache.size > 1 ? "servers" : "server";

    /* --- DASHBOARD --- */
    (async () => {
        let DBD = require('discord-dashboard');
        await DBD.useLicense(dashboard.dbd_lic);
        DBD.Dashboard = DBD.UpdatedClass();

        const Dashboard = new DBD.Dashboard({
            port: process.env.PORT || 80,
            client: {
                id: dashboard.client_id,
                secret: dashboard.client_secret
            },
            redirectUri: dashboard.redirect_uri,
            acceptPrivacyPolicy: true,
            domain: 'http://localhost',
            bot: client,
            invite: {
                clientId: "862812525920518144",
                permissions: '8',
                redirectUri: "http://localhost/discord/callback",
                scopes: ["bot", "applications.commands"],
            },
            theme: DarkDashboard({
                information: {
                    createdBy: "Greezy Development",
                    websiteTitle: "Dextern",
                    websiteName: "Dextern",
                    websiteUrl: "http://localhost",
                    dashboardUrl: "http://localhost",
                    supporteMail: "support@greezy.tk",
                    supportServer: "https://discord.gg/ANxGjW9tAX",
                    imageFavicon: "https://cdn.discordapp.com/attachments/998689949161357398/998692527500697620/dextern_temp_logo.jpg",
                    iconURL: "https://cdn.discordapp.com/attachments/998689949161357398/998692527500697620/dextern_temp_logo.jpg",
                    loggedIn: "Successfully signed in.",
                    mainColor: "#1e54ac",
                    subColor: "#739de0",
                    preloader: "Loading..."
                },

                custom_html: {
                    head: `<html og="https://ogp.me/ns#%22%3E">
                           <meta property="og:title" content="Dextern | Dashboard"/>
                           <meta property="og:image" content="https://cdn.discordapp.com/attachments/998689949161357398/998692527500697620/dextern_temp_logo.jpg"/>
                           <meta property="og:url" content="https://valiant.greezy.tk"/>`
                },

                guildAfterAuthorization: {
                    use: true,
                    guildId: "971534964527087726"
                },

                index: {
                    card: {
                        category: "Dextern's Panel - The center of everything",
                        title: `Welcome to Dextern... A multipurpose discord bot that can do whatever you dream of, execpt <i>bake you a cake<\i>...`,
                        image: "https://docs.google.com/drawings/d/e/2PACX-1vS2QIenk9jw5iT_thON1kA8rLl-rX_OUFYlp0yKFc_f_wxw1wn1tMW7T_8eKI5WAtqAlw9_Cjf-166m/pub?w=927&h=178",
                        footer: "To get started, just sign in using your discord account!",
                    },

                    information: {
                        category: "Bot Information",
                        title: "Information",
                        description: `Dextern is trusted by many users and guilds. We have a total of ${totalUsers} ${usersWord} throughout ${totalGuilds} ${guildsWord}.`,
                        footer: "To invite the bot, just log in and select a server you want the bot to join!",
                    },

                    feeds: {
                        category: "Category",
                        title: "Information",
                        description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
                        footer: "Footer",
                    },
                },
            }),
            settings: [
                {
                    categoryId: 'settings',
                    categoryName: "Main Settings",
                    categoryDescription: "All of the settings that do not have their own section.",
                    categoryOptionsList: [
                        {
                            optionId: 'prefix',
                            optionName: "Prefix",
                            optionDescription: "Set bot prefix. This will only be needed once legacy commands are added.",
                            optionType: DBD.formTypes.input('Prefix', 1, 4, false, false), // reqired false (if empty reset to default)
                            getActualSet: async ({ guild }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                return data.prefix || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                await guildSchema.findOneAndUpdate(
                                    {
                                        id: guild.id
                                    },
                                    {
                                        prefix: newData
                                    }
                                );
                                return;
                            }
                        },
                    ]
                },

                {
                    categoryId: "ticketConfig",
                    categoryName: "Ticket Settings",
                    categoryDescription: "Configure and send the ticket embeds, and buttons.",
                    categoryOptionsList: [
                        {
                            optionType: 'spacer',
                            title: 'Main Settings',
                            description: 'Here you will configure all of the main settings for the ticket system. No embed building, yet ;)'
                        },
                        {
                            optionId: 'channel',
                            optionName: "Ticket Channel",
                            optionDescription: "Select the channel where the embed with buttons to start tickets will be sent. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Channel || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.Channel = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionId: 'category',
                            optionName: "Tickets Category",
                            optionDescription: "Select the category where the ticket channels will be added. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_CATEGORY']),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Category || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.Category = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionId: 'transcript',
                            optionName: "Transcript Channel",
                            optionDescription: "Select the channel where the ticket transcripts will be sent. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Transcripts || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.Transcripts = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionId: 'handler_role',
                            optionName: "Handler Roles",
                            optionDescription: "Select the role(s) that will be able to preform actions within the tickets.",
                            optionType: DBD.formTypes.rolesMultiSelect(false, true),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Handlers || [];
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.Handlers = newData || null;
                                data.Everyone = guild.id;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionType: 'spacer',
                            title: 'Create Buttons',
                            description: 'Here you will be able to set the text for the buttons, if you want an emoji and you are on PC use WINDOWSKEY + . to open up an emoji menu.'
                        },
                        {
                            optionId: 'button1',
                            optionName: "First Button",
                            optionDescription: "Set the text for the first button. Between 1 and 20 characters.",
                            optionType: DBD.formTypes.input('🕴️ Member Report', 1, 20, false, false), // reqired false (if empty reset to default)
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Buttons[0] || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id})
                                data.Buttons[0] = newData || null;
                                await data.markModified();
                                await data.save();
                            }
                        },
                        {
                            optionId: 'button2',
                            optionName: "Second Button",
                            optionDescription: "Set the text for the second button. Between 1 and 20 characters.",
                            optionType: DBD.formTypes.input('🪲 Bug Report', 1, 20, false, false), // reqired false (if empty reset to default)
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Buttons[1] || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id})
                                data.Buttons[1] = newData || null;
                                await data.markModified();
                                await data.save();
                            }
                        },
                        {
                            optionId: 'button3',
                            optionName: "Third Button",
                            optionDescription: "Set the text for the third button. Between 1 and 20 characters.",
                            optionType: DBD.formTypes.input('🌐 Everything Else', 1, 20, false, false), // reqired false (if empty reset to default)
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.Buttons[2] || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id})
                                data.Buttons[2] = newData || null;
                                await data.markModified();
                                await data.save();
                            }
                        },
                        {
                            optionType: 'spacer',
                            title: 'Create Embeds',
                            description: 'Here you will create the embed that will be sent to the channel you specify right when you save these settings, and the embed for when a ticket is created.'
                        },
                        {
                            optionId: 'initial',
                            optionName: "Initial Message",
                            optionDescription: "Build the message that will be sent to the channel you specified earler.",
                            optionType: DBD.formTypes.embedBuilder({
                                username: client.user.username,
                                avatarURL: client.user.avatarURL({ dynamic: true }),
                                defaultJson: {
                                    content: "Need assistance? Click a ticket!",
                                    embed: {
                                        timestamp: null,
                                        url: "https://valiant.greezy.tk/invite",
                                        description: "There once was a man that needed assistance, then Dexterns ticket system came into existance!",
                                        author: {
                                            name: "Need help? Click a ticket!",
                                            url: "https://valiant.greezy.tk/invite",
                                            icon_url: "https://github.com/itstylerrr/Valiant/blob/main/Extra/Images/Logos/valiantlogo-blue-large.png?raw=true"
                                        },
                                        image: {
                                            url: "https://www.natchitochestimes.com/wp-content/uploads/2022/05/clickitorticket1.jpg"
                                        },
                                        footer: {
                                            text: "At the time of writing this I realised that YOU HAVENT INVITED ME TO YOUR SERVER YET GO TO IT RIGHT NOW.",
                                            icon_url: "https://github.com/itstylerrr/Valiant/blob/main/Extra/Images/Logos/valiantlogo-blue-large.png?raw=true"
                                        },
                                        fields: [
                                            {
                                                name: "Hi :)",
                                                value: "Your doing great :) Wait! Stop! Don't delete me I have been a good little field :c"
                                            },
                                            {
                                                name: "Meanie",
                                                value: "YOU DELEATED MY FRIEND :C ANYWAYS STOP DONT DELETE ME :CCC oh wait, you have to? fine ;c I guess go ahead. ANYWAYS DID YOU KNOW THAT YOU CAN USE EMOJIS FROM WHERE THE BOT ISNT :) SO COOL YAY",
                                                inline: false
                                            },
                                        ]
                                    }
                                }
                            }),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.initial || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.initial = newData || null;
                                await data.markModified();
                                await data.save();
                                const chan = data.Channel;
                                if (newData === data.initial) return;
                                if (chan) {
                                    const channel = client.channels.cache.get(chan);
                                    if (data.Buttons) {
                                        const buttons = new MessageActionRow();
                                        buttons.addComponents(
                                            new MessageButton()
                                            .setCustomId(data.Buttons[0])
                                            .setLabel(data.Buttons[0])
                                            .setStyle("PRIMARY"),
                                            new MessageButton()
                                            .setCustomId(data.Buttons[1])
                                            .setLabel(data.Buttons[1])
                                            .setStyle("PRIMARY"),
                                            new MessageButton()
                                            .setCustomId(data.Buttons[2])
                                            .setLabel(data.Buttons[2])
                                            .setStyle("PRIMARY"),
                                        )
                                        channel.send({ content: newData.content, embeds: [newData.embed], components: [buttons] });
                                    }
                                }
                                return;
                            }
                        },
                        {
                            optionId: 'individual',
                            optionName: "Per Ticket Message",
                            optionDescription: "Build the message that will be sent right when the user creates a ticket.",
                            optionType: DBD.formTypes.embedBuilder({
                                username: client.user.username,
                                avatarURL: client.user.avatarURL({ dynamic: true }),
                                defaultJson: {
                                    content: "Hello! Please wait for the <@staffroleid> team to get here!",
                                    embed: {
                                        timestamp: null,
                                        url: "https://valiant.greezy.tk/invite",
                                        description: "In the meantime, you can start describing your issue!",
                                        author: {
                                            name: null,
                                            url: "https://valiant.greezy.tk/invite",
                                            icon_url: null
                                        },
                                        image: {
                                            url: null
                                        },
                                        footer: {
                                            text: null,
                                            icon_url: null
                                        },
                                        fields: null,
                                    }
                                }
                            }),
                            getActualSet: async ({ guild }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                return data.individual || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await ticketSchema.findOne({ GuildID: guild.id });
                                data.individual = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                    ]
                },

                {
                    categoryId: "loggingChannels",
                    categoryName: "Logging Channels",
                    categoryDescription: "Configure the logging channels.",
                    categoryOptionsList: [
                        {
                            optionId: 'memberLogs',
                            optionName: "Member Log Channel",
                            optionDescription: "Select the channel where member logs will be sent. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                return data.memberLogs || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                data.memberLogs = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionId: 'modLogs',
                            optionName: "Mod Log Channel",
                            optionDescription: "Select the channel where mod logs will be sent. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                return data.modLogs || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                data.modLogs = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                        {
                            optionId: 'guildLogs',
                            optionName: "Guild Log Channel",
                            optionDescription: "Select the channel where guild logs will be sent. To disable, select the value: -",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                return data.guildLogs || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await loggingSchema.findOne({ GuildID: guild.id });
                                data.guildLogs = newData || null;
                                await data.markModified();
                                await data.save();
                                return;
                            }
                        },
                    ]
                },

                {
                    categoryId: "xpconfig",
                    categoryName: "XP Settings",
                    categoryDescription: "Configure the XP settings.",
                    categoryOptionsList: [
                        {
                            optionId: 'switch_xpToggle',
                            optionName: "Toggle XP System",
                            optionDescription: "Toggle the XP system on and off.",
                            optionType: DBD.formTypes.switch(false),
                            getActualSet: async ({ guild }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                const SAVED_STATE = data.addons.xp.enabled;
                                const DEFAULT_STATE = false;
                                return (SAVED_STATE == null || SAVED_STATE == undefined) ? DEFAULT_STATE : SAVED_STATE;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                data.addons.xp.enabled = newData || null;
                                await data.markModified("addons.xp");
                                await data.save();
                                return;
                            },
                        },

                        {
                            optionId: 'level_channel',
                            optionName: "Rank Up Channel",
                            optionDescription: "Select the channel where rank up messages should be sent to. You do not need to select a channel",
                            optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                            getActualSet: async ({ guild }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                return data.addons.xp.channel || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                data.addons.xp.channel = newData || null;
                                await data.markModified("addons.xp");
                                await data.save();
                                return;
                            }
                        },

                        {
                            optionId: 'background',
                            optionName: "Background",
                            optionDescription: "Change the background for the rank up car.",
                            optionType: DBD.formTypes.input('Image URL'), // reqired false (if empty reset to default)
                            getActualSet: async ({ guild }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                return data.addons.xp.background || null;
                            },
                            setNew: async ({ guild, newData }) => {
                                const data = await guildSchema.findOne({ id: guild.id });
                                data.addons.xp.background = newData || null;
                                await data.markModified("addons.xp");
                                await data.save();
                                return;
                            }
                        },
                    ]
                }
            ]
        });
        Dashboard.init();
    })();
}

module.exports.init = init;