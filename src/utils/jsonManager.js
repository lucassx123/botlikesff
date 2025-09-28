import fs from "fs";

const loadJson = (filePath, defaultValue) => {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        if (fileContent) {
            try {
                return JSON.parse(fileContent);
            } catch (error) {
                console.error(`Error parsing JSON from ${filePath}:`, error);
                return defaultValue;
            }
        }
    }
    return defaultValue;
};

const saveJson = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const configs = loadJson("./json/configs.json", {});
export const economy = loadJson("./json/economy.json", {});
export const interactions = loadJson("./json/interactions.json", {});
export const maintenanceConfig = loadJson("./json/maintenance.json", {});
export const stock = loadJson("./json/stock.json", []);

export const saveConfigs = () => saveJson("./json/configs.json", configs);
export const saveEconomy = () => saveJson("./json/economy.json", economy);
export const saveInteractions = () => saveJson("./json/interactions.json", interactions);
export const saveMaintenanceConfig = () => saveJson("./json/maintenance.json", maintenanceConfig);
export const saveStock = () => saveJson("./json/stock.json", stock);

export function getEcon(guildId, userId) {
    if (!economy[guildId]) {
        economy[guildId] = {};
    }
    if (!economy[guildId][userId]) {
        economy[guildId][userId] = {
            balance: 0,
            lastDaily: null,
            lastRob: null,
            lastWork: null,
            protectionEnds: null
        };
    }
    return economy[guildId][userId];
}