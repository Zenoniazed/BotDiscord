const { loadMutes, deleteMute } = require("../utils/muteStorage");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ Bot đã login với tên: ${client.user.tag}`);

    // Load slash commands
    client.slashCommands = new Map();
    const slashPath = path.join(__dirname, "../commands/slash");
    const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith(".js"));

    for (const file of slashFiles) {
      const command = require(`${slashPath}/${file}`);
      client.slashCommands.set(command.data.name, command);
    }

    // === Khôi phục mute ===
    const mutes = loadMutes();
    for (const userId in mutes) {
      const { guild, expires } = mutes[userId];
      const g = client.guilds.cache.get(guild);
      if (!g) continue;
      const member = await g.members.fetch(userId).catch(() => null);
      if (!member) continue;

      const mutedRole = g.roles.cache.find(r => r.name === "Muted");
      if (!mutedRole) continue;

      if (expires && Date.now() >= expires) {
        await member.roles.remove(mutedRole).catch(() => null);
        deleteMute(userId);
      } else if (expires) {
        setTimeout(async () => {
          if (member.roles.cache.has(mutedRole.id)) {
            await member.roles.remove(mutedRole).catch(() => null);
            g.channels.cache.first()?.send(`✅ ${member.user.tag} đã được unmute (hết thời gian)`);
          }
          deleteMute(userId);
        }, expires - Date.now());
      }
    }

    // === Load lại tin nhắn Verify ===
    const verifyPath = path.join(__dirname, "../cache/verify.json");
    if (fs.existsSync(verifyPath)) {
      const data = JSON.parse(fs.readFileSync(verifyPath));
      if (data.channelId && data.messageId) {
        try {
          const channel = await client.channels.fetch(data.channelId);
          if (channel) {
            await channel.messages.fetch(data.messageId);
            console.log("🔄 Đã load lại tin nhắn verify.");
            return;
          }
        } catch (err) {
          console.error("❌ Không thể fetch lại tin nhắn verify:", err);
        }
      }
    }

    // === Nếu không fetch được thì tạo mới ===
    if (config.verifyChannelIds && config.verifyChannelIds.length > 0) {
      for (const chId of config.verifyChannelIds) {
        try {
          const channel = await client.channels.fetch(chId);
          if (channel) {
            const embed = new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle("✅ Xác minh để tham gia server")
              .setDescription("React với emoji ✅ để nhận quyền chat!");

            const message = await channel.send({ embeds: [embed] });
            await message.react("✅");

            const data = {
              channelId: channel.id,
              messageId: message.id
            };
            fs.writeFileSync(
              verifyPath,
              JSON.stringify(data, null, 2)
            );

            console.log(`📌 Đã tạo mới tin nhắn verify trong kênh ${chId}`);
          }
        } catch (err) {
          console.error(`❌ Lỗi khi tạo tin nhắn verify ở kênh ${chId}:`, err);
        }
      }
    } else {
      console.warn("⚠️ Bạn chưa cấu hình verifyChannelIds trong config.js");
    }
  },
};
