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
                data: {
                    name: 'test',
                    description: 'Test command'
                },
                execute: jest.fn()
            };

            commandHandler.register('test', mockCommand);
            expect(commandHandler.commands.get('test')).toBe(mockCommand);
        });

        it('should throw error when registering invalid command', () => {
            const invalidCommand = {
                data: {
                    name: 'test',
                    description: 'Test command'
                }
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
                data: {
                    name: 'test',
                    description: 'Test command'
                },
                execute: mockExecute
            };

            const mockInteraction = {
                commandName: 'test',
                reply: jest.fn()
            };

            commandHandler.register('test', mockCommand);
            await commandHandler.handle(mockInteraction);

            expect(mockExecute).toHaveBeenCalledWith(mockInteraction, expect.any(Array));
        });

        it('should handle non-existent command', async () => {
            const mockInteraction = {
                commandName: 'nonexistent',
                reply: jest.fn()
            };

            await commandHandler.handle(mockInteraction);
            // Should not call reply since command doesn't exist (just logs error)
            expect(mockInteraction.reply).not.toHaveBeenCalled();
        });

        it('should handle command execution error', async () => {
            const mockExecute = jest.fn().mockRejectedValue(new Error('Test error'));
            const mockCommand = {
                data: {
                    name: 'test',
                    description: 'Test command'
                },
                execute: mockExecute
            };

            const mockInteraction = {
                commandName: 'test',
                reply: jest.fn()
            };

            commandHandler.register('test', mockCommand);
            await commandHandler.handle(mockInteraction);

            expect(mockInteraction.reply).toHaveBeenCalledWith('Une erreur est survenue lors de l\'exécution de la commande.');
        });
    });

    describe('getCommands', () => {
        it('should return list of registered commands', () => {
            const mockCommand1 = {
                data: {
                    name: 'test1',
                    description: 'Test command 1'
                },
                execute: jest.fn()
            };
            const mockCommand2 = {
                data: {
                    name: 'test2',
                    description: 'Test command 2'
                },
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