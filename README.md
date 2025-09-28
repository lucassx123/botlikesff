````markdown
# 🤖 Bot de Likes para o Discord

Um bot em **JavaScript (Node.js)**.  

[![Telegram](https://img.shields.io/badge/Telegram-Grupo-blue?logo=telegram)](https://t.me/blhuborg)

---

## 📌 Pré-requisitos

- [Node.js](https://nodejs.org/) (v16 ou superior)  
- [Git](https://git-scm.com/)  
- Conta no **Discord Developer Portal** (para pegar o token e ID do bot)  
- Uma hospedagem (**SquareCloud** ou **Discloud**) ou rodar localmente no **Termux/PC**  

---

## ⚙️ Configuração

Edite o arquivo `config.js` com suas credenciais:

```js
export const TOKEN = "SEU-TOKEN-AQUI"; // Token do bot do Discord
export const FF_API_KEY = "key-1010";  // Sua chave da API
export const CLIENT_ID = "ID-DO-BOT";  // ID do bot no Discord
export const LOGS_COMANDOS = "CHAT-LOGS-ID"; // Canal para logs de comandos
export const LOGS_ADICAO = "LOGS-BOT"; // Canal para logs de adição
export const BOT_OWNER_ID = "SEU-ID-DISCORD"; // Seu ID do Discord
export const MAIN_API = "https://freefireapis.squareweb.app"; // API principal
````

---

## 🚀 Instalação

### 🔹 Local (PC ou Termux)

```bash
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
```

---

### 🔹 SquareCloud

1. Crie uma conta em [SquareCloud](https://squarecloud.app).
2. Crie um novo projeto → escolha **Node.js**.
3. Faça upload dos arquivos (`index.js`, `package.json`, `config.js`, etc).
4. Edite o `config.js` com seu token e API Key.
5. No painel, clique em **Deploy**.
6. Inicie o bot.

---

### 🔹 Discloud

1. Instale o CLI da Discloud:

```bash
npm i -g discloud-cli
discloud login
```

2. Compacte sua pasta do bot em **.zip**.
3. Faça upload:

```bash
discloud upload seu-bot.zip
```

4. Inicie o bot no painel da Discloud.

---

## 🛠️ Comandos básicos

```bash
npm start      # inicia o bot
node index.js  # inicia manualmente
CTRL + C       # para o bot
```

```
```
