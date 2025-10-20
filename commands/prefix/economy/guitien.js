const { getUser, updateUser } = require("../../../utils/economy");

module.exports = {
  name: "guitien",
  description: "Gửi tiền vào bank",
  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền hợp lệ.");

    const userId = message.author.id;
    const userData = getUser(userId);

    if (userData.wallet < amount) return message.reply("❌ Bạn không đủ tiền trong ví.");

    userData.wallet -= amount;
    userData.bank += amount;
    updateUser(userId, userData);

    message.reply(`✅ Đã gửi ${amount}$ vào ngân hàng.`);
  },
};
