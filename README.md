# 🤖 Bot de likes para o discord

Um bot em **JavaScript (Node.js)**.  


[![Telegram](https://img.shields.io/badge/Telegram-Grupo-blue?logo=telegram)](https://t.me/blhuborg)

---

## 📌 Pré-requisitos

- [Node.js](https://nodejs.org/) (v16 ou superior)  
- [Git](https://git-scm.com/)  
- Conta no **Discord Developer Portal** (para pegar o token e ID do bot)  
- Uma hospedagem (SquareCloud ou Discloud) ou rodar localmente no Termux  

---

## ⚙️ Configuração

Abra o arquivo `config.js` e edite com as suas credenciais:

```js
export const TOKEN = "SEU-TOKEN-AQUI"; // Token do bot do Discord
export const FF_API_KEY = "key-1010"; // Sua chave da API
export const CLIENT_ID = "ID-DO-BOT"; // ID do bot no Discord
export const LOGS_COMANDOS = "CHAT-LOGS-ID"; // Canal para logs de comandos
export const LOGS_ADICAO = "LOGS-BOT"; // Canal para logs de adição
export const BOT_OWNER_ID = "SEU-ID-DISCORD"; // Seu ID do Discord
export const MAIN_API = "https://freefireapis.squareweb.app"; // API principal
🚀 Instalação
🔹 Local (Termux ou PC)
bash
Copiar código
# Atualizar pacotes
pkg update && pkg upgrade -y

# Instalar Node.js e Git
pkg install nodejs git -y

# Clonar o repositório
git clone https://github.com/lucassx123/botlikesff/

# Entrar na pasta
cd SEU-BOT

# Instalar dependências
npm install

# Iniciar o bot
node index.js
🔹 SquareCloud
Crie uma conta em SquareCloud.

Crie um novo projeto → escolha Node.js.

Faça upload do seu bot (index.js, package.json, config.js, etc).

Edite o arquivo config.js com seu token e API Key.

No painel, clique em Deploy.

Inicie o bot.

🔹 Discloud
Instale o CLI da Discloud.

bash
Copiar código
npm i -g discloud-cli
discloud login
Compacte sua pasta do bot em .zip.

Faça upload:

bash
Copiar código
discloud upload seu-bot.zip
Inicie o bot no painel da Discloud.

🛠️ Comandos básicos
npm start → inicia o bot

node index.js → inicia manualmente

CTRL + C → para o bot


Copiar código
