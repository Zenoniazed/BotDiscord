const { getUser, updateUser } = require("../../../utils/economy");

module.exports = {
  name: "ruttien",
  description: "Rút tiền từ bank",
  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền hợp lệ.");

    const userId = message.author.id;
    const userData = getUser(userId);

    if (userData.bank < amount) return message.reply("❌ Bạn không đủ tiền trong ngân hàng.");

    userData.bank -= amount;
    userData.wallet += amount;
    updateUser(userId, userData);

    message.reply(`✅ Đã rút ${amount}$ từ ngân hàng.`);
  },
};
