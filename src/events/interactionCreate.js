import { configs, maintenanceConfig } from '../utils/jsonManager.js';
import log from '../utils/logger.js';
import commandHandler from '../handlers/commandHandler.js';
import selectMenuHandler from '../handlers/selectMenuHandler.js';
import modalHandler from '../handlers/modalHandler.js';
import buttonHandler from '../handlers/buttonHandler.js';
import { LOGS_COMANDOS } from '../config.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.guild) return;

        const cfg = configs[interaction.guild.id];
        if (cfg && cfg.commandChat && cfg.commandChat !== "ALL" && interaction.channel.id !== cfg.commandChat) {
            return interaction.reply({ content: `Comandos só podem ser usados no chat configurado.`, flags: [MessageFlags.Ephemeral] });
        }

        const logChannel = client.channels.cache.get(LOGS_COMANDOS);

        if (interaction.isChatInputCommand()) {
            log('MSG', `Comando /${interaction.commandName} usado por ${interaction.user.tag} no servidor ${interaction.guild.name}`);
            if (logChannel) logChannel.send(`/${interaction.commandName} usado por ${interaction.user.tag}`);

            const ffCommands = ["like", "infoff", "buscar_nick", "buscar_guilda", "verificar_ban", "estatisticas", "mapa_craft"];
            if (!maintenanceConfig.ff_commands_enabled && ffCommands.includes(interaction.commandName)) {
                const maintenanceEmbed = new EmbedBuilder()
                    .setTitle("⚠️ Comandos em Manutenção ⚠️")
                    .setDescription(maintenanceConfig.maintenance_message || "Os comandos de Free Fire estão temporariamente desativados para manutenção. Tente novamente mais tarde.")
                    .setColor(0xFFCC00);

                const components = [];
                if (maintenanceConfig.buttons_enabled && maintenanceConfig.buttons && maintenanceConfig.buttons.length > 0) {
                    const row = new ActionRowBuilder();
                    maintenanceConfig.buttons.forEach(btn => {
                        row.addComponents(
                            new ButtonBuilder()
                                .setLabel(btn.label)
                                .setStyle(ButtonStyle.Link)
                                .setURL(btn.url)
                        );
                    });
                    components.push(row);
                }
                return interaction.reply({ embeds: [maintenanceEmbed], components, ephemeral: true });
            }

            commandHandler(interaction, client);

        } else if (interaction.isStringSelectMenu()) {
            selectMenuHandler(interaction, client);

        } else if (interaction.isModalSubmit()) {
            modalHandler(interaction, client);

        } else if (interaction.isButton()) {
            buttonHandler(interaction, client);
        }
    },
};