import { randomUUID } from 'crypto';

const SESSION_DURATION_MS = 2 * 60 * 1000 + 30 * 1000; // 2min30
const MAX_PARTICIPANTS = 15;

class PaintSessionManager {
    constructor() {
        this.sessions = new Map(); // sessionId → SessionData
        this.channelSessions = new Map(); // channelId → sessionId 
    }

    /**
     * Crée une nouvelle session de dessin pour un channel
     * @param {string} channelId - ID du channel Discord
     * @param {function} onSessionEnd - Callback appelé à l'expiration
     * @returns {{ sessionId: string, expiresAt: number } | null} - null si session déjà active
     */
    createSession(channelId, onSessionEnd = null) {
        // Vérifier qu'aucune session n'est active sur ce channel
        if (this.channelSessions.has(channelId)) {
            return null;
        }

        const sessionId = randomUUID();
        const expiresAt = Date.now() + SESSION_DURATION_MS;

        const sessionData = {
            sessionId,
            channelId,
            strokes: [],
            participants: new Set(),
            createdAt: Date.now(),
            expiresAt,
            isActive: true,
            onSessionEnd,
            timer: setTimeout(() => {
                this.endSession(sessionId);
            }, SESSION_DURATION_MS)
        };

        this.sessions.set(sessionId, sessionData);
        this.channelSessions.set(channelId, sessionId);

        return { sessionId, expiresAt };
    }

    /**
     * Récupère une session par son ID
     * @param {string} sessionId 
     * @returns {object | null}
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        return {
            sessionId: session.sessionId,
            channelId: session.channelId,
            strokes: session.strokes,
            participantCount: session.participants.size,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            isActive: session.isActive,
            timeRemaining: Math.max(0, session.expiresAt - Date.now())
        };
    }

    /**
     * Récupère la session active d'un channel
     * @param {string} channelId 
     * @returns {object | null}
     */
    getSessionByChannel(channelId) {
        const sessionId = this.channelSessions.get(channelId);
        if (!sessionId) return null;
        return this.getSession(sessionId);
    }

    /**
     * Ajoute un participant à une session
     * @param {string} sessionId 
     * @param {string} participantId 
     * @returns {boolean} - false si session pleine ou inexistante
     */
    addParticipant(sessionId, participantId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) return false;
        if (session.participants.size >= MAX_PARTICIPANTS) return false;

        session.participants.add(participantId);
        return true;
    }

    /**
     * Retire un participant d'une session
     * @param {string} sessionId 
     * @param {string} participantId 
     */
    removeParticipant(sessionId, participantId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.participants.delete(participantId);
        }
    }

    /**
     * Ajoute un trait au canvas
     * @param {string} sessionId 
     * @param {object} strokeData - { points: [{x, y}], color: string, width: number, tool: 'pen'|'eraser' }
     * @returns {boolean}
     */
    addStroke(sessionId, strokeData) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) return null;

        const stroke = {
            id: randomUUID(),
            timestamp: Date.now(),
            points: strokeData.points,
            color: strokeData.color || '#000000',
            width: strokeData.width || 3,
            widthRatio: strokeData.widthRatio || null,
            tool: strokeData.tool || 'pen'
        };

        session.strokes.push(stroke);
        return stroke;
    }

    /**
     * Efface tous les traits d'une session
     * @param {string} sessionId
     * @returns {boolean}
     */
    clearStrokes(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) return false;
        session.strokes = [];
        return true;
    }

    /**
     * Termine une session (manuellement ou par expiration)
     * @param {string} sessionId 
     * @returns {boolean}
     */
    endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        // Annuler le timer si encore actif
        if (session.timer) {
            clearTimeout(session.timer);
            session.timer = null;
        }

        session.isActive = false;

        // Appeler le callback si défini
        if (session.onSessionEnd) {
            session.onSessionEnd(session.sessionId, session.channelId);
        }

        // Nettoyer les références
        this.channelSessions.delete(session.channelId);

        // Garder la session en mémoire pour consultation (strokes finaux)
        // Elle sera nettoyée après un délai ou manuellement
        setTimeout(() => {
            this.sessions.delete(sessionId);
        }, 60 * 1000); // Cleanup après 1 minute

        return true;
    }

    /**
     * Vérifie si une session est encore active
     * @param {string} sessionId 
     * @returns {boolean}
     */
    isSessionActive(sessionId) {
        const session = this.sessions.get(sessionId);
        return session?.isActive ?? false;
    }

    /**
     * Retourne les constantes de configuration
     */
    static get CONFIG() {
        return {
            SESSION_DURATION_MS,
            MAX_PARTICIPANTS
        };
    }
}

// Export singleton
export default new PaintSessionManager();
