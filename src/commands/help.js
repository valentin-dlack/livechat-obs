import { EmbedBuilder } from "discord.js";

export const name = 'help';
export const description = 'Display the help message';
export async function execute(message, args, commands) {
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
