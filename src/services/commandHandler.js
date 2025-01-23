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
    async handle(message) {
        try {
            const args = await message.content.slice(1).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();
            const command = this.commands.get(commandName);
            if (!command) {
                throw new Error(`Command ${commandName} not found`);
            }
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            await message.reply('Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }

    /**
     * Load commands from the commands directory (old FS method)
     */
    loadCommands() {
        const fs = require('fs');
        const path = require('path');
        const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            this.register(command.name, command);
            console.log(`Command ${command.name} loaded`);
        }
    }
} 

module.exports = CommandHandler;
