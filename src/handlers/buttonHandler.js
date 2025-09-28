import { getEcon, saveEconomy, saveStock, stock } from "../utils/jsonManager.js";
import log from "../utils/logger.js";

export default async (interaction, client) => {
    const econ = getEcon(interaction.guild.id, interaction.user.id);

    if (interaction.customId === 'buy_protection') {
        const cost = 1000;
        if (econ.balance < cost) {
            return interaction.reply({ content: "Você não tem Lamux suficiente para comprar a proteção.", ephemeral: true });
        }
        econ.balance -= cost;
        econ.protectionEnds = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days
        saveEconomy();
        await interaction.reply({ content: "Você comprou Proteção Anti-Roubo por 15 dias!", ephemeral: true });
    }

    if (interaction.customId === 'buy_account') {
        const cost = 20000;
        if (econ.balance < cost) {
            return interaction.reply({ content: "Você não tem Lamux suficiente para comprar uma conta.", ephemeral: true });
        }
        if (stock.length === 0) {
            return interaction.reply({ content: "Desculpe, não há contas em estoque no momento.", ephemeral: true });
        }
        econ.balance -= cost;
        const account = stock.shift();
        saveEconomy();
        saveStock();
        try {
            await interaction.user.send(`Obrigado por sua compra! Aqui estão os detalhes da sua conta:\n\`\`\`${account}\`\`\``);
            await interaction.reply({ content: "Você comprou uma conta! Verifique suas DMs para os detalhes.", ephemeral: true });
        } catch (error) {
            log('ERRO', `Falha ao enviar DM para ${interaction.user.tag}. Reembolsando.`);
            econ.balance += cost;
            stock.unshift(account);
            saveEconomy();
            saveStock();
            await interaction.reply({ content: "Não consegui te enviar uma DM. Verifique suas configurações de privacidade. Sua compra foi cancelada e você foi reembolsado.", ephemeral: true });
        }
    }
};