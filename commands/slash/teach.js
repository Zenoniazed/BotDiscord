const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../cache/chatdb.json");

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "{}");
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("teach")
    .setDescription("Dạy bot câu trả lời mới")
    .addStringOption(opt =>
      opt.setName("cauhoi").setDescription("Câu hỏi").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("traloi").setDescription("Câu trả lời").setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString("cauhoi").toLowerCase().trim();
    const answer = interaction.options.getString("traloi").trim();

    const chatdb = loadDB();

    if (!chatdb[question]) chatdb[question] = [];
    chatdb[question].push(answer);

    saveDB(chatdb);

    await interaction.reply(`✅ Đã học: **${question}** → "${answer}"`);
  }
};
