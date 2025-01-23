import messageHandler from '../services/messageHandler.js';

export const name = 'stop';
export const description = 'Stop any occuring livechat';
export async function execute(message) {
    const channelId = message.channel.id;
    const guildId = message.guild.id;

    const newMessage = {
        action: "stop"
    };

    await messageHandler.handleNewMessage(guildId, channelId, newMessage);
    await message.react('✅');
}