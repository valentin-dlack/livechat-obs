const { WebSocketServer } = require("ws");

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.setupHeartbeat();
        this.setupConnectionHandler();
    }

    setupConnectionHandler() {
        const stateManager = require('./stateManager');

        this.wss.on('connection', (ws, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const channelId = params.get('channelId');

            if (!stateManager.webSocketClients.has(channelId)) {
                stateManager.webSocketClients.set(channelId, new Set());
            }

            stateManager.webSocketClients.get(channelId).add(ws);

            console.log(`Client connecté au channel ID: ${channelId}`);

            ws.on('close', () => {
                stateManager.webSocketClients.get(channelId).delete(ws);
                if (stateManager.webSocketClients.get(channelId).size === 0) {
                    stateManager.webSocketClients.delete(channelId);
                }
                console.log(`Client déconnecté du channel ID: ${channelId}`);
            });
        });
    }

    setupHeartbeat() {
        this.wss.on('connection', (ws) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
        });

        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

}

module.exports = WebSocketService;