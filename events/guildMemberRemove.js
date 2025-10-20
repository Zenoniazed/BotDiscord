// events/guildMemberRemove.js
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Đường dẫn file JSON
const referralPath = path.join(__dirname, "../cache/referrals.json");
const pointsPath = path.join(__dirname, "../cache/points.json");

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(def, null, 2));
  return JSON.parse(fs.readFileSync(file));
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    // === Kênh thông báo rời server ===
    const leaveChannels = [
      "1414282115427602473"
    ];

    // === Kênh log referral ===
    const logChannels = [
      "1414279705749880872" // kênh log
    ];

    // Embed thông báo rời server
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("👋 Thành viên rời server")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `😢 **${member.user.username}** đã rời khỏi **${member.guild.name}**.\n` +
        `Hiện server còn **${member.guild.memberCount}** thành viên.`
      )
      .setImage("https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnU4czRrNzFvYXo1MXUwaXd4MzBuM3UwN3I1YjBuajJyMzhmOTh6dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TRgyI2f0hRHBS/giphy.gif")
      .setFooter({
        text: "Hy vọng sẽ có ngày gặp lại 💔",
        iconURL: member.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    // Gửi thông báo rời
    for (const id of leaveChannels) {
      const channel = member.guild.channels.cache.get(id);
      if (channel) channel.send({ embeds: [embed] });
    }

    // === Trừ điểm referral nếu thành viên rời server ===
    const referrals = loadJSON(referralPath);
    const points = loadJSON(pointsPath);

    for (const code in referrals) {
      const ref = referrals[code];
      if (ref.users.includes(member.id)) {
        ref.users = ref.users.filter(u => u !== member.id);

        let deducted = 1; // số điểm trừ
        if (points[ref.owner]) {
          points[ref.owner] -= deducted;
          if (points[ref.owner] < 0) points[ref.owner] = 0;
        }

        saveJSON(referralPath, referrals);
        saveJSON(pointsPath, points);

        // Gửi log referral
        for (const id of logChannels) {
          const channel = member.guild.channels.cache.get(id);
          if (channel) {
            const logEmbed = new EmbedBuilder()
              .setColor(0xffa500)
              .setTitle("📉 Điểm bị trừ do referral")
              .setDescription(
                `❌ **${member.user.tag}** đã rời server.\n` +
                `🔗 Chủ mã: <@${ref.owner}> bị trừ **${deducted}** điểm.\n` +
                `🏆 Điểm hiện tại: **${points[ref.owner] || 0}**`
              )
              .setTimestamp();

            channel.send({ embeds: [logEmbed] });
          }
        }

        console.log(`📉 Đã trừ ${deducted} điểm của ${ref.owner} vì ${member.user.tag} rời server`);
        break;
      }
    }

    console.log(`❌ ${member.user.tag} đã rời khỏi server ${member.guild.name}`);
  },
};
