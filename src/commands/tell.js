const messageHandler = require('../services/messageHandler');

module.exports = {
    name: 'tell',
    description: 'Send a public message (with username and avatar) to the livechat',
    execute: async (message, args) => {
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
