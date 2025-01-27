import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config/config.js';
import setupExpressServer from './server/express.js';
import WebSocketService from './services/websocket.js';
import CommandHandler from './services/commandHandler.js';

// Setup Discord bot
const bot = new Client({
    intents: config.intents.map(intent => GatewayIntentBits[intent])
});


// Setup command handler
const commandHandler = new CommandHandler();
commandHandler.loadCommands(); // This will load all commands from the commands directory

// Bot event handlers
bot.once('ready', () => {
    console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

bot.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith('!')) {
        await commandHandler.handle(message, commandHandler.getCommands());
    }
});

// Setup Express and WebSocket
const app = setupExpressServer();
const server = app.listen(config.port, () =>
    console.log(`Serveur web démarré sur le port ${config.port}`)
);

// Initialize WebSocket service
// eslint-disable-next-line no-unused-vars
const wsService = new WebSocketService(server);

bot.login(config.botToken);

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        bot.destroy();
        process.exit(0);
    });
});
