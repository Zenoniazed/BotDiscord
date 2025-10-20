const { AttachmentBuilder } = require("discord.js");
const { generateRankCard } = require("../../../utils/rankCard");
const fs = require("fs");
const path = require("path");

function getXpNeeded(level) {
  return 100 * level;
}

function loadXpData() {
  const filePath = path.join(__dirname, "../../../cache/levels.json");
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = {
  name: "level",
  description: "Xem cấp bậc và kinh nghiệm của bạn",
  async execute(message) {
    const xpData = loadXpData();
    const userId = message.author.id;
    const data = xpData[userId] || { exp: 0, level: 1 };

    const level = data.level;
    const xp = data.exp;
    const xpNeeded = getXpNeeded(level);

    // Tính rank: ưu tiên level > exp
    const sorted = Object.entries(xpData).sort(([, a], [, b]) => {
      if (b.level === a.level) {
        return b.exp - a.exp;
      }
      return b.level - a.level;
    });
    const rank = sorted.findIndex(([id]) => id === userId) + 1;
    const totalUsers = sorted.length;

    const buffer = await generateRankCard(
      message.author,
      level,
      xp,
      xpNeeded,
      rank,
      totalUsers
    );
    const attachment = new AttachmentBuilder(buffer, { name: "rank.png" });

    await message.channel.send({ files: [attachment] });
  }
};
