const dotenv = require('dotenv');
dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    botToken: process.env.BOT_TOKEN,
    defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://example.com/anonymous-avatar.png',
    messageTimeout: 10000,
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ]
};

module.exports = config;