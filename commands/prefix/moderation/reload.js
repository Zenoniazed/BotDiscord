const fs = require("fs");
const path = require("path");

module.exports = {
  name: "reload",
  description: "Reload một prefix command",
  adminOnly: true,
  modOnly: false,

  async execute(message, args, client) {
    if (!args[0]) return message.reply("❌ Hãy nhập tên command cần reload.");

    const commandName = args[0].toLowerCase();

    // Tìm file command
    const commandFile = findCommandFile(path.join(__dirname, ".."), commandName);
    if (!commandFile) {
      return message.reply(`❌ Không tìm thấy lệnh \`${commandName}\``);
    }

    try {
      delete require.cache[require.resolve(commandFile)];
      const newCommand = require(commandFile);

      client.prefixCommands.set(newCommand.name, newCommand);
      message.reply(`✅ Đã reload prefix command \`${commandName}\``);
    } catch (error) {
      console.error(error);
      message.reply(`❌ Lỗi khi reload lệnh \`${commandName}\``);
    }
  },
};

// Hàm tìm file trong subfolder
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
