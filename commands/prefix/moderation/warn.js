const fs = require("fs");
const path = require("path");

const warnFile = path.join(__dirname, "../../cache/warns.json");

// Load dữ liệu
function loadWarns() {
  if (!fs.existsSync(warnFile)) return {};
  return JSON.parse(fs.readFileSync(warnFile));
}

// Lưu dữ liệu
function saveWarns(data) {
  fs.writeFileSync(warnFile, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "warn",
  description: "Cảnh cáo một thành viên",
  adminOnly: true,
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Hãy tag người cần cảnh cáo.");

    const reason = args.slice(1).join(" ") || "Không có lý do";
    const warns = loadWarns();

    if (!warns[member.id]) warns[member.id] = [];
    warns[member.id].push({
      reason,
      date: new Date().toLocaleString(),
      by: message.author.id
    });
    saveWarns(warns);

    message.reply(`⚠️ Đã cảnh cáo ${member.user.tag} | Lý do: **${reason}**`);
  }
};
