import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { config } from "../config/config.js";

export const data = new SlashCommandBuilder()
    .setName('paint')
    .setDescription('Start a collaborative painting session');

export async function execute(interaction, commands, paintSessionManager) {
    const channelId = interaction.channelId;

    console.log(paintSessionManager);
    const existingSession = paintSessionManager.getSessionByChannel(channelId);
    if (existingSession) {
        return interaction.reply({
            content: `⚠️ Une session est déjà en cours dans ce channel !`,
            ephemeral: true
        });
    }

    const onSessionEnd = async () => {
        try {
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

    const paintUrl = `http://<IP>:${config.port}/paint/${sessionInfo.sessionId}`;

    const embed = new EmbedBuilder()
        .setTitle('Session de peinture collaborative démarrée')
        .setDescription(`Une nouvelle session de peinture collaborative a été démarrée dans ce channel !\n\n`
            + `Cliquez [ici](${paintUrl}) pour rejoindre la session et commencer à peindre ensemble.`)
        .addFields(
            { name: 'Durée', value: '2 min 30', inline: true },
            { name: 'Lien OBS', value: `http://<IP>:3000/view/${channelId}`, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}