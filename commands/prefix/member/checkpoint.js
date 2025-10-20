const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../../cache/points.json");

function loadPoints() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}");
  }
  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = {
  name: "checkpoint",
  description: "Xem điểm của bạn hoặc người khác: !point [@user]",
  adminOnly: false,

  async execute(message) {
    const member = message.mentions.members.first() || message.member;
    const data = loadPoints();
    const points = data[member.id] || 0;

    return message.reply(`🏆 ${member.user.username} hiện có **${points}** điểm.`);
  }
};
