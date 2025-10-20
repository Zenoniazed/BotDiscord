const { deleteMute } = require("../../../utils/muteStorage");

module.exports = {
  name: "unmute",
  description: "Unmute một thành viên",
  adminOnly: true,
  modOnly: true,

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Hãy tag người cần unmute.");

    const mutedRole = message.guild.roles.cache.find(r => r.name === "Muted");
    if (!mutedRole) return message.reply("⚠️ Role Muted chưa tồn tại!");

    await member.roles.remove(mutedRole);
    deleteMute(member.id);

    message.reply(`✅ ${member.user.tag} đã được unmute`);
  },
};
