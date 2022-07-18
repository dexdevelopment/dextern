const { webhooks, botinfo } = require("../../../Configs/main.json");
const { Client, MessageEmbed, WebhookClient } = require("discord.js");
const DB = require("../../Structures/Database/Schemas/Logging");
/**
 *
 * @param {Client} client
 */
module.exports = async (client, PG, chalk) => {

    client.on('channelCreate', async (channel) => {
        const data = await DB.findOne({ GuildID: channel.guild.id });
        if (!data) return;
        if (!data.guildLogs) return;
        const logChan = client.channels.cache.get(data.guildLogs);
        if (!logChan) return;
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            type: "CHANNEL_CREATE",
            limit: 1
        });
        const chanLog = fetchedLogs.entries.first();
        if (channel.parent) {
            logChan.send({
                embeds: [
                            new MessageEmbed()
                                .setTitle("#️⃣ Channel Created")
                                .addFields(
                                    { name: "Channel Name:", value: `${channel.name} (${channel})` },
                                    { name: "Created By:", value: `${chanLog.executor || "Unable to fetch."}` },
                                    { name: "Parent Name:", value: channel.parent.name || "Channel is a Parent", inline: true},
                                    { name: "Position:", value: `${channel.position}` },
                                    { name: "Channel Type:", value: `${channel.type}` },
                                    { name: "Event Took Place:", value: `<t:${parseInt(channel.createdTimestamp / 1000)}:R>` }
                                )
                                .setColor("GREEN")
                ]
            });
        } else if (channel.type === "GUILD_CATEGORY") {
            logChan.send({
                embeds: [
                    new MessageEmbed()
                    .setTitle("#️📂 Category Created")
                    .addFields(
                        { name: "Channel Name:", value: `${channel.name}` },
                        { name: "Created By:", value: `${chanLog.executor || "Unable to fetch."}` },
                        { name: "Parent Name:", value: "Channel is a Parent", inline: true},
                        { name: "Position:", value: `${channel.position}` },
                        { name: "Channel Type:", value: `${channel.type}` },
                        { name: "Event Took Place:", value: `<t:${parseInt(channel.createdTimestamp / 1000)}:R>` }
                    )
                    .setColor("GREEN")
                ]
            })
        }
    });
    
    client.on('channelDelete', (channel) => {
        console.log(channel);
    });
    
    client.on('channelPinsUpdate', (channel, time) => {
        console.log(channel, time);
    });
    
    client.on('channelUpdate', (oldChannel, newChannel) => {
        console.log(oldChannel, newChannel);
    });
};
