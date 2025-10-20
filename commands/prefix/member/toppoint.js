const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const filePath = path.join(__dirname, "../../../cache/points.json");

function loadPoints() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}");
  }
  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = {
  name: "toppoint",
  description: "Xem top bảng xếp hạng point",
  adminOnly: false,

  async execute(message) {
    const data = loadPoints();

    // Chuyển dữ liệu thành mảng
    const sorted = Object.entries(data)
      .sort((a, b) => b[1] - a[1]) // sắp xếp giảm dần theo điểm
      .slice(0, 10); // lấy top 10

    if (sorted.length === 0) {
      return message.reply("❌ Hiện chưa có ai có điểm.");
    }

    let desc = "";
    for (let i = 0; i < sorted.length; i++) {
      const [userId, points] = sorted[i];
      const member = await message.guild.members.fetch(userId).catch(() => null);
      const name = member ? member.user.username : `Người dùng ${userId}`;
      desc += `**${i + 1}. ${name}** — ${points} điểm\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("🏆 Bảng xếp hạng Point")
      .setDescription(desc)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
