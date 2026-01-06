import { SlashCommandBuilder } from 'discord.js';
import stateManager from '../services/stateManager.js';

export const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a new channel to the livechat');

export async function execute(interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    stateManager.registerChannel(guildId, channelId);

    await interaction.reply(
        `Channel **${interaction.channel.name}** enregistré pour le serveur **${interaction.guild.name}**.`
        + `\n\nLien OBS: http://<IP>:3000/view/${channelId}`
    );
}