const stateManager = require('../services/stateManager');

module.exports = {
    name: 'register',
    description: 'Register a new channel',
    execute: async (message) => {
        const channelId = message.channel.id;
        const guildId = message.guild.id;

        stateManager.registerChannel(guildId, channelId);

        await message.channel.send(
            `Channel **${message.channel.name}** enregistré pour le serveur **${message.guild.name}**.`
        );
    }
};