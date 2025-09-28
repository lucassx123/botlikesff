import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { TOKEN } from "./src/config.js";
import { registerCommands } from "./src/commands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.GuildMember]
});

registerCommands();

const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
    import(`file://${filePath}`).then((eventModule) => {
        const event = eventModule.default;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    });
}

client.login(TOKEN);