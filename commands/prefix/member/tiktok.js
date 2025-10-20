const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../../../config");

module.exports = {
  name: "tiktok",
  description: "Tìm và tải video TikTok theo từ khoá hoặc username",
  adminOnly: false,
  modOnly: false,
  async execute(message, args) {
    if (!config.tiktokChannelIds.includes(message.channel.id)) {
      return message.reply(
        "❌ Lệnh này chỉ được dùng trong các kênh: " +
        config.tiktokChannelIds.map(id => `<#${id}>`).join(", ")
      );
    }
    if (!args.length) {
      return message.reply("⚠️ Hãy nhập từ khóa hoặc username, ví dụ: `!tiktok cosplay` hoặc `!tiktok @chocolatetoooo`");
    }

    let videos = [];
    let query = args.join(" ");
    try {
      if (args[0].startsWith("@")) {
        // Tìm video theo user
        const username = args[0].replace("@", "");
        const userRes = await axios.get(
          `https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(username)}&count=10`
        );
        videos = userRes.data?.data?.videos || [];
        query = `User @${username}`;
      } else {
        // Tìm video theo từ khóa
        const searchRes = await axios.get(
          `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=10`
        );
        videos = searchRes.data?.data?.videos || [];
      }

      if (!videos.length) {
        return message.reply("❌ Không tìm thấy video TikTok nào.");
      }

      // Lọc danh sách video < 8MB
      const validVideos = [];
      for (const video of videos) {
        const url = video.play || video.url;
        if (!url) continue;

        try {
          const headRes = await axios.head(url);
          const sizeInMB = headRes.headers["content-length"] / (1024 * 1024);
          if (sizeInMB <= 100) {
            validVideos.push({
              url,
              title: video.title || `Video từ ${query}`
            });
          }
        } catch (err) {
          console.error("⚠️ Không lấy được size video:", err.message);
          continue;
        }
      }

      if (!validVideos.length) {
        return message.reply("❌ Không tìm thấy video TikTok nào nhỏ hơn 8MB.");
      }

      // Random 1 video
      const chosen = validVideos[Math.floor(Math.random() * validVideos.length)];
      const videoUrl = chosen.url;
      const videoTitle = chosen.title;

      // Tạo thư mục cache
      const cacheDir = path.join(__dirname, "../../cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }
      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      // Tải video
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await message.channel.send({
            content: `🎥 Video TikTok random từ **${query}**:\n${videoTitle}`,
            files: [filePath],
          });
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("❌ Lỗi khi gửi video:", err);
          message.reply("❌ Lỗi khi gửi video.");
        }
      });

      writer.on("error", (err) => {
        console.error("❌ Lỗi khi tải video:", err);
        message.reply("❌ Lỗi khi tải video.");
      });
    } catch (error) {
      console.error("❌ Lỗi TikTok:", error);
      message.reply("❌ Lỗi khi xử lý TikTok.");
    }
  },
};
