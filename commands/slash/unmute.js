const { SlashCommandBuilder } = require("discord.js");
const { deleteMute } = require("../../utils/muteStorage");

module.exports = {
  adminOnly: true,
  modOnly: true,

  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Gỡ mute một thành viên")
    .addUserOption(opt =>
      opt.setName("target").setDescription("Người cần unmute").setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    if (!member) return interaction.reply({ content: "❌ Không tìm thấy thành viên này.", ephemeral: true });

    const mutedRole = interaction.guild.roles.cache.find(r => r.name === "Muted");
    if (!mutedRole) return interaction.reply({ content: "⚠️ Role Muted chưa tồn tại!", ephemeral: true });

    await member.roles.remove(mutedRole);
    deleteMute(member.id);

    interaction.reply(`✅ ${member.user.tag} đã được unmute`);
  },
};
