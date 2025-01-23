const stateManager = require('./stateManager');

class MessageHandler {
    static async handleNewMessage(guildId, channelId, message) {
        // Add message to state
        stateManager.addMessage(guildId, channelId, message);

        // Broadcast to WebSocket clients
        const clients = stateManager.webSocketClients.get(channelId);
        if (clients) {
            const messageString = JSON.stringify(message);
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageString);
                }
            });
        }
    }
}

module.exports = MessageHandler;
