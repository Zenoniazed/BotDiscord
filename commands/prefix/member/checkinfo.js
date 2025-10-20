const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "checkinfo",
  description: "Xem thông tin cá nhân của một thành viên",
  adminOnly: false,
  modOnly: false,

  async execute(message, args) {
    const member = message.mentions.members.first() || message.member;

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .map(r => r.toString())
      .join(", ") || "Không có";

    const embed = new EmbedBuilder()
      .setTitle(`📌 Thông tin của ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Username", value: member.user.username, inline: true },
        { name: "🆔 User ID", value: member.id, inline: true },
        { name: "📅 Tạo tài khoản", value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: false },
        { name: "📥 Tham gia server", value: `<t:${Math.floor(member.joinedTimestamp/1000)}:R>`, inline: false },
        { name: "🎭 Vai trò", value: roles, inline: false },
        { name: "🤖 Bot?", value: member.user.bot ? "✅ Có" : "❌ Không", inline: true }
      )
      .setColor("#00AAFF")
      .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
