import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { CLIENT_ID, TOKEN } from "./config.js";
import log from "./utils/logger.js";

const ffRegions1 = ["sg", "eu", "me", "vn", "tw", "pk", "ru", "bd", "id", "th"].map(r => ({ name: r.toUpperCase(), value: r }));
const ffRegions2 = ["ind"].map(r => ({ name: r.toUpperCase(), value: r }));
const ffRegions3 = ["br", "sac", "us", "na", "latam"].map(r => ({ name: r.toUpperCase(), value: r }));
const allRegionChoices = [...ffRegions1, ...ffRegions2, ...ffRegions3];

const commands = [
  new SlashCommandBuilder().setName("info").setDescription("Mostra infos do bot"),
  new SlashCommandBuilder()
    .setName("like")
    .setDescription("Envia likes")
    .addStringOption(opt=>opt.setName("id").setDescription("ID do jogador").setRequired(true))
    .addStringOption(opt=>opt.setName("regiao").setDescription("Região").setRequired(true).addChoices(...allRegionChoices)),
  new SlashCommandBuilder()
    .setName("infoff")
    .setDescription("Mostra infos do jogador FF")
    .addStringOption(opt=>opt.setName("id").setDescription("ID do jogador").setRequired(true)),
  new SlashCommandBuilder().setName("config").setDescription("Configurações do bot"),
  new SlashCommandBuilder().setName("help").setDescription("Mostra todos os comandos"),
  new SlashCommandBuilder()
    .setName("buscar_nick")
    .setDescription("Procura um jogador pelo nickname")
    .addStringOption(opt => opt.setName("nickname").setDescription("Nickname do jogador").setRequired(true))
    .addStringOption(opt => opt.setName("regiao").setDescription("Região de busca").setRequired(true).addChoices(...allRegionChoices)),
  new SlashCommandBuilder()
    .setName("buscar_guilda")
    .setDescription("Mostra informações de uma guilda")
    .addStringOption(opt => opt.setName("id").setDescription("ID da guilda").setRequired(true))
    .addStringOption(opt => opt.setName("regiao").setDescription("Região da guilda").setRequired(true).addChoices(...allRegionChoices)),
  new SlashCommandBuilder()
    .setName("verificar_ban")
    .setDescription("Verifica se um jogador está banido")
    .addStringOption(opt => opt.setName("id").setDescription("ID do jogador").setRequired(true)),
  new SlashCommandBuilder()
    .setName("estatisticas")
    .setDescription("Exibe as estatísticas de um jogador")
    .addStringOption(opt => opt.setName("id").setDescription("ID do jogador").setRequired(true))
    .addStringOption(opt => opt.setName("regiao").setDescription("Região do jogador").setRequired(true).addChoices(...allRegionChoices))
    .addStringOption(opt => opt.setName("modo").setDescription("Modo de jogo").setRequired(true).addChoices({ name: "Contra Squad (CS)", value: "cs" }, { name: "Battle Royale (BR)", value: "br" })),
  new SlashCommandBuilder()
    .setName("mapa_craft")
    .setDescription("Mostra detalhes de um mapa do modo Craftland")
    .addStringOption(opt => opt.setName("codigo").setDescription("Código do mapa").setRequired(true))
    .addStringOption(opt => opt.setName("regiao").setDescription("Região do mapa").setRequired(true).addChoices(...allRegionChoices)),
  new SlashCommandBuilder()
    .setName("infoserver")
    .setDescription("Mostra informações sobre o servidor"),
  new SlashCommandBuilder()
    .setName("infouser")
    .setDescription("Mostra informações sobre um usuário")
    .addUserOption(opt => opt.setName("usuario").setDescription("O usuário para ver as informações").setRequired(false)),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Mostra o avatar de um usuário")
    .addUserOption(opt => opt.setName("usuario").setDescription("O usuário para ver o avatar").setRequired(false)),
  new SlashCommandBuilder().setName("balance").setDescription("Verifica o seu saldo de Lamux ou de outro usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para ver o saldo").setRequired(false)),
  new SlashCommandBuilder().setName("daily").setDescription("Coleta seus Lamux diários"),
  new SlashCommandBuilder().setName("pay").setDescription("Envia Lamux para outro usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para enviar").setRequired(true)).addIntegerOption(opt=>opt.setName("quantidade").setDescription("A quantidade de Lamux para enviar").setRequired(true)),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Mostra os usuários mais ricos do servidor"),
  new SlashCommandBuilder().setName("roubar").setDescription("Tenta roubar Lamux de outro usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para roubar").setRequired(true)),
  new SlashCommandBuilder().setName("kiss").setDescription("Beija um usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para beijar").setRequired(true)),
  new SlashCommandBuilder().setName("marry").setDescription("Casa com um usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para casar").setRequired(true)),
  new SlashCommandBuilder().setName("hug").setDescription("Abraça um usuário").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para abraçar").setRequired(true)),
  new SlashCommandBuilder().setName("divorce").setDescription("Divorcia-se do seu parceiro."),
  new SlashCommandBuilder().setName("work").setDescription("Trabalha para ganhar Lamux."),
  new SlashCommandBuilder().setName("slap").setDescription("Dá um tapa em um usuário.").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para dar um tapa").setRequired(true)),
  new SlashCommandBuilder().setName("meme").setDescription("Mostra um meme aleatório."),
  new SlashCommandBuilder().setName("add-money").setDescription("Adiciona Lamux para um usuário (apenas dono do bot)").addUserOption(opt=>opt.setName("usuario").setDescription("O usuário para adicionar saldo").setRequired(true)).addIntegerOption(opt=>opt.setName("quantidade").setDescription("A quantidade de Lamux para adicionar").setRequired(true)),
  new SlashCommandBuilder().setName("loja").setDescription("Mostra a loja de itens."),
  new SlashCommandBuilder().setName("add-stock").setDescription("Adiciona contas ao estoque (apenas dono do bot)."),
  new SlashCommandBuilder().setName("donate").setDescription("Mostra o link de doação para apoiar o bot."),
  new SlashCommandBuilder().setName("manutencao").setDescription("Gerencia o modo de manutenção para comandos de Free Fire (apenas dono).")
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('A ação a ser executada')
        .setRequired(true)
        .addChoices(
          { name: 'status', value: 'status' },
          { name: 'mensagem', value: 'mensagem' },
          { name: 'botoes', value: 'botoes' }
        ))
].map(cmd=>cmd.toJSON());

const rest = new REST({ version:"10" }).setToken(TOKEN);

export const registerCommands = async () => {
  try {
    log('CONSOLE', "Registrando slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    log('CONSOLE', "Slash commands registrados com sucesso!");
  } catch (err) {
    log('ERRO', `Falha ao registrar slash commands: ${err}`);
  }
};