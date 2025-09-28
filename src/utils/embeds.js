import { EmbedBuilder } from "discord.js";

export const helpEmbeds = {
    "ff": new EmbedBuilder()
      .setTitle("Comandos de Free Fire")
      .setColor(0xFF4500)
      .addFields(
        { name:"/like <ID> <REGIÃO>", value:"Envia likes", inline:false },
        { name:"/infoff <ID>", value:"Mostra infos do jogador FF (região BR)", inline:false },
        { name:"/buscar_nick <nickname> <região>", value:"Procura um jogador pelo nickname", inline:false },
        { name:"/buscar_guilda <id> <região>", value:"Mostra informações de uma guilda", inline:false },
        { name:"/verificar_ban <id>", value:"Verifica se um jogador está banido", inline:false },
        { name:"/estatisticas <id> <região> <modo>", value:"Exibe as estatísticas de um jogador", inline:false },
        { name:"/mapa_craft <codigo> <região>", value:"Mostra detalhes de um mapa Craftland", inline:false }
      ),
    "bot": new EmbedBuilder()
      .setTitle("Comandos do Bot")
      .setColor(0x5865F2)
      .addFields(
        { name:"/info", value:"Mostra infos do bot", inline:false },
        { name:"/config", value:"Configurações do bot (só para admins)", inline:false },
        { name:"/help", value:"Mostra este menu de ajuda", inline:false },
        { name:"/add-money <usuario> <quantidade>", value:"Adiciona Lamux a um usuário (dono do bot).", inline:false },
        { name:"/add-stock", value:"Adiciona contas ao estoque (dono do bot).", inline:false },
        { name:"/donate", value:"Mostra como apoiar o bot.", inline:false }
      ),
    "utils": new EmbedBuilder()
      .setTitle("Comandos de Utilidade")
      .setColor(0x00FFAA)
      .addFields(
        { name:"/infoserver", value:"Mostra informações sobre o servidor", inline:false },
        { name:"/infouser [usuario]", value:"Mostra informações sobre um usuário", inline:false },
        { name:"/avatar [usuario]", value:"Mostra o avatar de um usuário", inline:false }
      ),
    "economy": new EmbedBuilder()
      .setTitle("Comandos de Economia")
      .setColor(0xFFA500)
      .addFields(
        { name:"/balance [usuario]", value:"Verifica o saldo de Lamux.", inline:false },
        { name: "/daily", value: "Coleta seus Lamux diários.", inline: false },
        { name: "/pay <usuario> <quantidade>", value: "Envia Lamux para outro usuário.", inline: false },
        { name: "/leaderboard", value: "Mostra os usuários mais ricos.", inline: false },
        { name: "/roubar <usuario>", value: "Tenta roubar Lamux de outro usuário.", inline: false },
        { name: "/work", value: "Trabalha para ganhar Lamux.", inline: false },
        { name: "/loja", value: "Mostra a loja de itens.", inline: false }
      ),
    "interaction": new EmbedBuilder()
      .setTitle("Comandos de Interação")
      .setColor(0xFFC0CB)
      .addFields(
        { name: "/kiss <usuario>", value: "Beija um usuário.", inline: false },
        { name: "/hug <usuario>", value: "Abraça um usuário.", inline: false },
        { name: "/slap <usuario>", value: "Dá um tapa em um usuário.", inline: false },
        { name: "/marry <usuario>", value: "Casa com um usuário.", inline: false },
        { name: "/divorce", value: "Divorcia-se do seu parceiro.", inline: false }
      ),
    "memes": new EmbedBuilder()
        .setTitle("Comandos de Memes")
        .setColor(0x6A5ACD)
        .addFields(
            { name: "/meme", value: "Mostra um meme aleatório.", inline: false }
        )
};