const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const filePath = path.join(__dirname, "../../../cache/referrals.json");

function loadReferrals() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");
  return JSON.parse(fs.readFileSync(filePath));
}
function saveReferrals(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function randomCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

module.exports = {
  name: "magioithieu",
  description: "Nhận mã giới thiệu duy nhất",
  async execute(message) {
    // ✅ kiểm tra kênh
    if (!config.referralGetChannelIds.includes(message.channel.id)) {
      const channelMention = config.referralGetChannelIds
        .map(id => `<#${id}>`)
        .join(", ");
      return message.reply(
        `❌ Lệnh này chỉ được dùng trong kênh ${channelMention}`
      );
    }

    const referrals = loadReferrals();
    const existing = Object.entries(referrals).find(
        ([code, obj]) => obj.owner === message.author.id
      );
      
      if (existing) {
        return message.reply(
          `❌ Bạn đã có mã giới thiệu trước đó.\n` +
          `📌 Mã của bạn là: \`${existing[0]}\``
        );
      }
      

    const code = randomCode();
    referrals[code] = { owner: message.author.id, users: [] };
    saveReferrals(referrals);

    return message.reply(
      `🎟️ Mã giới thiệu của bạn là: **${code}**\n👉 Gửi mã này cho bạn bè để họ nhập !nhapma`
    );
  }
};
