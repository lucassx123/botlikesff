import { configs, maintenanceConfig, stock, saveConfigs, saveMaintenanceConfig, saveStock } from "../utils/jsonManager.js";

export default async (interaction, client) => {
    if (interaction.customId === 'maintenance_message_modal') {
        maintenanceConfig.maintenance_message = interaction.fields.getTextInputValue('maintenance_message_input');
        saveMaintenanceConfig();
        return interaction.reply({ content: 'Mensagem de manutenção atualizada!', ephemeral: true });
    }

    if (interaction.customId === 'maintenance_buttons_modal') {
        const enabled = interaction.fields.getTextInputValue('buttons_enabled_input').toLowerCase() === 'true';
        const jsonInput = interaction.fields.getTextInputValue('buttons_json_input');
        try {
            const buttons = JSON.parse(jsonInput);
            maintenanceConfig.buttons_enabled = enabled;
            maintenanceConfig.buttons = buttons;
            saveMaintenanceConfig();
            return interaction.reply({ content: 'Configuração dos botões de manutenção atualizada!', ephemeral: true });
        } catch (e) {
            return interaction.reply({ content: 'Erro: O JSON dos botões é inválido. Por favor, verifique o formato.', ephemeral: true });
        }
    }

    const gid = interaction.guild.id;
    configs[gid] ??= { welcome: {}, goodbye: {}, commandChat: "ALL" };
    if (interaction.customId === "config_nickname") {
        const nickname = interaction.fields.getTextInputValue("nickname_input");
        try {
            await interaction.guild.members.me.setNickname(nickname);
            await interaction.reply({ content: `Apelido alterado para: ${nickname}`, ephemeral: true });
        } catch {
            await interaction.reply({ content: "Erro ao alterar apelido", ephemeral: true });
        }
    }
    if (interaction.customId === "config_commandchat") {
        configs[gid].commandChat = interaction.fields.getTextInputValue("chat_id");
        saveConfigs();
        await interaction.reply({ content: "Chat de comandos configurado!", ephemeral: true });
    }

    if (interaction.customId === 'add_stock_modal') {
        const stockInput = interaction.fields.getTextInputValue('stock_input');
        const newAccounts = stockInput.split('\n').filter(line => line.trim() !== '');
        stock.push(...newAccounts);
        saveStock();
        await interaction.reply({ content: `Adicionado ${newAccounts.length} novas contas ao estoque.`, ephemeral: true });
    }
};