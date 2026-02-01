import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import paintSession from '../../src/services/paintSession.js';

describe('PaintSessionManager', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // Reset l'état interne du singleton
        paintSession.sessions.clear();
        paintSession.channelSessions.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create a new session with unique ID', () => {
            const channelId = 'channel-123';
            const result = paintSession.createSession(channelId);

            expect(result).not.toBeNull();
            expect(result.sessionId).toBeDefined();
            expect(typeof result.sessionId).toBe('string');
            expect(result.expiresAt).toBeGreaterThan(Date.now());
        });

        it('should return null if session already exists for channel', () => {
            const channelId = 'channel-123';
            
            const first = paintSession.createSession(channelId);
            const second = paintSession.createSession(channelId);

            expect(first).not.toBeNull();
            expect(second).toBeNull();
        });

        it('should allow creating sessions for different channels', () => {
            const result1 = paintSession.createSession('channel-1');
            const result2 = paintSession.createSession('channel-2');

            expect(result1).not.toBeNull();
            expect(result2).not.toBeNull();
            expect(result1.sessionId).not.toBe(result2.sessionId);
        });

        it('should set expiration to 2min30 from now', () => {
            const now = Date.now();
            const result = paintSession.createSession('channel-123');
            
            const expectedDuration = 2 * 60 * 1000 + 30 * 1000; // 150000ms
            expect(result.expiresAt).toBe(now + expectedDuration);
        });
    });

    describe('getSession', () => {
        it('should return session data for valid sessionId', () => {
            const channelId = 'channel-123';
            const { sessionId } = paintSession.createSession(channelId);

            const session = paintSession.getSession(sessionId);

            expect(session).not.toBeNull();
            expect(session.sessionId).toBe(sessionId);
            expect(session.channelId).toBe(channelId);
            expect(session.strokes).toEqual([]);
            expect(session.participantCount).toBe(0);
            expect(session.isActive).toBe(true);
        });

        it('should return null for invalid sessionId', () => {
            const session = paintSession.getSession('invalid-id');
            expect(session).toBeNull();
        });

        it('should calculate remaining time correctly', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            // Avancer le temps de 1 minute
            jest.advanceTimersByTime(60 * 1000);
            
            const session = paintSession.getSession(sessionId);
            const expectedRemaining = (2 * 60 * 1000 + 30 * 1000) - (60 * 1000); // 90000ms
            
            expect(session.timeRemaining).toBe(expectedRemaining);
        });
    });

    describe('getSessionByChannel', () => {
        it('should return session for active channel', () => {
            const channelId = 'channel-123';
            const { sessionId } = paintSession.createSession(channelId);

            const session = paintSession.getSessionByChannel(channelId);

            expect(session).not.toBeNull();
            expect(session.sessionId).toBe(sessionId);
        });

        it('should return null for channel without session', () => {
            const session = paintSession.getSessionByChannel('unknown-channel');
            expect(session).toBeNull();
        });
    });

    describe('addParticipant', () => {
        it('should add participant to session', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            const result = paintSession.addParticipant(sessionId, 'user-1');
            const session = paintSession.getSession(sessionId);

            expect(result).toBe(true);
            expect(session.participantCount).toBe(1);
        });

        it('should not add duplicate participant', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            paintSession.addParticipant(sessionId, 'user-1');
            paintSession.addParticipant(sessionId, 'user-1');
            
            const session = paintSession.getSession(sessionId);
            expect(session.participantCount).toBe(1);
        });

        it('should reject when session is full (15 max)', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            // Ajouter 15 participants
            for (let i = 0; i < 15; i++) {
                paintSession.addParticipant(sessionId, `user-${i}`);
            }
            
            // Le 16ème doit être refusé
            const result = paintSession.addParticipant(sessionId, 'user-16');
            
            expect(result).toBe(false);
            expect(paintSession.getSession(sessionId).participantCount).toBe(15);
        });

        it('should return false for invalid session', () => {
            const result = paintSession.addParticipant('invalid-id', 'user-1');
            expect(result).toBe(false);
        });
    });

    describe('removeParticipant', () => {
        it('should remove participant from session', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            paintSession.addParticipant(sessionId, 'user-1');
            
            paintSession.removeParticipant(sessionId, 'user-1');
            
            const session = paintSession.getSession(sessionId);
            expect(session.participantCount).toBe(0);
        });

        it('should not throw for non-existent participant', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            expect(() => {
                paintSession.removeParticipant(sessionId, 'unknown-user');
            }).not.toThrow();
        });
    });

    describe('addStroke', () => {
        it('should add stroke with all properties', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            const strokeData = {
                points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
                color: '#FF0000',
                width: 5,
                tool: 'pen'
            };
            
            const result = paintSession.addStroke(sessionId, strokeData);
            const session = paintSession.getSession(sessionId);

            expect(result).toBe(true);
            expect(session.strokes).toHaveLength(1);
            expect(session.strokes[0].points).toEqual(strokeData.points);
            expect(session.strokes[0].color).toBe('#FF0000');
            expect(session.strokes[0].width).toBe(5);
            expect(session.strokes[0].tool).toBe('pen');
        });

        it('should use default values for missing properties', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            const strokeData = {
                points: [{ x: 0, y: 0 }]
            };
            
            paintSession.addStroke(sessionId, strokeData);
            const session = paintSession.getSession(sessionId);

            expect(session.strokes[0].color).toBe('#000000');
            expect(session.strokes[0].width).toBe(3);
            expect(session.strokes[0].tool).toBe('pen');
        });

        it('should return false for inactive session', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            paintSession.endSession(sessionId);
            
            const result = paintSession.addStroke(sessionId, { points: [] });
            expect(result).toBe(false);
        });

        it('should return false for invalid session', () => {
            const result = paintSession.addStroke('invalid-id', { points: [] });
            expect(result).toBe(false);
        });
    });

    describe('endSession', () => {
        it('should mark session as inactive', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            
            paintSession.endSession(sessionId);
            
            const session = paintSession.getSession(sessionId);
            expect(session.isActive).toBe(false);
        });

        it('should call onSessionEnd callback', () => {
            const callback = jest.fn();
            const channelId = 'channel-123';
            const { sessionId } = paintSession.createSession(channelId, callback);
            
            paintSession.endSession(sessionId);

            expect(callback).toHaveBeenCalledWith(sessionId, channelId);
        });

        it('should remove channel mapping', () => {
            const channelId = 'channel-123';
            const { sessionId } = paintSession.createSession(channelId);
            
            paintSession.endSession(sessionId);
            
            const sessionByChannel = paintSession.getSessionByChannel(channelId);
            expect(sessionByChannel).toBeNull();
        });

        it('should allow creating new session for same channel after end', () => {
            const channelId = 'channel-123';
            paintSession.createSession(channelId);
            paintSession.endSession(paintSession.getSessionByChannel(channelId).sessionId);
            
            const newSession = paintSession.createSession(channelId);
            expect(newSession).not.toBeNull();
        });

        it('should return false for invalid session', () => {
            const result = paintSession.endSession('invalid-id');
            expect(result).toBe(false);
        });

        it('should cleanup session after 1 minute', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            paintSession.endSession(sessionId);
            
            // Session encore accessible juste après
            expect(paintSession.getSession(sessionId)).not.toBeNull();
            
            // Avancer d'1 minute
            jest.advanceTimersByTime(60 * 1000);
            
            // Session supprimée
            expect(paintSession.getSession(sessionId)).toBeNull();
        });
    });

    describe('automatic expiration', () => {
        it('should auto-end session after 2min30', () => {
            const callback = jest.fn();
            const channelId = 'channel-123';
            paintSession.createSession(channelId, callback);

            // Avancer de 2min30
            jest.advanceTimersByTime(2 * 60 * 1000 + 30 * 1000);

            expect(callback).toHaveBeenCalled();
            expect(paintSession.getSessionByChannel(channelId)).toBeNull();
        });

        it('should not auto-end if manually ended before', () => {
            const callback = jest.fn();
            const { sessionId } = paintSession.createSession('channel-123', callback);
            
            // Terminer manuellement après 1 minute
            jest.advanceTimersByTime(60 * 1000);
            paintSession.endSession(sessionId);
            
            // Avancer encore 2 minutes (au-delà de l'expiration initiale)
            jest.advanceTimersByTime(2 * 60 * 1000);

            // Callback appelé une seule fois (à l'appel manuel)
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('isSessionActive', () => {
        it('should return true for active session', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            expect(paintSession.isSessionActive(sessionId)).toBe(true);
        });

        it('should return false for ended session', () => {
            const { sessionId } = paintSession.createSession('channel-123');
            paintSession.endSession(sessionId);
            expect(paintSession.isSessionActive(sessionId)).toBe(false);
        });

        it('should return false for invalid session', () => {
            expect(paintSession.isSessionActive('invalid-id')).toBe(false);
        });
    });

    describe('CONFIG', () => {
        it('should expose configuration constants', () => {
            expect(paintSession.constructor.CONFIG.SESSION_DURATION_MS).toBe(150000);
            expect(paintSession.constructor.CONFIG.MAX_PARTICIPANTS).toBe(15);
        });
    });
});
