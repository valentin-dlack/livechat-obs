const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { WebSocketServer } = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const registeredServers = {};
const webSocketClients = {};

bot.once('ready', () => {
    console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

bot.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const guildId = message.guild.id;

    if (!registeredServers[guildId]) {
        registeredServers[guildId] = {};
    }

    const serverData = registeredServers[guildId];

    if (message.content.startsWith('!register')) {
        const channelId = message.channel.id;
        serverData[channelId] = { messages: [] };
        message.channel.send(
            `Channel **${message.channel.name}** enregistré pour le serveur **${message.guild.name}**.`
        );
    }

    if (message.content.startsWith('!tell')) {
        const channelId = message.channel.id;

        if (serverData[channelId]) {
            const newMessage = {
                username: message.author.username,
                avatar: message.author.displayAvatarURL(),
                content: message.content.split(' ').slice(1).join(' '),
                attachments: message.attachments.map((attachment) => ({
                    url: attachment.url,
                    type: attachment.contentType,
                })),
            };

            serverData[channelId].messages.push(newMessage);

            if (webSocketClients[channelId]) {
                webSocketClients[channelId].forEach((ws) => {
                    ws.send(JSON.stringify(newMessage));
                });
            }

            message.channel.send(
                `Message ajouté pour le channel **${message.channel.name}**.`
            );
        } else {
            message.channel.send(
                "Ce channel n'est pas enregistré. Utilisez `!register` pour commencer."
            );
        }
    }

    if (message.content.startsWith('!stell')) {
        const channelId = message.channel.id;

        if (serverData[channelId]) {
            const newMessage = {
                username: null, // Set username to null
                avatar: 'https://example.com/anonymous-avatar.png', // Placeholder avatar URL
                content: message.content.split(' ').slice(1).join(' '),
                attachments: message.attachments.map((attachment) => ({
                    url: attachment.url,
                    type: attachment.contentType,
                })),
            };

            serverData[channelId].messages.push(newMessage);

            if (webSocketClients[channelId]) {
                webSocketClients[channelId].forEach((ws) => {
                    ws.send(JSON.stringify(newMessage));
                });
            }

            message.channel.send(
                `Message anonyme ajouté pour le channel **${message.channel.name}**.`
            );
        } else {
            message.channel.send(
                "Ce channel n'est pas enregistré. Utilisez `!register` pour commencer."
            );
        }
    }

    if (message.content.startsWith('!help')) {
        const helpMessage = `
        **Commandes disponibles :**
        \`!register\` - Enregistrer le channel pour recevoir des messages.
        \`!tell <message>\` - Envoyer un message avec votre nom d'utilisateur.
        \`!stell <message>\` - Envoyer un message anonymement.
        \`!help\` - Afficher ce message d'aide.
        `;
        message.channel.send(helpMessage);
    }
});

bot.login(process.env.BOT_TOKEN);

// Web server
const app = express();
app.set('view engine', 'ejs');

app.get('/view/:channelId', (req, res) => {
    const channelId = req.params.channelId;
    res.render('index', { channelId });
});

const server = app.listen(3000, () =>
    console.log('Serveur web démarré sur le port 3000')
);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const channelId = params.get('channelId');

    if (!webSocketClients[channelId]) {
        webSocketClients[channelId] = [];
    }

    webSocketClients[channelId].push(ws);

    console.log(`Client connecté au channel ID: ${channelId}`);

    ws.on('close', () => {
        webSocketClients[channelId] = webSocketClients[channelId].filter(
            (client) => client !== ws
        );
        console.log(`Client déconnecté du channel ID: ${channelId}`);
    });
});
