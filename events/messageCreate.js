const config = require('../config');

const spamMap = new Map(); // auto mod spam

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    // === LEVEL SYSTEM ===
      const fs = require("fs");
      const path = require("path");
      const levelFile = path.join(__dirname, "../cache/levels.json");

      function loadLevels() {
        if (!fs.existsSync(levelFile)) return {};
        return JSON.parse(fs.readFileSync(levelFile));
      }
      function saveLevels(data) {
        fs.writeFileSync(levelFile, JSON.stringify(data, null, 2));
      }

      const levels = loadLevels();
      const userId = message.author.id;

      if (!levels[userId]) {
        levels[userId] = { exp: 0, level: 1 };
      }

      // +10 exp mỗi tin nhắn
      levels[userId].exp += 5;

      // Công thức lên level (100 exp * level hiện tại)
      const need = levels[userId].level * 100;
      if (levels[userId].exp >= need) {
        levels[userId].exp -= need;
        levels[userId].level += 1;
        message.channel.send(`🎉 Chúc mừng ${message.author} đã lên **Level ${levels[userId].level}**!`);
      }

      saveLevels(levels);


    // ================== AUTO MODERATION ==================
    // // Anti-link / invite
    // if (/discord\.gg|http[s]?:\/\//i.test(message.content)) {
    //   if (!message.member.permissions.has("Administrator")) {
    //     await message.delete().catch(() => {});
    //     return message.channel.send(`❌ ${message.author}, không được gửi link!`);
    //   }
    // }

    // // Lọc từ cấm
    // const badWords = ["ngu", "chó", "fuck", "địt", "đụ", "lồn", "cc", "clm", "dm", "dmm", "vcl", "vl", "súc vật"]; 
    // if (badWords.some(w => message.content.toLowerCase().includes(w))) {
    //   await message.delete().catch(() => {});
    //   return message.channel.send(`🚫 ${message.author}, không được nói tục!`);
    // }

    // Spam emoji
    const emojiCount = (message.content.match(/<:\w+:\d+>/g) || []).length;
    if (emojiCount > 5) {
      await message.delete().catch(() => {});
      return message.channel.send(`🚫 ${message.author}, spam emoji quá nhiều!`);
    }

    // // Spam everyone
    // if (message.mentions.everyone) {
    //   await message.delete().catch(() => {});
    //   return message.channel.send(`🚫 ${message.author}, không được spam @everyone!`);
    // }

    // Anti-spam (5 tin trong 3s)
    let data = spamMap.get(message.author.id) || { count: 0, last: Date.now() };
    let now = Date.now();

    if (now - data.last < 3000) {
      data.count++;
    } else {
      data.count = 1;
    }
    data.last = now;
    spamMap.set(message.author.id, data);

    if (data.count >= 5) {
      const muteRole = message.guild.roles.cache.find(r => r.name === "Muted");
      if (muteRole) {
        await message.member.roles.add(muteRole).catch(() => {});
        message.channel.send(`🤐 ${message.author} bị mute trong 1 phút vì spam!`);
        setTimeout(async () => {
          if (message.member.roles.cache.has(muteRole.id)) {
            await message.member.roles.remove(muteRole).catch(() => {});
            message.channel.send(`✅ ${message.author} đã được gỡ mute.`);
          }
        }, 1 * 60 * 1000);
      }
      spamMap.delete(message.author.id);
    }

    // ================== PREFIX COMMAND ==================
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    // ================== PHÂN QUYỀN ==================
    const isOwner = config.owners.includes(message.author.id);
    const isAdminUser = config.adminIds.includes(message.author.id);
    const hasAdminRole = message.member.roles.cache.some(r =>
      config.adminRoles.includes(r.id)
    );
    const isModUser = config.modIds.includes(message.author.id);
    const hasModRole = message.member.roles.cache.some(r =>
      config.modRoles.includes(r.id)
    );

    // Nếu là Owner thì bypass toàn bộ
    if (isOwner) {
      return runCommand();
    }

    // Nếu lệnh cần admin
    if (command.adminOnly) {
      if (isAdminUser || hasAdminRole) {
        return runCommand();
      } else {
        return message.reply("❌ Lệnh này chỉ dành cho Admin.");
      }
    }

    // Nếu lệnh cần mod
    if (command.modOnly) {
      if (isAdminUser || hasAdminRole || isModUser || hasModRole) {
        return runCommand();
      } else {
        return message.reply("❌ Lệnh này chỉ dành cho Moderator.");
      }
    }

    // Nếu không yêu cầu gì → ai cũng chạy được
    return runCommand();

    // Hàm chạy lệnh
    function runCommand() {
      try {
        command.execute(message, args, client);
      } catch (error) {
        console.error(error);
        message.reply("❌ Có lỗi khi chạy prefix command!");
      }
    }
  },
};
