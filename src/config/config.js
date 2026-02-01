import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'dev',
    ip_site: process.env.IP_SITE || 'localhost',
    botToken: process.env.BOT_TOKEN,
    botClientId: process.env.CLIENT_ID,
    botGuildId: process.env.GUILD_ID,
    defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://example.com/anonymous-avatar.png',
    messageTimeout: 10000,
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ]
};

export { config };