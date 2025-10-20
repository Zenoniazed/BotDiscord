const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../../cache/points.json");

function loadPoints() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}");
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function savePoints(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "addpoint",
  description: "Cộng điểm cho thành viên: !addpoint @user <số điểm>",
  adminOnly: true,

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply("❌ Hãy tag một người để cộng điểm.");
    }

    const pointsToAdd = parseInt(args[1]);
    if (isNaN(pointsToAdd)) {
      return message.reply("❌ Hãy nhập số điểm hợp lệ.");
    }

    const data = loadPoints();
    if (!data[member.id]) {
      data[member.id] = 0;
    }

    data[member.id] += pointsToAdd;
    savePoints(data);

    return message.reply(`✅ Đã cộng **${pointsToAdd}** điểm cho ${member.user.username}. Tổng: **${data[member.id]}** điểm.`);
  }
};
