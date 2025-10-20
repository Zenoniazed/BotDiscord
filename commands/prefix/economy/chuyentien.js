const { getUser, updateUser } = require("../../../utils/economy");

module.exports = {
  name: "chuyentien",
  description: "Chuyển tiền cho người khác",
  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return message.reply("❌ Hãy tag người nhận tiền.");
    if (target.id === message.author.id) return message.reply("❌ Bạn không thể tự chuyển cho chính mình.");
    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền hợp lệ.");

    const senderId = message.author.id;
    const receiverId = target.id;

    const senderData = getUser(senderId);
    const receiverData = getUser(receiverId);

    if (senderData.wallet < amount) return message.reply("❌ Bạn không đủ tiền trong ví.");

    // Trừ tiền người gửi
    senderData.wallet -= amount;
    updateUser(senderId, senderData);

    // Cộng tiền người nhận
    receiverData.wallet += amount;
    updateUser(receiverId, receiverData);

    message.reply(`✅ Bạn đã chuyển **${amount}$** cho **${target.username}**.`);
  },
};
