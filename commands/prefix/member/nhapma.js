const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const referralPath = path.join(__dirname, "../../../cache/referrals.json");
const pointsPath = path.join(__dirname, "../../../cache/points.json");

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(def, null, 2));
  return JSON.parse(fs.readFileSync(file));
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "nhapma",
  description: "Nhập mã giới thiệu",
  async execute(message, args) {
    // ✅ kiểm tra kênh
    if (!config.referralEnterChannelIds.includes(message.channel.id)) {
      const channelMention = config.referralEnterChannelIds
        .map(id => `<#${id}>`)
        .join(", ");
      return message.reply(
        `❌ Lệnh này chỉ được dùng trong kênh ${channelMention}`
      );
    }

    const code = args[0];
    if (!code) return message.reply("❌ Hãy nhập mã hợp lệ.");

    const referrals = loadJSON(referralPath);
    const points = loadJSON(pointsPath);

    const referral = referrals[code];
    if (!referral) return message.reply("❌ Mã này không tồn tại.");
    if (referral.owner === message.author.id)
      return message.reply("❌ Bạn không thể nhập mã của chính mình.");

    // 🚫 Kiểm tra xem user đã nhập bất kỳ mã nào chưa
    for (const c in referrals) {
      if (referrals[c].users.includes(message.author.id)) {
        return message.reply("❌ Bạn đã nhập một mã giới thiệu trước đó, không thể nhập thêm.");
      }
    }

    // Nếu chưa từng nhập mã nào thì cho phép
    referral.users.push(message.author.id);

    if (!points[referral.owner]) points[referral.owner] = 0;
    points[referral.owner] += 1; // cộng điểm cho chủ mã

    saveJSON(referralPath, referrals);
    saveJSON(pointsPath, points);

    return message.reply(
      `✅ Bạn đã nhập mã **${code}**. Chủ mã <@${referral.owner}> được +1 điểm!`
    );
  }
};
