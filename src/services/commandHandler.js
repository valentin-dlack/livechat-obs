import { Collection, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config/config.js';

class CommandHandler {
    constructor({ paintSessionManager }) {
        this.commands = new Collection();
        this.paintSessionManager = paintSessionManager;
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
     * Handle a message -- LEGACY FUNCTION
     * @param {Object} message - The message to handle
     */
    async handle(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            console.error(`Command ${interaction.commandName} not found`);
            return;
        }

        try {
            await command.execute(interaction, this.getCommands(), this.paintSessionManager);
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            await interaction.reply('Une erreur est survenue lors de l\'exécution de la commande.');
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
            this.register(command.data.name, command);
            console.log(`Command ${command.data.name} loaded`);
        }

        await this.registerCommands();
    }

    /**
     * Register slash commands to discord API
     */
    async registerCommands() {
        const commands = [];

        for (const command of this.commands.values()) {
            commands.push(command.data.toJSON());
        }

        console.log(`Registering ${this.commands.size} commands in ${config.env} environment`);
        const rest = new REST().setToken(config.botToken);

        if (config.env === 'dev') {
            const data = await rest.put(
                Routes.applicationGuildCommands(config.botClientId, config.botGuildId),
                { body: commands }
            );
            console.log(`Successfully registered ${data.length} commands in ${config.env} environment`);
        } else {
            const data = await rest.put(
                Routes.applicationCommands(config.botClientId),
                { body: commands }
            );
            console.log(`Successfully registered ${data.length} commands in ${config.env} environment`);
        }
    }

    /**
     * Get all commands with name and description
     * @returns {Array} - An array of commands with name and description
     */
    getCommands() {
        return Array.from(this.commands.entries()).map(([name, command]) => ({
            name,
            description: command.data.description
        }));
    }
} 

export default CommandHandler;