const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const { getUser, updateUser } = require("../../../utils/economy");

// Vẽ xúc xắc kết quả
async function drawDice(dice) {
  const canvas = createCanvas(200, 60);
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < 3; i++) {
    const img = await loadImage(
      path.join(__dirname, "../../../images/xucxac", `${dice[i]}.png`)
    );
    ctx.drawImage(img, i * 65, 5, 50, 50);
  }
  return canvas.toBuffer();
}

// Trạng thái game (share với vao.js)
let currentGame = {
  isRunning: false,
  isRolling: false,
  bets: [],
  timer: null,
  message: null,
};

module.exports = {
  name: "taixiu2",
  description: "Mở ván Tài Xỉu nhiều người (30s để cược)",
  async execute(message) {
    if (currentGame.isRunning || currentGame.isRolling) {
      return message.reply("⚠️ Hiện đã có một ván đang diễn ra.");
    }

    currentGame.isRunning = true;
    currentGame.bets = [];
    currentGame.message = null;

    message.channel.send("🎲 Ván **Tài Xỉu nhiều người** bắt đầu! Bạn có 30 giây để dùng `!vao <tài/xỉu> <số tiền>` để cược.");

    // Thông báo đếm ngược
    setTimeout(() => message.channel.send("⏳ Còn 20 giây để cược!"), 10000);
    setTimeout(() => message.channel.send("⏳ Còn 10 giây để cược!"), 20000);
    setTimeout(() => message.channel.send("⚠️ Còn 5 giây cuối cùng!"), 25000);

    // Sau 30s → quay xúc xắc
    currentGame.timer = setTimeout(async () => {
      await finishGame(message.channel);
    }, 30000);
  },
};

// Hàm kết thúc ván
async function finishGame(channel) {
  currentGame.isRolling = true;

  // GIF lắc xúc xắc
  const gifPath = path.join(__dirname, "../../../images/xucxac/xucxac.gif");
  const fileGif = new AttachmentBuilder(gifPath, { name: "xucxac.gif" });

  const embed = new EmbedBuilder()
    .setTitle("🎲 Tài Xỉu - Ván Nhiều Người")
    .setDescription("Đang lắc xúc xắc...")
    .setColor("Random")
    .setImage("attachment://xucxac.gif");

  const msg = await channel.send({ embeds: [embed], files: [fileGif] });
  currentGame.message = msg;

  await new Promise(r => setTimeout(r, 2500));

  // Random xúc xắc
  const dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  const total = dice.reduce((a, b) => a + b, 0);
  const result = total >= 11 ? "TÀI" : "XỈU";

  // Render ảnh kết quả
  const buffer = await drawDice(dice);
  const fileResult = new AttachmentBuilder(buffer, { name: "result.png" });

  let text = `🎲 Kết quả: **${dice.join(" + ")} = ${total} (${result})**\n\n`;

  for (const bet of currentGame.bets) {
    const userData = getUser(bet.userId);
    let reward = 0;
    let win = false;
    let jackpot = false;

    // Jackpot: ra 3 số giống nhau và đúng cửa
    if (
      dice[0] === dice[1] &&
      dice[1] === dice[2] &&
      (
        (["tài", "tai"].includes(bet.betChoice.toLowerCase()) && result === "TÀI") ||
        (["xỉu", "xiu"].includes(bet.betChoice.toLowerCase()) && result === "XỈU")
      )
    ) {
      jackpot = true;
      win = true;
      reward = bet.amount * 3;
      userData.wallet += reward;
    } else if (
      (["tài", "tai"].includes(bet.betChoice.toLowerCase()) && result === "TÀI") ||
      (["xỉu", "xiu"].includes(bet.betChoice.toLowerCase()) && result === "XỈU")
    ) {
      win = true;
      reward = Math.floor(bet.amount * 1.9); // trả 0.9x
      userData.wallet += reward;
    }
    updateUser(bet.userId, userData);

    text += `<@${bet.userId}>: ${
      jackpot
        ? `🎰 JACKPOT! +${reward}$`
        : win
        ? `✅ Thắng +${reward}$ (đã trừ phí)`
        : `❌ Thua -${bet.amount}$`
    } → Số dư: **${userData.wallet}$**\n`;
  }

  embed.setDescription(text).setImage("attachment://result.png");

  await msg.edit({ embeds: [embed], files: [fileResult] });

  // Reset
  currentGame.isRunning = false;
  currentGame.isRolling = false;
  currentGame.bets = [];
  currentGame.timer = null;
  currentGame.message = null;
}

// Export state để vao.js dùng chung
module.exports.currentGame = currentGame;
