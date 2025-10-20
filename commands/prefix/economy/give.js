const { getUser, updateUser } = require("../../../utils/economy");

module.exports = {
  name: "give",
  description: "Admin cộng tiền cho thành viên",
  adminOnly: true, // chỉ admin mới được dùng
  async execute(message, args, client) {
    // Kiểm tra role admin hoặc ID chủ bot
    if (
      !message.member.permissions.has("Administrator") && 
      !client.config.owners.includes(message.author.id)
    ) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return message.reply("❌ Hãy tag người cần được cộng tiền.");
    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền hợp lệ.");

    const userData = getUser(target.id);
    userData.wallet += amount;
    updateUser(target.id, userData);

    message.reply(`✅ Đã cộng **${amount}$** vào ví của **${target.username}**.`);
  },
};
