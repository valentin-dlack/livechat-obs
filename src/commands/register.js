import stateManager from '../services/stateManager.js';

export const name = 'register';
export const description = 'Register a new channel to the livechat';
export async function execute(message) {
    const channelId = message.channel.id;
    const guildId = message.guild.id;

    stateManager.registerChannel(guildId, channelId);

    await message.channel.send(
        `Channel **${message.channel.name}** enregistré pour le serveur **${message.guild.name}**.`
        + `\n\nLien OBS: http://<IP>:3000/view/${channelId}`
    );
}