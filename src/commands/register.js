const stateManager = require('../services/stateManager');

module.exports = {
    name: 'register',
    description: 'Register a new channel to the livechat',
    execute: async (message, args) => {
        const channelId = message.channel.id;
        const guildId = message.guild.id;

        stateManager.registerChannel(guildId, channelId);

        await message.channel.send(
            `Channel **${message.channel.name}** enregistré pour le serveur **${message.guild.name}**.`
            + `\n\nLien OBS: http://<IP>:3000/view/${channelId}`
        );
    }
};