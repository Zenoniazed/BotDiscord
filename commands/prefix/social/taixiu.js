const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const { getUser, updateUser } = require("../../../utils/economy");

async function drawDice(dice) {
  const canvas = createCanvas(200, 60);
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < 3; i++) {
    const img = await loadImage(
      path.join(__dirname, "../../../images/xucxac", `${dice[i]}.png`)
    );
    ctx.drawImage(img, i * 65, 5, 50, 50); // spacing + size
  }
  return canvas.toBuffer();
}

module.exports = {
  name: "taixiu",
  description: "Chơi tài xỉu (có jackpot + phí 2%)",
  async execute(message, args) {
    const betChoice = args[0];
    let amount = args[1];

    if (!["tài", "tai", "xỉu", "xiu","x","t"].includes(betChoice?.toLowerCase())) {
      return message.reply("❌ Cú pháp: `!taixiu2 <tài/xỉu> <số tiền|all>`");
    }

    const userId = message.author.id;
    const userData = getUser(userId);

    // Nếu nhập all → cược hết ví
    if (amount?.toLowerCase?.() === "all") {
      amount = userData.wallet;
    } else {
      amount = parseInt(amount);
    }

    if (!amount || amount <= 0) return message.reply("❌ Nhập số tiền cược hợp lệ.");
    if (userData.wallet < amount) return message.reply("❌ Bạn không đủ tiền trong ví.");

    // Hiển thị embed đang lắc với GIF gốc
    const gifPath = path.join(__dirname, "../../../images/xucxac/xucxac.gif");
    const fileGif = new AttachmentBuilder(gifPath, { name: "xucxac.gif" });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTitle("🎲 Tài Xỉu")
      .setDescription("Đang lắc xúc xắc...")
      .setColor("Random")
      .setImage("attachment://xucxac.gif");

    const msg = await message.reply({ embeds: [embed], files: [fileGif] });

    // Chờ 2.5 giây
    await new Promise(r => setTimeout(r, 2500));

    // Random kết quả thật
    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    const total = dice[0] + dice[1] + dice[2];
    const result = total >= 11 ? "TÀI" : "XỈU";

    let jackpot = false;
    let win = false;
    let reward = 0;

    if (dice[0] === dice[1] && dice[1] === dice[2]) {
      jackpot = true;
      win = true;
      reward = amount * 3;
    } else if (
      (["tài", "tai","t"].includes(betChoice.toLowerCase()) && result === "TÀI") ||
      (["xỉu", "xiu","x"].includes(betChoice.toLowerCase()) && result === "XỈU")
    ) {
      win = true;
      reward = Math.floor(amount * 0.98);
    }

    if (win) {
      userData.wallet += reward;
    } else {
      userData.wallet -= amount;
    }
    updateUser(userId, userData);

    // Vẽ kết quả thật (3 viên)
    const buffer = await drawDice(dice);
    const fileResult = new AttachmentBuilder(buffer, { name: "result.png" });

    embed
      .setDescription(
        `👤 Người chơi: <@${userId}>\n\n` +
          `🎲 Kết quả: **${dice.join(" + ")} = ${total} (${result})**\n\n` +
          (jackpot
            ? `🎰 JACKPOT! Bạn thắng **+${reward}$**`
            : win
            ? `✅ Bạn thắng **+${reward}$** (đã trừ 2% phí)`
            : `❌ Bạn thua và mất **-${amount}$**`) +
          `\n\n💰 Số dư ví hiện tại: **${userData.wallet}$**`
      )
      .setImage("attachment://result.png");

    await msg.edit({ embeds: [embed], files: [fileResult] });
  },
};
