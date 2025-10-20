const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  adminOnly: false,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Hiện danh sách tất cả slash command"),

  async execute(interaction, client) {
    const commands = [...client.slashCommands.values()].map(c => ({
      name: c.data.name,
      description: c.data.description,
      adminOnly: c.adminOnly || false,
      modOnly: c.modOnly || false,
    }));

    const adminCmds = commands.filter(c => c.adminOnly);
    const modCmds = commands.filter(c => !c.adminOnly && c.modOnly);
    const memberCmds = commands.filter(c => !c.adminOnly && !c.modOnly);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📜 Danh sách Slash Commands")
      .addFields(
        { name: "🔒 Lệnh Admin", value: adminCmds.length ? adminCmds.map(c => `\`/${c.name}\` - ${c.description}`).join("\n") : "Không có" },
        { name: "🛡️ Lệnh Mod", value: modCmds.length ? modCmds.map(c => `\`/${c.name}\` - ${c.description}`).join("\n") : "Không có" },
        { name: "✨ Lệnh cho Member", value: memberCmds.length ? memberCmds.map(c => `\`/${c.name}\` - ${c.description}`).join("\n") : "Không có" },
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
