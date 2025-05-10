import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display the help message');

export async function execute(interaction, commands) {
    const helpEmbed = new EmbedBuilder()
        .setTitle('Help')
        .setDescription('List of all commands')
        .setColor('#0099ff')
        .addFields(commands.map(command => ({
            name: `/${command.name}`,
            value: command.description
        })));

    await interaction.reply({ embeds: [helpEmbed] });
}
