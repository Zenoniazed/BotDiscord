const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick một thành viên")
    .addUserOption(opt =>
      opt.setName("target")
        .setDescription("Người cần kick")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    if (!member) {
      return interaction.reply({ content: "⚠️ Không tìm thấy thành viên này.", ephemeral: true });
    }

    try {
      await member.kick();
      return interaction.reply(`✅ Đã kick ${member.user.tag}`);
    } catch {
      return interaction.reply({ content: "❌ Không thể kick người này.", ephemeral: true });
    }
  },
};
