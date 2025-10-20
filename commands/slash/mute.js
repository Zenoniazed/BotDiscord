const { SlashCommandBuilder } = require("discord.js");
const ms = require("ms");
const { loadMutes, saveMutes, deleteMute } = require("../../utils/muteStorage");

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute một thành viên (có thể kèm thời gian)")
    .addUserOption(opt =>
      opt.setName("target").setDescription("Người cần mute").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("duration").setDescription("Thời gian mute, ví dụ: 10m, 1h, 1d")
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    const timeStr = interaction.options.getString("duration");
    const duration = timeStr ? ms(timeStr) : null;

    if (!member) return interaction.reply({ content: "❌ Không tìm thấy thành viên này.", ephemeral: true });

    let mutedRole = interaction.guild.roles.cache.find(r => r.name === "Muted");
    if (!mutedRole) {
      mutedRole = await interaction.guild.roles.create({
        name: "Muted",
        color: "#555555",
        permissions: []
      });

      for (const channel of interaction.guild.channels.cache.values()) {
        await channel.permissionOverwrites.create(mutedRole, {
          SendMessages: false,
          Speak: false,
          AddReactions: false,
        });
      }
    }

    await member.roles.add(mutedRole);
    const mutes = loadMutes();
    const expires = duration ? Date.now() + duration : null;
    mutes[member.id] = { guild: interaction.guild.id, expires };
    saveMutes(mutes);

    await interaction.reply(`🔇 ${member.user.tag} đã bị mute ${duration ? `trong ${timeStr}` : "vô thời hạn"}`);

    if (duration) {
      setTimeout(async () => {
        if (member.roles.cache.has(mutedRole.id)) {
          await member.roles.remove(mutedRole);
          await interaction.channel.send(`✅ ${member.user.tag} đã được unmute (hết thời gian)`);
        }
        deleteMute(member.id);
      }, duration);
    }
  },
};
