const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../cache/chatdb.json");
const configPath = path.join(__dirname, "../cache/chatbot_config.json");

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "{}");
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: true }, null, 2));
  }
  return JSON.parse(fs.readFileSync(configPath));
}

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    const config = loadConfig();
    if (!config.enabled) return; // 🚫 Chatbot đang tắt thì bỏ qua

    const content = message.content.toLowerCase().trim();
    const chatdb = loadDB();

    for (const key in chatdb) {
      if (content.includes(key)) {
        const replies = chatdb[key];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        await message.reply(reply);
        break;
      }
    }
  }
};
