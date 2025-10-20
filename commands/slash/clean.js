const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("clean")
    .setDescription("Xóa tin nhắn")
    .addIntegerOption(opt =>
      opt.setName("count").setDescription("Số lượng tin nhắn cần xóa (1-100)").setRequired(false)
    )
    .addUserOption(opt =>
      opt.setName("target").setDescription("Xóa tin nhắn của thành viên").setRequired(false)
    ),

  async execute(interaction) {
    const count = interaction.options.getInteger("count") || 0;
    const target = interaction.options.getMember("target");

    if (target) {
      if (!count || count < 1 || count > 100) {
        return interaction.reply({ content: "❌ Nhập số lượng hợp lệ (1-100).", ephemeral: true });
      }

      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      const userMessages = fetched.filter(m => m.author.id === target.id).first(count);

      await interaction.channel.bulkDelete(userMessages, true);
      return interaction.reply(`✅ Đã xóa ${userMessages.length} tin nhắn của ${target.user.tag}.`);
    }

    if (!count || count < 1 || count > 100) {
      return interaction.reply({ content: "❌ Nhập số lượng hợp lệ (1-100).", ephemeral: true });
    }

    await interaction.channel.bulkDelete(count, true);
    interaction.reply(`✅ Đã xóa ${count} tin nhắn!`);
  },
};
