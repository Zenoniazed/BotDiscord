const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

function getAllCommands(dir, client) {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory()) {
      // Nếu là folder → duyệt tiếp
      results = results.concat(getAllCommands(filepath, client));
    } else if (file.endsWith(".js")) {
      try {
        const cmd = require(filepath);

        // Chỉ thêm nếu có name & execute
        if (cmd && cmd.name && typeof cmd.execute === "function") {
          results.push({
            name: `${client.config.prefix}${cmd.name}`,
            description: cmd.description || "Không có mô tả",
            adminOnly: cmd.adminOnly || false,
            modOnly: cmd.modOnly || false,
          });
        }
      } catch (e) {
        console.error(`❌ Không load được file ${filepath}`, e);
      }
    }
  }
  return results;
}

module.exports = {
  name: "help",
  description: "Hiện danh sách tất cả lệnh prefix",
  execute(message, args, client) {
    const baseDir = path.join(__dirname, ".."); 
    const commandList = getAllCommands(baseDir, client);

    // Chia nhóm
    const adminCmds  = commandList.filter(c => c.adminOnly);
    const modCmds    = commandList.filter(c => !c.adminOnly && c.modOnly);
    const memberCmds = commandList.filter(c => !c.adminOnly && !c.modOnly);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📜 Danh sách lệnh Prefix")
      .setDescription(`Prefix hiện tại: \`${client.config.prefix}\``)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "🔒 Lệnh Admin",
          value: adminCmds.length
            ? adminCmds.map(c => `\`${c.name}\` - ${c.description}`).join("\n")
            : "Không có"
        },
        {
          name: "🛡️ Lệnh Mod",
          value: modCmds.length
            ? modCmds.map(c => `\`${c.name}\` - ${c.description}`).join("\n")
            : "Không có"
        },
        {
          name: "✨ Lệnh cho Member",
          value: memberCmds.length
            ? memberCmds.map(c => `\`${c.name}\` - ${c.description}`).join("\n")
            : "Không có"
        }
      )
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
