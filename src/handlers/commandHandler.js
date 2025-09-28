import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, MessageFlags
} from "discord.js";
import fetch from "node-fetch";
import os from "os";
import process from "process";
import { BOT_OWNER_ID, MAIN_API, FF_API_KEY } from "../config.js";
import {
    configs, economy, interactions, maintenanceConfig, stock,
    saveConfigs, saveEconomy, saveInteractions, saveMaintenanceConfig, saveStock, getEcon
} from "../utils/jsonManager.js";
import log from "../utils/logger.js";
import { helpEmbeds } from "../utils/embeds.js";

export default async (interaction, client) => {
    const { commandName } = interaction;

    if (commandName === 'manutencao') {
        if (interaction.user.id !== BOT_OWNER_ID) {
          return interaction.reply({ content: "Este comando é apenas para o dono do bot.", ephemeral: true });
        }

        const subCommand = interaction.options.getString('comando');

        switch (subCommand) {
          case 'status': {
            maintenanceConfig.ff_commands_enabled = !maintenanceConfig.ff_commands_enabled;
            saveMaintenanceConfig();
            const status = maintenanceConfig.ff_commands_enabled ? "desativado" : "ativado";
            return interaction.reply({ content: `Modo de manutenção de comandos de FF foi ${status}.`, ephemeral: true });
          }
          case 'mensagem': {
            const modal = new ModalBuilder()
              .setCustomId('maintenance_message_modal')
              .setTitle('Definir Mensagem de Manutenção')
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('maintenance_message_input')
                    .setLabel("Mensagem da embed")
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(maintenanceConfig.maintenance_message || "")
                    .setRequired(true)
                )
              );
            return interaction.showModal(modal);
          }
          case 'botoes': {
            const modal = new ModalBuilder()
              .setCustomId('maintenance_buttons_modal')
              .setTitle('Configurar Botões da Manutenção')
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('buttons_enabled_input')
                    .setLabel("Ativar botões? (true/false)")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(maintenanceConfig.buttons_enabled || false))
                    .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('buttons_json_input')
                    .setLabel("Botões em formato JSON")
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(JSON.stringify(maintenanceConfig.buttons || [], null, 2))
                    .setRequired(true)
                )
              );
            return interaction.showModal(modal);
          }
        }
      }

      if (commandName === 'help') {
          const menu = new StringSelectMenuBuilder()
              .setCustomId('help_menu')
              .setPlaceholder('Selecione uma categoria de comandos')
              .addOptions([
                  { label: 'Economia', value: 'economy', description: 'Comandos de economia.' },
                  { label: 'Interação', value: 'interaction', description: 'Comandos de interação.' },
                  { label: 'Comandos de Free Fire', value: 'ff', description: 'Comandos relacionados ao jogo Free Fire.' },
                  { label: 'Comandos do Bot', value: 'bot', description: 'Comandos para gerenciar e ver informações do bot.' },
                  { label: 'Comandos de Utilidade', value: 'utils', description: 'Comandos úteis para o servidor.' },
                  { label: 'Memes', value: 'memes', description: 'Comandos de memes.' },
              ]);
          const row = new ActionRowBuilder().addComponents(menu);
          await interaction.reply({
              content: 'Selecione uma categoria para ver os comandos disponíveis:',
              components: [row],
              flags: [MessageFlags.Ephemeral]
          });
          return;
      }

      if(commandName === "info") {
        const uptimeSeconds = Math.floor(client.uptime / 1000);
        const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const ramUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const addButton = new ButtonBuilder()
          .setLabel("Site do Bot")
          .setStyle(ButtonStyle.Link)
          .setURL("https://likesff.shop/");
        const row = new ActionRowBuilder().addComponents(addButton);
        const embed = new EmbedBuilder()
          .setTitle("Informações do Bot")
          .setColor(0x5865f2)
          .addFields(
             { name:"Servidor", value:interaction.guild.name, inline:true },
        { name:"ID Servidor", value:interaction.guild.id, inline:true },
        { name:"Usuários neste servidor", value:`${interaction.guild.memberCount}`, inline:true },
        { name:"Total de usuários", value:`${totalUsers}`, inline:true },
        { name:"Bot Tag", value:client.user.tag, inline:true },
        { name:"ID do Bot", value:client.user.id, inline:true },
        { name:"Servidores", value:`${client.guilds.cache.size}`, inline:true },
        { name:"Uptime", value:`${uptimeSeconds}s`, inline:true },
        { name:"<a:ping_ATK:1413964649711276182> Ping", value:`${client.ws.ping}ms`, inline:true },
        { name:"<:_intel:1413966854271139894> CPU", value:`${os.cpus()[0].model}`, inline:true },
        { name:"RAM usada", value:`${ramUsageMB} MB`, inline:true },
        { name:"<a:tuxspin:1413966946927378447> Sistema Operacional", value:`${os.type()} ${os.arch()}`, inline:true },
        { name:"<:_javascript:1413966909191360614> Linguagem", value:`Node.js ${process.version} `, inline:true },
        { name:"<:coroa2:1223758955646292038> Dono do bot", value:`<@${BOT_OWNER_ID}>`, inline:true }
      )
          .setFooter({ text:`Pedido por ${interaction.user.tag}` });
        await interaction.reply({ embeds:[embed], components:[row], flags: [MessageFlags.Ephemeral] });
      }

      if(commandName === "infoff") {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const uid = interaction.options.getString("id");
        const url = `${MAIN_API}/api/info_player?uid=${uid}&region=BR&clothes=true`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if(!data.basicInfo) return interaction.editReply({ content: "UID inválido ou erro na API." });
          const basic = data.basicInfo;
          const clan = data.clanBasicInfo;
          const profileImg = data.profileInfo?.clothes?.images?.[0] || basic.avatars.png;
          const avatar = basic.avatars.png;
          const lastLogin = new Date(Number(basic.lastLoginAt) * 1000).toLocaleString("pt-BR");
          const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setLabel("Atualizações").setStyle(ButtonStyle.Link).setURL("https://discord.gg/DkabnPeFPZ"),
                  new ButtonBuilder().setLabel("Doação").setStyle(ButtonStyle.Link).setURL("https://livepix.gg/fenixlikes")
              );
          const embed = new EmbedBuilder()
            .setTitle(`Informações de ${basic.nickname}`)
            .setColor(0xFFD700)
            .setThumbnail(avatar)
            .setImage(profileImg)
            .addFields(
              { name: "Nickname", value: basic.nickname, inline: true },
              { name: "Level", value: `${basic.level}`, inline: true },
              { name: "Likes", value: `${basic.liked}`, inline: true },
              { name: "Rank", value: `${basic.rank}`, inline: true },
              { name: "Elite Pass", value: basic.hasElitePass ? "Sim" : "Não", inline: true },
              { name: "Clã", value: clan?.clanName || "Sem clã", inline: true },
              { name: "Membros do clã", value: clan?.memberNum ? `${clan.memberNum}/${clan.capacity}` : "N/A", inline: true },
              { name: "Último login", value: lastLogin, inline: true }
            )
            .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          await interaction.editReply({ embeds: [embed], components: [row] });
        } catch(err) {
          log('ERRO', `Comando /infoff falhou: ${err}`);
          if (err instanceof SyntaxError || err.type === 'invalid-json') {
              await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
          } else if(interaction.deferred || interaction.replied) {
            interaction.editReply({ content: "Erro ao conectar na API." });
          } else {
            interaction.reply({ content: "Erro ao conectar na API." });
          }
        }
      }

      if (commandName === "like") {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const uid = interaction.options.getString("id");
        const region = interaction.options.getString("regiao");
        const url = `https://likes.ffgarena.cloud/api/v2/likes?uid=${uid}&amount_of_likes=100&auth=${FF_API_KEY}&region=${region}`;
        for (let i = 0; i < 2; i++) {
          try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.status !== 200) {
              await interaction.editReply({ content: "Não foi possível enviar likes, UID inválido ou API indisponível." });
              return;
            }
            const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setLabel("Atualizações").setStyle(ButtonStyle.Link).setURL("https://discord.gg/DkabnPeFPZ"),
                  new ButtonBuilder().setLabel("Doação").setStyle(ButtonStyle.Link).setURL("https://livepix.gg/fenixlikes")
              );
            if ((data.sent && data.sent.startsWith("0")) || data.likes_depois === data.likes_antes) {
              const embed = new EmbedBuilder()
                .setTitle("Limite de Likes Atingido")
                .setColor(0xFFCC00)
                .setDescription(`O jogador **${data.nickname}** já atingiu o limite máximo de likes por hoje.`)
                .addFields(
                  { name: "Nickname", value: data.nickname, inline: true },
                  { name: "Likes Atuais", value: `${data.likes_depois}`, inline: true }
                )
                .setFooter({ text: `Pedido por ${interaction.user.tag}` });
              await interaction.editReply({ embeds: [embed], components: [row] });
            } else {
              const embed = new EmbedBuilder()
                .setTitle("Sucesso!")
                .setColor(0x57F287)
                .setDescription(`Foram enviados likes para o jogador **${data.nickname}**.`)
                .addFields(
                  { name: "Região", value: data.region.toUpperCase(), inline: true },
                  { name: "Level", value: `${data.level}`, inline: true },
                  { name: "Experiência", value: `${data.exp}`, inline: true },
                  { name: "Likes", value: `**${data.likes_antes}** ➔ **${data.likes_depois}**`, inline: true },
                  { name: "Total Enviado", value: `+${(data.likes_depois - data.likes_antes)}`, inline: true }
                )
                .setFooter({ text: `Pedido por ${interaction.user.tag}\nCriado por Fenix Team v3.5` });
              await interaction.editReply({ embeds: [embed], components: [row] });
            }
            return;
          } catch (err) {
            if (err.message?.includes("read ECONNRESET") && i === 0) {
              log("INFO", `Comando /like falhou com ECONNRESET. Tentando novamente...`);
              continue;
            }
            if (err instanceof SyntaxError || err.type === 'invalid-json') {
              log('ERRO', `Comando /like falhou, resposta inesperada da API: ${err}`);
              await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
              return;
            }
            log("ERRO", `Comando /like falhou: ${err}`);
            await interaction.editReply({ content: "Erro ao conectar na API de likes." });
            return;
          }
        }
      }

      if(commandName === "config") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.guild.ownerId !== interaction.user.id)
          return interaction.reply({ content: "Apenas administradores podem usar.", flags: [MessageFlags.Ephemeral] });
        const cfg = configs[interaction.guild.id] ?? { welcome:{}, goodbye:{}, commandChat:"ALL" };
        const embed = new EmbedBuilder()
          .setTitle("⚙️ Configurações atuais")
          .setColor(0x5865f2)
          .addFields(
            { name: "Apelido do bot", value: interaction.guild.members.me?.nickname || client.user.username, inline: false },
            { name: "Chat de comandos", value: cfg.commandChat === "ALL" ? "Todos" : `<#${cfg.commandChat}>`, inline: false }
          )
          .setFooter({ text: "Use o menu abaixo para alterar." });
        const menu = new StringSelectMenuBuilder()
          .setCustomId("config_menu")
          .setPlaceholder("Escolha o que deseja configurar")
          .addOptions([
            { label: "Apelido do bot", value: "nickname" },
            { label: "Chat de comandos", value: "commandchat" }
          ]);
        const row = new ActionRowBuilder().addComponents(menu);
        await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
      }

      if (commandName === "buscar_nick") {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const nickname = interaction.options.getString("nickname");
        const region = interaction.options.getString("regiao");
        const url = `${MAIN_API}/api/search_by_nickname?nickname=${encodeURIComponent(nickname)}&region=${region}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (!data.success || data.count === 0) {
            return interaction.editReply({ content: "Nenhum jogador encontrado com esse nickname." });
          }
          const embed = new EmbedBuilder()
            .setTitle(`Resultados para "${nickname}" na região ${region.toUpperCase()}`)
            .setColor(0x00FF00)
            .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          data.accountBasicInfo.slice(0, 10).forEach(player => {
            embed.addFields({ name: player.nickname, value: `ID: ${player.accountId} | Level: ${player.level}`, inline: false });
          });
          await interaction.editReply({ embeds: [embed] });
        } catch (err) {
          log('ERRO', `Comando /buscar_nick falhou: ${err}`);
          if (err instanceof SyntaxError || err.type === 'invalid-json') {
            await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
          } else {
            await interaction.editReply({ content: "Ocorreu um erro ao buscar pelo nickname." });
          }
        }
      }

      if (commandName === "buscar_guilda") {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const guildId = interaction.options.getString("id");
        const region = interaction.options.getString("regiao");
        const url = `${MAIN_API}/api/search_guild_id?id=${guildId}&region=${region}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (!data.success) {
            return interaction.editReply({ content: "Guilda não encontrada ou ID inválido." });
          }
          const guild = data.clanInfo;
          const embed = new EmbedBuilder()
            .setTitle(`Informações da Guilda: ${guild.clanName}`)
            .setColor(0xFFA500)
            .addFields(
              { name: "Nome", value: guild.clanName, inline: true },
              { name: "ID", value: guild.clanId, inline: true },
              { name: "Região", value: guild.region.toUpperCase(), inline: true },
              { name: "Level", value: `${guild.level}`, inline: true },
              { name: "Membros", value: `${guild.membersCount}`, inline: true },
              { name: "Descrição", value: guild.description || "Sem descrição", inline: false }
            )
            .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          await interaction.editReply({ embeds: [embed] });
        } catch (err) {
          log('ERRO', `Comando /buscar_guilda falhou: ${err}`);
          if (err instanceof SyntaxError || err.type === 'invalid-json') {
            await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
          } else {
            await interaction.editReply({ content: "Ocorreu um erro ao buscar a guilda." });
          }
        }
      }

      if (commandName === "verificar_ban") {
          await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
          const uid = interaction.options.getString("id");
          const url = `${MAIN_API}/api/check_ban?id=${uid}`;
          try {
              const res = await fetch(url);
              const data = await res.json();
              if (data.message !== "OK" || !data.details) {
                  return interaction.editReply({ content: "Não foi possível verificar o banimento. UID inválido?" });
              }
              const details = data.details;
              const isBanned = details.is_banned.toLowerCase() !== 'no';
              const embed = new EmbedBuilder()
                  .setTitle(`Verificação de Banimento para o ID: ${uid}`)
                  .setColor(isBanned ? 0xFF0000 : 0x00FF00)
                  .addFields(
                      { name: "Nickname", value: details.PlayerNickname, inline: true },
                      { name: "Região", value: details.PlayerRegion, inline: true },
                      { name: "Status", value: isBanned ? "Banido" : "Não Banido", inline: true }
                  )
                  .setFooter({ text: `Pedido por ${interaction.user.tag}` });
              if(isBanned && details.banned_period > 0){
                  embed.addFields({ name: "Período", value: `${details.banned_period} dias`, inline: true });
              }
              await interaction.editReply({ embeds: [embed] });
          } catch (err) {
              log('ERRO', `Comando /verificar_ban falhou: ${err}`);
              if (err instanceof SyntaxError || err.type === 'invalid-json') {
                  await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
              } else {
                  await interaction.editReply({ content: "Ocorreu um erro ao verificar o banimento." });
              }
          }
      }

      if(commandName === "estatisticas") {
          await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
          const uid = interaction.options.getString("id");
          const region = interaction.options.getString("regiao");
          const mode = interaction.options.getString("modo");
          const url = `${MAIN_API}/api/stats?id=${uid}&region=${region}&mode=${mode}`;
          try {
              const res = await fetch(url);
              const data = await res.json();
              if (!data.results) {
                  return interaction.editReply({ content: "Não foram encontradas estatísticas para este jogador." });
              }
              const modeKey = `${mode.toUpperCase()}_RANKED`;
              const stats = data.results[modeKey];
              if(!stats){
                   return interaction.editReply({ content: `Não foram encontradas estatísticas para o modo ${mode.toUpperCase()} Rankeado.` });
              }
              const embed = new EmbedBuilder()
                  .setTitle(`Estatísticas de ${uid} - ${mode.toUpperCase()} Rankeado`)
                  .setColor(0x00BFFF)
                  .addFields(
                      { name: "Partidas", value: `${stats.Games || 0}`, inline: true },
                      { name: "Vitórias", value: `${stats.Wins || 0}`, inline: true },
                      { name: "Win Rate", value: `${stats.WinRate || "0.00%"}`, inline: true },
                      { name: "Abates", value: `${stats.Eliminations || 0}`, inline: true },
                      { name: "Mortes", value: `${stats.Deaths || 0}`, inline: true },
                      { name: "K/D Ratio", value: `${stats.KdRatio || "0.00"}`, inline: true },
                      { name: "Headshots", value: `${stats.Headshots || 0}`, inline: true },
                      { name: "HS Rate", value: `${stats.HeadshotRate || "0.00%"}`, inline: true },
                      { name: "MVPs", value: `${stats.MVP || 0}`, inline: true }
                  )
                  .setFooter({ text: `Pedido por ${interaction.user.tag}` });
              await interaction.editReply({ embeds: [embed] });
          } catch (err) {
              log('ERRO', `Comando /estatisticas falhou: ${err}`);
              if (err instanceof SyntaxError || err.type === 'invalid-json') {
                  await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
              } else {
                  await interaction.editReply({ content: "Ocorreu um erro ao buscar as estatísticas." });
              }
          }
      }

      if (commandName === "mapa_craft") {
          await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
          const mapCode = interaction.options.getString("codigo");
          const region = interaction.options.getString("regiao");
          const url = `${MAIN_API}/api/craftland?map_code=${mapCode}&region=${region}`;
          try {
              const res = await fetch(url);
              const data = await res.json();
              if (!data.success) {
                  return interaction.editReply({ content: "Mapa não encontrado ou código inválido." });
              }
              const map = data.workshopInfo;
              const updateDateTime = new Date(map.updateTime * 1000).toLocaleString("pt-BR");
              const description = map.workshopDescription === "No description" ? "Sem descrição" : map.workshopDescription;
              const embed = new EmbedBuilder()
                  .setTitle(`Informações do Mapa: ${map.workshopName}`)
                  .setColor(0x8A2BE2)
                  .setThumbnail(map.mapCoverUrl)
                  .addFields(
                      { name: "Código do Mapa", value: map.mapCode, inline: true },
                      { name: "Autor", value: map.authorName, inline: true },
                      { name: "ID do Autor", value: map.authorId, inline: true },
                      { name: "Likes", value: `${map.likeCount}`, inline: true },
                      { name: "Jogadores Atuais", value: `${map.peoplePlayingNow}`, inline: true },
                      { name: "Modo de Jogo", value: `${map.gameMode}`, inline: true },
                      { name: "Duração da Partida", value: `${map.matchDuration} min`, inline: true },
                      { name: "Data de Atualização", value: updateDateTime, inline: true },
                      { name: "Descrição", value: description, inline: false }
                  )
                  .setFooter({ text: `Pedido por ${interaction.user.tag}` });
              await interaction.editReply({ embeds: [embed] });
          } catch (err) {
              log('ERRO', `Comando /mapa_craft falhou: ${err}`);
              if (err instanceof SyntaxError || err.type === 'invalid-json') {
                  await interaction.editReply({ content: "Meu Sistema retornou algo que eu nao esperava!" });
              } else {
                  await interaction.editReply({ content: "Ocorreu um erro ao buscar o mapa." });
              }
          }
      }

      if (commandName === 'avatar') {
          const user = interaction.options.getUser('usuario') || interaction.user;
          const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });
          const embed = new EmbedBuilder()
              .setTitle(`Avatar de ${user.username}`)
              .setImage(avatarURL)
              .setColor(0x00FFAA)
              .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          await interaction.reply({ embeds: [embed] });
      }


      if (commandName === 'infouser') {
          const member = interaction.options.getMember('usuario') || interaction.member;
          const user = member.user;

          if (!member) {
              return interaction.reply({ content: 'Não foi possível encontrar este usuário no servidor.', ephemeral: true });
          }

          const roles = member.roles.cache
              .sort((a, b) => b.position - a.position)
              .map(role => role.toString())
              .slice(0, -1);

          const embed = new EmbedBuilder()
              .setTitle(`Informações de ${user.username}`)
              .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
              .setColor(0x00FFFF)
              .addFields(
                  { name: 'Tag', value: user.tag, inline: true },
                  { name: 'ID', value: user.id, inline: true },
                  { name: 'Apelido', value: member.nickname || 'Nenhum', inline: true },
                  { name: 'Entrou no servidor em', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false },
                  { name: 'Conta criada em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: false },
                  { name: 'Cargos', value: roles.length > 0 ? roles.join(', ') : 'Nenhum', inline: false }
              )
              .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'infoserver') {
          const guild = interaction.guild;
          const owner = await guild.fetchOwner();
          const embed = new EmbedBuilder()
              .setTitle(`Informações do Servidor: ${guild.name}`)
              .setThumbnail(guild.iconURL({ dynamic: true }))
              .setColor(0xFFFF00)
              .addFields(
                  { name: 'Nome do Servidor', value: guild.name, inline: true },
                  { name: 'ID do Servidor', value: guild.id, inline: true },
                  { name: 'Dono', value: owner.user.tag, inline: true },
                  { name: 'Membros', value: `${guild.memberCount}`, inline: true },
                  { name: 'Canais de Texto', value: `${guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
                  { name: 'Canais de Voz', value: `${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true },
                  { name: 'Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false }
              )
              .setFooter({ text: `Pedido por ${interaction.user.tag}` });
          await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'balance') {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const econ = getEcon(interaction.guild.id, user.id);
        const embed = new EmbedBuilder()
          .setTitle(`Saldo de ${user.username}`)
          .setDescription(`Você tem **${econ.balance}** Lamux.`)
          .setColor(0x00FF00);
        await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'daily') {
        const econ = getEcon(interaction.guild.id, interaction.user.id);
        const now = Date.now();
        const dailyCooldown = 24 * 60 * 60 * 1000;
        if (econ.lastDaily && now - econ.lastDaily < dailyCooldown) {
          const timeLeft = dailyCooldown - (now - econ.lastDaily);
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          return interaction.reply({ content: `Você já coletou seus Lamux diários. Volte em ${hours}h ${minutes}m.`, ephemeral: true });
        }
        const dailyAmount = 200;
        econ.balance += dailyAmount;
        econ.lastDaily = now;
        saveEconomy();
        await interaction.reply({ content: `Você coletou **${dailyAmount}** Lamux!` });
      }

      if (commandName === 'pay') {
        const targetUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('quantidade');
        if (amount <= 0) {
          return interaction.reply({ content: "A quantidade deve ser um número positivo.", ephemeral: true });
        }
        const authorEcon = getEcon(interaction.guild.id, interaction.user.id);
        if (authorEcon.balance < amount) {
          return interaction.reply({ content: "Você não tem Lamux suficiente para fazer esta transferência.", ephemeral: true });
        }
        const targetEcon = getEcon(interaction.guild.id, targetUser.id);
        authorEcon.balance -= amount;
        targetEcon.balance += amount;
        saveEconomy();
        await interaction.reply({ content: `Você enviou **${amount}** Lamux para ${targetUser.username}.` });
      }

      if (commandName === 'leaderboard') {
        const guildEcon = economy[interaction.guild.id];
        if (!guildEcon) {
          return interaction.reply({ content: "Ninguém neste servidor tem Lamux ainda.", ephemeral: true });
        }
        const sorted = Object.entries(guildEcon).sort(([, a], [, b]) => b.balance - a.balance).slice(0, 10);
        const embed = new EmbedBuilder()
          .setTitle("🏆 Leaderboard de Lamux")
          .setColor(0xFFFF00);
        let description = "";
        for (let i = 0; i < sorted.length; i++) {
          const [userId, data] = sorted[i];
          const user = await client.users.fetch(userId);
          description += `${i + 1}. ${user.username} - **${data.balance}** Lamux\n`;
        }
        if (!description) {
          description = "Ninguém neste servidor tem Lamux ainda.";
        }
        embed.setDescription(description);
        await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'roubar') {
          const targetUser = interaction.options.getUser('usuario');
          const targetEconCheck = getEcon(interaction.guild.id, targetUser.id);
          if (targetEconCheck.protectionEnds && Date.now() < targetEconCheck.protectionEnds) {
              return interaction.reply({ content: `${targetUser.username} tem proteção anti-roubo ativa!`, ephemeral: true });
          }
          const authorEcon = getEcon(interaction.guild.id, interaction.user.id);
          const targetEcon = getEcon(interaction.guild.id, targetUser.id);
          const now = Date.now();
          const robCooldown = 60 * 60 * 1000;

          if (authorEcon.lastRob && now - authorEcon.lastRob < robCooldown) {
              const timeLeft = robCooldown - (now - authorEcon.lastRob);
              const minutes = Math.floor(timeLeft / (1000 * 60));
              return interaction.reply({ content: `Você precisa esperar mais ${minutes} minutos para roubar novamente.`, ephemeral: true });
          }

          authorEcon.lastRob = now;

          if (targetUser.id === interaction.user.id) {
              return interaction.reply({ content: "Você não pode roubar de si mesmo!", ephemeral: true });
          }

          if (targetEcon.balance < 100) {
              return interaction.reply({ content: `${targetUser.username} não tem Lamux suficiente para ser roubado.`, ephemeral: true });
          }

          const successChance = 0.4;
          if (Math.random() < successChance) {
              const amountStolen = Math.floor(targetEcon.balance * 0.1);
              authorEcon.balance += amountStolen;
              targetEcon.balance -= amountStolen;
              saveEconomy();
              await interaction.reply({ content: `Você roubou **${amountStolen}** Lamux de ${targetUser.username}!` });
          } else {
              const fine = Math.floor(authorEcon.balance * 0.05);
              authorEcon.balance -= fine;
              saveEconomy();
              await interaction.reply({ content: `Você falhou em roubar ${targetUser.username} e perdeu **${fine}** Lamux como multa!` });
          }
      }

      if (commandName === 'kiss') {
        const targetUser = interaction.options.getUser('usuario');
        const embed = new EmbedBuilder()
          .setColor(0xFFC0CB)
          .setDescription(`${interaction.user.username} beijou ${targetUser.username}!`)
          .setImage("https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif");
        await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'hug') {
        const targetUser = interaction.options.getUser('usuario');
        const embed = new EmbedBuilder()
          .setColor(0x9932CC)
          .setDescription(`${interaction.user.username} abraçou ${targetUser.username}!`)
          .setImage("https://media.giphy.com/media/lrr9rHuoJOE0w/giphy.gif");
        await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'marry') {
        const targetUser = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;

        if (!interactions[guildId]) interactions[guildId] = { marriages: {} };
        const marriages = interactions[guildId].marriages;

        if (marriages[interaction.user.id] || Object.values(marriages).includes(interaction.user.id)) {
          return interaction.reply({ content: "Você já está casado!", ephemeral: true });
        }
        if (marriages[targetUser.id] || Object.values(marriages).includes(targetUser.id)) {
          return interaction.reply({ content: `${targetUser.username} já está casado(a)!`, ephemeral: true });
        }

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('marry_accept').setLabel('Aceitar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('marry_decline').setLabel('Recusar').setStyle(ButtonStyle.Danger)
          );

        const proposal = await interaction.reply({
          content: `${targetUser}, ${interaction.user.username} está te pedindo em casamento! Você aceita?`,
          components: [row]
        });

        const collector = proposal.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
          if (i.user.id !== targetUser.id) {
            return i.reply({ content: "Este pedido não é para você!", ephemeral: true });
          }

          if (i.customId === 'marry_accept') {
            marriages[interaction.user.id] = targetUser.id;
            saveInteractions();
            await i.update({ content: `Parabéns! ${interaction.user.username} e ${targetUser.username} agora estão casados! 🎉`, components: [] });
          } else {
            await i.update({ content: "O pedido de casamento foi recusado.", components: [] });
          }
          collector.stop();
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            interaction.editReply({ content: "O pedido de casamento expirou.", components: [] });
          }
        });
      }

      if (commandName === 'divorce') {
          const guildId = interaction.guild.id;
          if (!interactions[guildId] || !interactions[guildId].marriages) {
              return interaction.reply({ content: "Você não está casado.", ephemeral: true });
          }
          const marriages = interactions[guildId].marriages;
          const authorId = interaction.user.id;
          let partnerId = null;

          if (marriages[authorId]) {
              partnerId = marriages[authorId];
              delete marriages[authorId];
          } else {
              const entry = Object.entries(marriages).find(([, v]) => v === authorId);
              if (entry) {
                  partnerId = entry[0];
                  delete marriages[partnerId];
              }
          }

          if (partnerId) {
              saveInteractions();
              await interaction.reply({ content: "Você se divorciou com sucesso." });
          } else {
              await interaction.reply({ content: "Você não está casado.", ephemeral: true });
          }
      }

      if (commandName === 'work') {
          const econ = getEcon(interaction.guild.id, interaction.user.id);
          const now = Date.now();
          const workCooldown = 60 * 60 * 1000;
          if (econ.lastWork && now - econ.lastWork < workCooldown) {
              const timeLeft = workCooldown - (now - econ.lastWork);
              const minutes = Math.floor(timeLeft / (1000 * 60));
              return interaction.reply({ content: `Você precisa esperar mais ${minutes} minutos para trabalhar novamente.`, ephemeral: true });
          }
          const workAmount = Math.floor(Math.random() * 41) + 10;
          econ.balance += workAmount;
          econ.lastWork = now;
          saveEconomy();
          await interaction.reply({ content: `Você trabalhou e ganhou **${workAmount}** Lamux!` });
      }

      if (commandName === 'slap') {
          const targetUser = interaction.options.getUser('usuario');
          const embed = new EmbedBuilder()
              .setColor(0xFF0000)
              .setDescription(`${interaction.user.username} deu um tapa em ${targetUser.username}!`)
              .setImage("https://c.tenor.com/2c0hVmgR-l0AAAAC/anime-slap.gif");
          await interaction.reply({ embeds: [embed] });
      }

      if (commandName === 'meme') {
          await interaction.deferReply();
          try {
              const res = await fetch("https://www.reddit.com/r/memes/hot.json?limit=100");
              const text = await res.text();
              if (!res.ok) {
                  return await interaction.editReply({ content: "Não foi possível buscar memes no momento." });
              }
              const data = JSON.parse(text);
              const posts = data.data.children.filter(post => post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png') || post.data.url.endsWith('.gif'));
              if (posts.length === 0) {
                  return await interaction.editReply({ content: "Não encontrei nenhum meme agora. Tente novamente." });
              }
              const meme = posts[Math.floor(Math.random() * posts.length)].data;
              const embed = new EmbedBuilder()
                  .setTitle(meme.title)
                  .setURL(`https://reddit.com${meme.permalink}`)
                  .setImage(meme.url)
                  .setColor(0xFF4500)
                  .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments}` });
              await interaction.editReply({ embeds: [embed] });
          } catch (err) {
              log('ERRO', `Comando /meme falhou: ${err}`);
              await interaction.editReply({ content: "Ocorreu um erro ao buscar o meme. A resposta do Reddit pode não ser um JSON válido." });
          }
      }

      if (commandName === 'add-money') {
          if (interaction.user.id !== BOT_OWNER_ID) {
              return interaction.reply({ content: "Este comando é apenas para o dono do bot.", ephemeral: true });
          }
          const targetUser = interaction.options.getUser('usuario');
          const amount = interaction.options.getInteger('quantidade');
          if (amount <= 0) {
              return interaction.reply({ content: "A quantidade deve ser um número positivo.", ephemeral: true });
          }
          const targetEcon = getEcon(interaction.guild.id, targetUser.id);
          targetEcon.balance += amount;
          saveEconomy();
          await interaction.reply({ content: `Adicionado **${amount}** Lamux para ${targetUser.username}.` });
      }

      if (commandName === 'loja') {
          const embed = new EmbedBuilder()
              .setTitle("Loja de Itens")
              .setColor(0x0099FF)
              .addFields(
                  { name: "Proteção Anti-Roubo (15 dias)", value: "Custo: 1000 Lamux", inline: false },
                  { name: "Conta Nível 15 com Troca de Nick", value: "Custo: 20000 Lamux", inline: false }
              );

          const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setCustomId('buy_protection').setLabel('Comprar Proteção').setStyle(ButtonStyle.Primary),
                  new ButtonBuilder().setCustomId('buy_account').setLabel('Comprar Conta').setStyle(ButtonStyle.Success)
              );

          await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
      }

      if (commandName === 'add-stock') {
          if (interaction.user.id !== BOT_OWNER_ID) {
              return interaction.reply({ content: "Este comando é apenas para o dono do bot.", ephemeral: true });
          }
          const modal = new ModalBuilder()
              .setCustomId('add_stock_modal')
              .setTitle('Adicionar Contas ao Estoque')
              .addComponents(
                  new ActionRowBuilder().addComponents(
                      new TextInputBuilder()
                          .setCustomId('stock_input')
                          .setLabel("Contas (uma por linha, formato ID:TOKEN)")
                          .setStyle(TextInputStyle.Paragraph)
                          .setRequired(true)
                  )
              );
          await interaction.showModal(modal);
      }

      if (commandName === 'donate') {
          const embed = new EmbedBuilder()
              .setTitle("Apoie o Bot!")
              .setDescription("Gostou do bot? Considere fazer uma doação para ajudar a manter o projeto online!")
              .setColor(0x00FF00);
          const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder().setLabel("Fazer Doação").setStyle(ButtonStyle.Link).setURL("https://livepix.gg/fenixlikes")
              );
          await interaction.reply({ embeds: [embed], components: [row] });
      }
};