const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");

// Hàm duyệt toàn bộ file trong folder
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

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("reloadall")
    .setDescription("Reload toàn bộ slash commands (memory only)"),

  async execute(interaction, client) {
    try {
      const slashPath = path.join(__dirname, ".."); // gốc slash
      const files = getAllCommandFiles(slashPath);

      client.slashCommands.clear();
      let count = 0;

      for (const file of files) {
        try {
          delete require.cache[require.resolve(file)];
          const newCommand = require(file);
          if ("data" in newCommand) {
            client.slashCommands.set(newCommand.data.name, newCommand);
            console.log(`🔄 Reloaded: ${newCommand.data.name}`);
            count++;
          }
        } catch (err) {
          console.error(`❌ Lỗi khi reload file ${file}:`, err);
        }
      }

      await interaction.reply(`✅ Đã reload toàn bộ **${count}** slash commands (memory only).`);
    } catch (error) {
      console.error("❌ Lỗi reloadall:", error);
      if (!interaction.replied) {
        interaction.reply({ content: "❌ Lỗi khi reload tất cả slash commands.", ephemeral: true });
      }
    }
  },
};
