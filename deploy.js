const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const commands = [];

// === Hàm duyệt tất cả file .js trong folder (đệ quy) ===
function getAllCommandFiles(dir, ext = ".js") {
  let results = [];

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  });

  return results;
}

// === Lấy toàn bộ slash commands ===
const slashPath = path.join(__dirname, "commands/slash");
const slashFiles = getAllCommandFiles(slashPath);

for (const file of slashFiles) {
  const command = require(file);
  if ("data" in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🚀 Deploying ${commands.length} slash commands...`);

    if (process.env.GUILD_ID) {
      // Deploy vào 1 server test
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log("✅ Slash commands registered in test guild!");
    } else {
      // Deploy global
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log("✅ Slash commands registered globally!");
    }
  } catch (error) {
    console.error("❌ Deploy error:", error);
  }
})();
