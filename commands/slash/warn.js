const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnFile = path.join(__dirname, "../../cache/warns.json");

function loadWarns() {
  if (!fs.existsSync(warnFile)) return {};
  return JSON.parse(fs.readFileSync(warnFile));
}
function saveWarns(data) {
  fs.writeFileSync(warnFile, JSON.stringify(data, null, 2));
}

module.exports = {
  adminOnly: true,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Cảnh cáo một thành viên")
    .addUserOption(opt =>
      opt.setName("target").setDescription("Người cần cảnh cáo").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Lý do cảnh cáo").setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    if (!member) return interaction.reply({ content: "❌ Không tìm thấy thành viên này.", ephemeral: true });

    const reason = interaction.options.getString("reason") || "Không có lý do";
    const warns = loadWarns();
    if (!warns[member.id]) warns[member.id] = [];

    warns[member.id].push({
      reason,
      date: new Date().toLocaleString(),
      by: interaction.user.id,
    });
    saveWarns(warns);

    interaction.reply(`⚠️ Đã cảnh cáo ${member.user.tag} | Lý do: **${reason}**`);
  },
};
