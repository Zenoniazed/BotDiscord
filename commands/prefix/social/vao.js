const { getUser, updateUser } = require("../../../utils/economy");
const { currentGame } = require("./taixiu2");

module.exports = {
  name: "vao",
  description: "Tham gia ván Tài Xỉu nhiều người",
  async execute(message, args) {
    if (!currentGame.isRunning || currentGame.isRolling) {
      return message.reply("❌ Hiện chưa có ván nào để cược. Hãy chờ mở bằng `!taixiu2`.");
    }

    const betChoice = args[0];
    let amount = args[1];
    const userId = message.author.id;
    const userData = getUser(userId);

    if (!["tài", "tai", "xỉu", "xiu"].includes(betChoice?.toLowerCase()))
      return message.reply("❌ Cú pháp: `!vao <tài/xỉu> <số tiền|all>`");

    if (amount?.toLowerCase?.() === "all") amount = userData.wallet;
    else amount = parseInt(amount);

    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền cược hợp lệ.");
    if (userData.wallet < amount) return message.reply("❌ Bạn không đủ tiền trong ví.");

    if (currentGame.bets.find(b => b.userId === userId))
      return message.reply("❌ Bạn đã cược trong ván này rồi!");

    // Trừ tiền tạm
    userData.wallet -= amount;
    updateUser(userId, userData);

    currentGame.bets.push({ userId, betChoice, amount });
    message.reply(`✅ Bạn đã cược **${amount}$** vào **${betChoice.toUpperCase()}**`);
  },
};
