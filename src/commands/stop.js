import { SlashCommandBuilder } from 'discord.js';
import messageHandler from '../services/messageHandler.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop any occuring livechat');

export async function execute(interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    const newMessage = {
        action: "stop"
    };

    await messageHandler.handleNewMessage(guildId, channelId, newMessage);
    await interaction.reply('Current livechat stopped ✅');
}