const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../../config");

module.exports = {
  adminOnly: false,
  modOnly: false,

  data: new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("Tìm và tải video TikTok")
    .addStringOption(opt =>
      opt.setName("query").setDescription("Từ khóa hoặc @username").setRequired(true)
    ),

  async execute(interaction) {
    if (!config.tiktokChannelIds.includes(interaction.channel.id)) {
      return interaction.reply({ content: "❌ Lệnh này chỉ được dùng trong các kênh được chỉ định.", ephemeral: true });
    }

    await interaction.deferReply();

    const query = interaction.options.getString("query");
    let videos = [];

    try {
      if (query.startsWith("@")) {
        const username = query.replace("@", "");
        const userRes = await axios.get(`https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(username)}&count=10`);
        videos = userRes.data?.data?.videos || [];
      } else {
        const searchRes = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=10`);
        videos = searchRes.data?.data?.videos || [];
      }

      if (!videos.length) return interaction.editReply("❌ Không tìm thấy video TikTok nào.");

      const validVideos = [];
      for (const video of videos) {
        const url = video.play || video.url;
        if (!url) continue;
        try {
          const headRes = await axios.head(url);
          const sizeInMB = headRes.headers["content-length"] / (1024 * 1024);
          if (sizeInMB <= 8) {
            validVideos.push({ url, title: video.title || "Video TikTok" });
          }
        } catch { continue; }
      }

      if (!validVideos.length) return interaction.editReply("❌ Không có video nào nhỏ hơn 8MB.");

      const chosen = validVideos[Math.floor(Math.random() * validVideos.length)];
      const filePath = path.join(__dirname, "../../cache", `${Date.now()}.mp4`);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({ url: chosen.url, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await interaction.editReply({ content: `🎥 Video TikTok từ **${query}**:\n${chosen.title}`, files: [filePath] });
        fs.unlinkSync(filePath);
      });
      writer.on("error", () => interaction.editReply("❌ Lỗi khi tải video."));
    } catch (err) {
      console.error(err);
      interaction.editReply("❌ Lỗi khi xử lý TikTok.");
    }
  },
};
