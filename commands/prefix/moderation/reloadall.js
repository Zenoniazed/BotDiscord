const fs = require("fs");
const path = require("path");

module.exports = {
  name: "reloadall",
  description: "Reload toàn bộ prefix commands",
  adminOnly: true,
  modOnly: false,

  async execute(message, args, client) {
    try {
      const prefixPath = path.join(__dirname, ".."); // thư mục cha "prefix"
      const files = getAllCommandFiles(prefixPath);

      let count = 0;
      client.prefixCommands.clear();

      for (const file of files) {
        try {
          delete require.cache[require.resolve(file)];
          const newCommand = require(file);
          if ("name" in newCommand) {
            client.prefixCommands.set(newCommand.name, newCommand);
            count++;
          }
        } catch (err) {
          console.error(`❌ Lỗi khi reload file ${file}:`, err);
        }
      }

      message.reply(`✅ Đã reload toàn bộ **${count}** prefix commands.`);
    } catch (error) {
      console.error("❌ Lỗi reloadall:", error);
      message.reply("❌ Lỗi khi reload tất cả prefix commands.");
    }
  },
};

// Hàm duyệt toàn bộ file trong subfolder
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
