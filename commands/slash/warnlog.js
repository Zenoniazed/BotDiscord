const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnFile = path.join(__dirname, "../../cache/warns.json");
function loadWarns() {
  if (!fs.existsSync(warnFile)) return {};
  return JSON.parse(fs.readFileSync(warnFile));
}

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("warnlog")
    .setDescription("Xem lịch sử cảnh cáo của một thành viên")
    .addUserOption(opt =>
      opt.setName("target").setDescription("Người cần xem").setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    if (!member) return interaction.reply({ content: "❌ Không tìm thấy thành viên này.", ephemeral: true });

    const warns = loadWarns()[member.id];
    if (!warns || warns.length === 0) {
      return interaction.reply(`✅ ${member.user.tag} chưa có cảnh cáo nào.`);
    }

    const log = warns.map((w, i) => `\`${i + 1}\` • ${w.reason} (bởi <@${w.by}> - ${w.date})`).join("\n");
    interaction.reply(`📋 Lịch sử cảnh cáo của **${member.user.tag}**:\n${log}`);
  },
};
