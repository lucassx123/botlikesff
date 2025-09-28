import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { configs, saveConfigs } from "../utils/jsonManager.js";
import { helpEmbeds } from "../utils/embeds.js";

export default async (interaction, client) => {
    if (interaction.customId === 'help_menu') {
        const selectedCategory = interaction.values[0];
        const embed = helpEmbeds[selectedCategory];
        if (embed) {
            await interaction.update({ embeds: [embed], content: null });
        }
    }

    if (interaction.customId === "config_menu") {
        const choice = interaction.values[0];
        const gid = interaction.guild.id;
        configs[gid] ??= { welcome: {}, goodbye: {}, commandChat: "ALL" };
        if (choice === "nickname") {
            const modal = new ModalBuilder()
                .setCustomId("config_nickname")
                .setTitle("Alterar Apelido do Bot")
                .addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("nickname_input").setLabel("Novo apelido").setStyle(TextInputStyle.Short).setRequired(true)
                ));
            await interaction.showModal(modal);
        }
        if (choice === "commandchat") {
            const modal = new ModalBuilder()
                .setCustomId("config_commandchat")
                .setTitle("Chat de Comandos")
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("chat_id").setLabel("ID do chat (ou ALL)").setStyle(TextInputStyle.Short).setRequired(true)
                    )
                );
            await interaction.showModal(modal);
        }
    }
};