const messageHandler = require('../services/messageHandler');

module.exports = {
    name: 'stell',
    description: 'Send an anonymous message to the livechat',
    execute: async (message, args) => {
        const channelId = message.channel.id;
        const guildId = message.guild.id;

        const newMessage = {
            username: null,
            avatar: null,
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
