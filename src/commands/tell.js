const stateManager = require('../services/stateManager');
const messageHandler = require('../services/messageHandler');

module.exports = {
    name: 'tell',
    execute: async (message) => {
        const channelId = message.channel.id;
        const guildId = message.guild.id;

        const newMessage = {
            username: message.author.username,
            avatar: message.author.displayAvatarURL(),
            content: message.content.split(' ').slice(1).join(' '),
            attachments: message.attachments.map((attachment) => ({
                url: attachment.url,
                type: attachment.contentType,
            })),
        };

        await messageHandler.handleNewMessage(guildId, channelId, newMessage);
        await message.react('✅');
    }
};
