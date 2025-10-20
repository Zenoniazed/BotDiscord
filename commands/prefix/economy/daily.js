const { getUser, updateUser } = require("../../../utils/economy");

module.exports = {
  name: "daily",
  description: "Nhận tiền daily",
  async execute(message) {
    const userId = message.author.id;
    const userData = getUser(userId);

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24h
    if (now - userData.lastDaily < cooldown) {
      const timeLeft = Math.ceil((cooldown - (now - userData.lastDaily)) / 1000 / 60);
      return message.reply(`⏳ Bạn đã nhận daily rồi, thử lại sau ${timeLeft} phút.`);
    }

    const reward = Math.floor(Math.random() * 500) + 1; // 100 - 600
    userData.wallet += reward;
    userData.lastDaily = now;
    updateUser(userId, userData);

    message.reply(`🎁 Bạn đã nhận **${reward}$** vào ví!`);
  },
};
