/* eslint-disable no-undef */
import CommandHandler from '../../src/services/commandHandler.js';
import {jest} from '@jest/globals'

describe('CommandHandler', () => {
    let commandHandler;

    beforeEach(() => {
        commandHandler = new CommandHandler();
    });

    describe('register', () => {
        it('should register a valid command', () => {
            const mockCommand = {
                name: 'test',
                description: 'Test command',
                execute: jest.fn()
            };

            commandHandler.register('test', mockCommand);
            expect(commandHandler.commands.get('test')).toBe(mockCommand);
        });

        it('should throw error when registering invalid command', () => {
            const invalidCommand = {
                name: 'test',
                description: 'Test command'
                // Missing execute function
            };

            expect(() => {
                commandHandler.register('test', invalidCommand);
            }).toThrow('Command module for test does not have an execute function');
        });
    });

    describe('handle', () => {
        it('should execute a valid command', async () => {
            const mockExecute = jest.fn();
            const mockCommand = {
                name: 'test',
                description: 'Test command',
                execute: mockExecute
            };

            const mockMessage = {
                content: '!test arg1 arg2',
                reply: jest.fn()
            };

            commandHandler.register('test', mockCommand);
            await commandHandler.handle(mockMessage);

            expect(mockExecute).toHaveBeenCalledWith(mockMessage, ['arg1', 'arg2'], []);
        });

        it('should handle non-existent command', async () => {
            const mockMessage = {
                content: '!nonexistent',
                reply: jest.fn()
            };

            await commandHandler.handle(mockMessage);
            expect(mockMessage.reply).toHaveBeenCalledWith('Une erreur est survenue lors de l\'exécution de la commande.');
        });
    });

    describe('getCommands', () => {
        it('should return list of registered commands', () => {
            const mockCommand1 = {
                name: 'test1',
                description: 'Test command 1',
                execute: jest.fn()
            };
            const mockCommand2 = {
                name: 'test2',
                description: 'Test command 2',
                execute: jest.fn()
            };

            commandHandler.register('test1', mockCommand1);
            commandHandler.register('test2', mockCommand2);

            const commands = commandHandler.getCommands();
            expect(commands).toEqual([
                { name: 'test1', description: 'Test command 1' },
                { name: 'test2', description: 'Test command 2' }
            ]);
        });
    });
}); 