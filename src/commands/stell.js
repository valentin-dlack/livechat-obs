import { SlashCommandBuilder } from 'discord.js';
import messageHandler from '../services/messageHandler.js';

export const data = new SlashCommandBuilder()
    .setName('stell')
    .setDescription('Send an anonymous message to the livechat')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('Message to display in the livechat')
            .setRequired(false)
    )
    .addAttachmentOption(option =>
        option.setName('attachment')
            .setDescription('Image, gif, video or audio to send')
            .setRequired(false)
    );

export async function execute(interaction) {
    const channelId = interaction.channel.id;
    const guildId = interaction.guild.id;

    const attachment = interaction.options.getAttachment('attachment');
    const attachments = attachment ? [{
        url: attachment.url,
        type: attachment.contentType,
    }] : [];

    const newMessage = {
        username: null,
        avatar: null,
        content: interaction.options.getString('message') || ' ',  
        attachments: attachments,
    };

    await messageHandler.handleNewMessage(guildId, channelId, newMessage);
    await interaction.reply('Livechat sent ✅');
}
