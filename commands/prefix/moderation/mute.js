const ms = require("ms");
const { loadMutes, saveMutes, deleteMute } = require("../../../utils/muteStorage");

module.exports = {
  name: "mute",
  description: "Mute một thành viên (có thể kèm thời gian)",
  adminOnly: true,
  modOnly: false,

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Hãy tag người cần mute.");

    const duration = args[1] ? ms(args[1]) : null;
    let mutedRole = message.guild.roles.cache.find(r => r.name === "Muted");

    // Nếu chưa có role Muted thì tạo mới
    if (!mutedRole) {
      mutedRole = await message.guild.roles.create({
        name: "Muted",
        color: "#555555",
        permissions: []
      });
    }

    // 🔒 Đảm bảo overwrite deny cho tất cả channel
    message.guild.channels.cache.forEach(async (channel) => {
    try {
      if (!channel.isTextBased() && !channel.isVoiceBased()) return; // bỏ qua category, forum, thread

      if (channel.permissionOverwrites) {
        await channel.permissionOverwrites.edit(mutedRole, {
          SendMessages: false,
          Speak: false,
          AddReactions: false,
        });
      }
    } catch (err) {
      console.error(`❌ Không set overwrite cho kênh ${channel.name}:`, err.message);
    }
  });


    // Add role Muted
    await member.roles.add(mutedRole);

    // Lưu lại mute
    const mutes = loadMutes();
    const expires = duration ? Date.now() + duration : null;
    mutes[member.id] = { guild: message.guild.id, expires };
    saveMutes(mutes);

    await message.reply(
      `🔇 ${member.user.tag} đã bị mute ${duration ? `trong ${args[1]}` : "vô thời hạn"}`
    );

    // Nếu có thời gian -> tự unmute
    if (duration) {
      setTimeout(async () => {
        if (member.roles.cache.has(mutedRole.id)) {
          await member.roles.remove(mutedRole);
          message.channel.send(`✅ ${member.user.tag} đã được unmute (hết thời gian)`);
        }
        deleteMute(member.id);
      }, duration);
    }
  },
};
