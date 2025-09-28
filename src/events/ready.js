import log from '../utils/logger.js';
import { ActivityType } from 'discord.js';

function onBotReady(client) {
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const line = '-'.repeat(40);
    const newBio = "BLNHUB - BOTS E APIS - https://discord.gg/5qwycg89S4";

    log('CONSOLE', line);
    log('CONSOLE', `|| ${client.user.tag} está online!`);
    log('CONSOLE', line);
    log('CONSOLE', `|| Servidores: ${client.guilds.cache.size}`);
    log('CONSOLE', `|| Usuários totais: ${totalUsers}`);
    log('CONSOLE', `|| ID do Bot: ${client.user.id}`);
    log('CONSOLE', line);

    try {
        client.user.setActivity(newBio, { type: ActivityType.Playing });
        log('CONSOLE', `Bio atualizada para: "${newBio}"`);
    } catch (error) {
        log('ERRO', `Falha ao definir a atividade: ${error}`);
    }
}

export default {
    name: 'ready',
    once: true,
    execute(client) {
        onBotReady(client);
    },
};