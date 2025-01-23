class StateManager {
    constructor() {
        this.registeredServers = new Map();
        this.webSocketClients = new Map();
    }

    registerChannel(guildId, channelId) {
        if (!this.registeredServers.has(guildId)) {
            this.registeredServers.set(guildId, new Map());
        }
        this.registeredServers.get(guildId).set(channelId, { messages: [] });
    }

    addMessage(guildId, channelId, message) {
        const serverChannels = this.registeredServers.get(guildId);
        if (serverChannels && serverChannels.has(channelId)) {
            serverChannels.get(channelId).messages.push(message);
        }
    }

    getChannelMessages(guildId, channelId) {
        const serverChannels = this.registeredServers.get(guildId);
        return serverChannels?.get(channelId)?.messages || [];
    }
}

export default new StateManager();