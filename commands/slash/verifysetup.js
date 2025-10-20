const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../cache/verify.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verifysetup")
    .setDescription("Gửi tin nhắn verify (emoji reaction)"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Xác minh để tham gia server")
      .setDescription("React với emoji ✅ để nhận quyền chat!");

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react("✅");

    // Lưu ID tin nhắn + channelId
    const data = {
      channelId: message.channel.id,
      messageId: message.id
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    await interaction.followUp({
      content: "✅ Tin nhắn verify đã được lưu, bot sẽ tự nhớ sau khi restart.",
      ephemeral: true
    });
  }
};
