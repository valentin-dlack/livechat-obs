import messageHandler from '../services/messageHandler.js';

export const name = 'stell';
export const description = 'Send an anonymous message to the livechat';
export async function execute(message) {
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
