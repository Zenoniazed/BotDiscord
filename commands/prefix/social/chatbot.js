const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../../cache/chatbot_config.json");

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: true }, null, 2));
  }
  return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  name: "chatbot",
  description: "Bật/tắt chatbot trò chuyện",
  adminOnly: true,

  async execute(message, args) {
    const config = loadConfig();
    if (args[0] === "on") {
      config.enabled = true;
      saveConfig(config);
      return message.reply("✅ Chatbot đã **bật**.");
    }
    if (args[0] === "off") {
      config.enabled = false;
      saveConfig(config);
      return message.reply("❌ Chatbot đã **tắt**.");
    }
    return message.reply("⚙️ Dùng: `!chatbot on` hoặc `!chatbot off`");
  }
};
