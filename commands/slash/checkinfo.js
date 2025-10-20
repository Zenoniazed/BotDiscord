const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  adminOnly: false,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("checkinfo")
    .setDescription("Xem thông tin cá nhân của một thành viên")
    .addUserOption(opt =>
      opt.setName("target").setDescription("Thành viên cần xem").setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target") || interaction.member;

    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.toString())
      .join(", ") || "Không có";

    const embed = new EmbedBuilder()
      .setTitle(`📌 Thông tin của ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Username", value: member.user.username, inline: true },
        { name: "🆔 User ID", value: member.id, inline: true },
        { name: "📅 Tạo tài khoản", value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>` },
        { name: "📥 Tham gia server", value: `<t:${Math.floor(member.joinedTimestamp/1000)}:R>` },
        { name: "🎭 Vai trò", value: roles },
        { name: "🤖 Bot?", value: member.user.bot ? "✅ Có" : "❌ Không", inline: true }
      )
      .setColor("#00AAFF")
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
