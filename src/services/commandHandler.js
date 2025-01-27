import { readdirSync } from 'fs';
import { join } from 'path';

class CommandHandler {
    constructor() {
        this.commands = new Map();
    }

    /**
     * Register a command
     * @param {string} commandName - The name of the command
     * @param {Object} commandModule - The module containing the command
    */
    register(commandName, commandModule) {
        if (!commandModule.execute || typeof commandModule.execute !== 'function') {
            throw new Error(`Command module for ${commandName} does not have an execute function`);
        }
        this.commands.set(commandName, commandModule);
    }

    /**
     * Handle a message
     * @param {Object} message - The message to handle
     */
    async handle(message, commands = []) {
        try {
            const args = await message.content.slice(1).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();
            const command = this.commands.get(commandName);
            if (!command) {
                throw new Error(`Command ${commandName} not found`);
            }
            await command.execute(message, args, commands);
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            await message.reply('Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }

    /**
     * Load commands from the commands directory (old FS method)
     */
    async loadCommands() {
        const __dirname = import.meta.dirname;
        const commandFiles = readdirSync(join(__dirname, '../commands'))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = await import(`../commands/${file}`);
            this.register(command.name, command);
            console.log(`Command ${command.name} loaded`);
        }
    }

    /**
     * Get all commands with name and description
     * @returns {Array} - An array of commands with name and description
     */
    getCommands() {
        return Array.from(this.commands.entries()).map(([name, command]) => ({
            name,
            description: command.description
        }));
    }
} 

export default CommandHandler;