const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../../cache/economy.json");

module.exports = {
  name: "toprich",
  description: "Hiển thị top 5 người giàu nhất",
  async execute(message) {
    if (!fs.existsSync(filePath)) return message.reply("❌ Chưa có dữ liệu.");

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sorted = Object.entries(data)
      .map(([id, u]) => ({
        id,
        total: (u.wallet || 0) + (u.bank || 0),
        wallet: u.wallet || 0,
        bank: u.bank || 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    if (sorted.length === 0) return message.reply("❌ Chưa có ai có tiền.");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Top 5 Người Giàu Nhất")
      .setColor("Gold");

    let desc = "";
    for (let i = 0; i < sorted.length; i++) {
      const user = await message.client.users.fetch(sorted[i].id).catch(() => null);
      desc += `**${i + 1}. ${user ? user.username : "Unknown"}**  
💰 Ví: ${sorted[i].wallet}$ | 🏦 Bank: ${sorted[i].bank}$ | 💎 Tổng: ${sorted[i].total}$\n\n`;
    }

    embed.setDescription(desc);

    message.channel.send({ embeds: [embed] });
  },
};
