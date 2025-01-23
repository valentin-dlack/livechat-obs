const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'help',
    description: 'Display the help message',
    execute: async (message, args, commands) => {
        const helpEmber = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('List of all commands')
            .setColor('#0099ff')
            .addFields(commands.map(command => ({
            name: `!${command.name}`,
            value: command.description
        })));

        await message.channel.send({ embeds: [helpEmber] });
    }
};
