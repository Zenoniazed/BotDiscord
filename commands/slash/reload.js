const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");

// Hàm tìm file theo tên trong subfolder
function findCommandFile(dir, commandName, ext = ".js") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const result = findCommandFile(filePath, commandName, ext);
      if (result) return result;
    } else if (file.endsWith(ext)) {
      const name = path.basename(file, ext).toLowerCase();
      if (name === commandName) return filePath;
    }
  }
  return null;
}

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload một slash command (memory only)")
    .addStringOption(opt =>
      opt.setName("command")
        .setDescription("Tên command cần reload")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const nameOpt = interaction.options.getString("command");
    if (!nameOpt) {
      return interaction.reply({
        content: "❌ Bạn cần nhập tên lệnh để reload.",
        ephemeral: true
      });
    }
    const commandName = nameOpt.toLowerCase();

    // chỉ quét trong folder slash
    const slashPath = __dirname;
    const commandPath = findCommandFile(slashPath, commandName);

    if (!commandPath) {
      return interaction.reply({
        content: `❌ Không tìm thấy lệnh \`${commandName}\` trong slash commands.`,
        ephemeral: true
      });
    }

    try {
      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);

      if (!newCommand || !newCommand.data || !newCommand.execute) {
        return interaction.reply({
          content: `❌ File \`${commandName}\` không hợp lệ (thiếu data hoặc execute).`,
          ephemeral: true
        });
      }

      client.slashCommands.set(newCommand.data.name, newCommand);
      console.log(`🔄 Reloaded: ${newCommand.data.name} (${commandPath})`);

      interaction.reply(`✅ Đã reload slash command \`${commandName}\` (memory only).`);
    } catch (error) {
      console.error("❌ Lỗi khi reload:", error);
      interaction.reply({
        content: `❌ Lỗi khi reload \`${commandName}\`.`,
        ephemeral: true
      });
    }
  },
};
