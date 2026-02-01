import { WebSocketServer } from "ws";
import { randomUUID } from 'crypto';
import stateManager from "./stateManager.js";
import paintSession from "./paintSession.js";

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.setupHeartbeat();
        this.setupConnectionHandler();
    }

    setupConnectionHandler() {

        this.wss.on('connection', (ws, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const channelId = params.get('channelId');
            const sessionId = params.get('sessionId');

            if (sessionId) {
                this.handlePaintConnection(ws, sessionId);
                return;
            }

            if (!stateManager.webSocketClients.has(channelId)) {
                stateManager.webSocketClients.set(channelId, new Set());
            }

            stateManager.webSocketClients.get(channelId).add(ws);

            // Si une session paint est active pour ce channel, envoyer l'état actuel
            if (channelId) {
                const session = paintSession.getSessionByChannel(channelId);
                if (session && session.isActive) {
                    ws.send(JSON.stringify({
                        type: 'paint:init',
                        sessionId: session.sessionId,
                        strokes: session.strokes,
                        timeRemaining: session.timeRemaining
                    }));
                }
            }

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

    handlePaintConnection(ws, sessionId) {
        const session = paintSession.getSession(sessionId);
        if (!session || !session.isActive) {
            ws.close(1008, 'Session inexistante ou terminée');
            return;
        }

        if (!stateManager.paintWebSocketClients.has(sessionId)) {
            stateManager.paintWebSocketClients.set(sessionId, new Set());
        }

        const participantId = randomUUID();
        const added = paintSession.addParticipant(sessionId, participantId);
        if (!added) {
            ws.close(1008, 'Session pleine');
            return;
        }

        ws.paintSessionId = sessionId;
        ws.paintParticipantId = participantId;
        stateManager.paintWebSocketClients.get(sessionId).add(ws);

        ws.send(JSON.stringify({
            type: 'paint:init',
            strokes: session.strokes,
            timeRemaining: session.timeRemaining
        }));

        // Informer les overlays OBS connectés au channel
        this.broadcastToChannel(session.channelId, {
            type: 'paint:init',
            sessionId: session.sessionId,
            strokes: session.strokes,
            timeRemaining: session.timeRemaining
        });

        ws.on('message', (message) => {
            try {
                const payload = JSON.parse(message.toString());
                if (payload.type === 'paint:stroke') {
                    const stroke = paintSession.addStroke(sessionId, payload.stroke);
                    if (!stroke) return;
                    this.broadcastPaint(sessionId, ws, {
                        type: 'paint:stroke',
                        stroke
                    });
                    this.broadcastToChannel(session.channelId, {
                        type: 'paint:stroke',
                        stroke
                    });
                }

                if (payload.type === 'paint:clear') {
                    const cleared = paintSession.clearStrokes(sessionId);
                    if (!cleared) return;
                    this.broadcastPaint(sessionId, ws, { type: 'paint:clear' });
                    this.broadcastToChannel(session.channelId, { type: 'paint:clear' });
                }
            } catch (err) {
                console.error('Erreur WS paint:', err);
            }
        });

        ws.on('close', () => {
            paintSession.removeParticipant(sessionId, participantId);
            const clients = stateManager.paintWebSocketClients.get(sessionId);
            if (clients) {
                clients.delete(ws);
                if (clients.size === 0) {
                    stateManager.paintWebSocketClients.delete(sessionId);
                }
            }
        });
    }

    broadcastPaint(sessionId, sender, payload) {
        const clients = stateManager.paintWebSocketClients.get(sessionId);
        if (!clients) return;
        const data = JSON.stringify(payload);
        clients.forEach((client) => {
            if (client !== sender && client.readyState === 1) {
                client.send(data);
            }
        });
    }

    broadcastToChannel(channelId, payload) {
        const clients = stateManager.webSocketClients.get(channelId);
        if (!clients) return;
        const data = JSON.stringify(payload);
        clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(data);
            }
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

export default WebSocketService;