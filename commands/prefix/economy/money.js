const { getUser } = require("../../../utils/economy");

module.exports = {
  name: "money",
  description: "Xem số dư",
  async execute(message) {
    const member = message.mentions.users.first() || message.author;
    const userData = getUser(member.id);

    message.reply(`💰 Ví: ${userData.wallet}$ | 🏦 Ngân hàng: ${userData.bank}$`);
  },
};
