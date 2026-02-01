import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { config } from "../config/config.js";
import stateManager from "../services/stateManager.js";

export const data = new SlashCommandBuilder()
    .setName('paint')
    .setDescription('Start a collaborative painting session');

export async function execute(interaction, commands, paintSessionManager) {
    const channelId = interaction.channelId;

    const existingSession = paintSessionManager.getSessionByChannel(channelId);
    if (existingSession) {
        return interaction.reply({
            content: `⚠️ Une session est déjà en cours dans ce channel !`,
            ephemeral: true
        });
    }

    const sendToChannel = (payload) => {
        const clients = stateManager.webSocketClients.get(channelId);
        if (!clients) return;
        const data = JSON.stringify(payload);
        clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(data);
            }
        });
    };

    const sendToSession = (sessionId, payload) => {
        const clients = stateManager.paintWebSocketClients.get(sessionId);
        if (!clients) return;
        const data = JSON.stringify(payload);
        clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(data);
            }
        });
    };

    const onSessionEnd = async (sessionId) => {
        try {
            sendToSession(sessionId, { type: 'paint:end' });
            sendToChannel({ type: 'paint:end' });

            const channel = await interaction.client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🎨 Session de peinture terminée')
                    .setDescription(`Le temps est écoulé ! Merci à tous.`)
                    .setColor(0xff0000)
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error("Erreur lors de la notification de fin de session:", err);
        }
    };
    const sessionInfo = paintSessionManager.createSession(channelId, onSessionEnd);
    if (!sessionInfo) {
        return interaction.reply({ content: `⚠️ Impossible de démarrer une nouvelle session.`, ephemeral: true });
    }

    const paintUrl = `http://${config.ip_site}:${config.port}/paint/${sessionInfo.sessionId}`;

    const embed = new EmbedBuilder()
        .setTitle('Session de peinture collaborative démarrée')
        .setDescription(`Une nouvelle session de peinture collaborative a été démarrée dans ce channel !\n\n`
            + `Cliquez [ici](${paintUrl}) pour rejoindre la session et commencer à peindre ensemble.`)
        .addFields(
            { name: 'Durée', value: '2 min 30', inline: true },
            { name: 'Lien OBS', value: `http://${config.ip_site}:3000/view/${channelId}`, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}