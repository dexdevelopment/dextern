const { Client, Guild, MessageEmbed, WebhookClient } = require("discord.js");
const guildDb = require("../../Structures/Database/Schemas/Guild");
const modDb = require("../../Structures/Database/Schemas/ModerationDB");
const logDb = require("../../Structures/Database/Schemas/Logging");
const ticketDb = require("../../Structures/Database/Schemas/TicketSetup");
const warnDb = require("../../Structures/Database/Schemas/warnModel");
const { webhooks } = require("../../../Configs/main.json");

module.exports = {
    name: "guildDelete",
    once: false,
    /**
     * @param {Client} client 
     * @param {Guild} guild
     */

    async execute(guild, client) {
        guildDb.findOneAndDelete({
            id: guild.id
        });

        modDb.findOneAndDelete({
            GuildID: guild.id
        });

        logDb.findOneAndDelete({
            GuildID: guild.id
        });

        ticketDb.findOneAndDelete({
            GuildID: guild.id
        });

        warnDb.deleteMany({
            guildId: guild.id
        });

        const hook = new WebhookClient({
            url: webhooks.leaves
        });

        hook.send({
            embeds: [
                new MessageEmbed()
                .setTitle(" | Valiant Left Guild! | ")
                .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
                .addFields(
                  { name: "Guild Name:", value: guild.name, inline: true },
                  { name: "Guild Members:", value: `${guild.memberCount} members.`, inline: true },
                  {
                      name: "Client Total Users:",
                      value:
                        `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users.`,
                    },
                    
                    { name: "Total Guild Count:", value: `${client.guilds.cache.size} guilds.` },
                    { name: "Timestamp:", value: `<t:${parseInt(guild.joinedTimestamp / 1000)}:R>`}
                )
                .setColor("RED")
            ]
        });
    },
};