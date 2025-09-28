import { LOGS_ADICAO } from '../config.js';

export default {
    name: 'guildCreate',
    execute(guild, client) {
        const channel = client.channels.cache.get(LOGS_ADICAO);
        if (channel) {
            channel.send(`Fui adicionado em **${guild.name}** | membros: ${guild.memberCount}`);
        }
    },
};