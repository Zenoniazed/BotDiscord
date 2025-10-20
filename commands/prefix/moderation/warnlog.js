const fs = require("fs");
const path = require("path");

const warnFile = path.join(__dirname, "../../cache/warns.json");

function loadWarns() {
  if (!fs.existsSync(warnFile)) return {};
  return JSON.parse(fs.readFileSync(warnFile));
}

module.exports = {
  name: "warnlog",
  description: "Xem lịch sử cảnh cáo của một thành viên",
  adminOnly: true,
  async execute(message) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Hãy tag thành viên.");

    const warns = loadWarns()[member.id];
    if (!warns || warns.length === 0)
      return message.reply("✅ Thành viên này chưa có cảnh cáo nào.");

    let log = warns
      .map((w, i) => `\`${i + 1}\` • ${w.reason} (bởi <@${w.by}> - ${w.date})`)
      .join("\n");

    message.reply(`📋 Lịch sử cảnh cáo của **${member.user.tag}**:\n${log}`);
  }
};
