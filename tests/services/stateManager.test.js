/* eslint-disable no-undef */
import StateManager from '../../src/services/stateManager.js';
import {jest} from '@jest/globals'

describe('StateManager', () => {
    let stateManager = StateManager;

    beforeEach(() => {
        // Create a new instance for each test to ensure isolation
        jest.resetModules();
        stateManager.registeredServers = new Map();
        stateManager.webSocketClients = new Map();
    });

    describe('registerChannel', () => {
        it('should register a new channel for a guild', () => {
            const guildId = '123';
            const channelId = '456';

            stateManager.registerChannel(guildId, channelId);

            expect(stateManager.registeredServers.has(guildId)).toBe(true);
            expect(stateManager.registeredServers.get(guildId).has(channelId)).toBe(true);
            expect(stateManager.registeredServers.get(guildId).get(channelId)).toEqual({ messages: [] });
        });

        it('should handle multiple channels for same guild', () => {
            const guildId = '123';
            const channelId1 = '456';
            const channelId2 = '789';

            stateManager.registerChannel(guildId, channelId1);
            stateManager.registerChannel(guildId, channelId2);

            expect(stateManager.registeredServers.get(guildId).has(channelId1)).toBe(true);
            expect(stateManager.registeredServers.get(guildId).has(channelId2)).toBe(true);
        });
    });

    describe('addMessage', () => {
        it('should add message to registered channel', () => {
            const guildId = '123';
            const channelId = '456';
            const message = { content: 'test message' };

            stateManager.registerChannel(guildId, channelId);
            stateManager.addMessage(guildId, channelId, message);

            const messages = stateManager.registeredServers.get(guildId).get(channelId).messages;
            expect(messages).toHaveLength(1);
            expect(messages[0]).toBe(message);
        });

        it('should not add message to unregistered channel', () => {
            const guildId = '123';
            const channelId = '456';
            const message = { content: 'test message' };

            stateManager.addMessage(guildId, channelId, message);

            expect(stateManager.registeredServers.has(guildId)).toBe(false);
        });
    });

    describe('getChannelMessages', () => {
        it('should return messages for registered channel', () => {
            const guildId = '123';
            const channelId = '456';
            const message = { content: 'test message' };

            stateManager.registerChannel(guildId, channelId);
            stateManager.addMessage(guildId, channelId, message);

            const messages = stateManager.getChannelMessages(guildId, channelId);
            expect(messages).toHaveLength(1);
            expect(messages[0]).toBe(message);
        });

        it('should return empty array for unregistered channel', () => {
            const messages = stateManager.getChannelMessages('123', '456');
            expect(messages).toEqual([]);
        });
    });
}); 