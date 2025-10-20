const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// Nếu có font custom .ttf thì import ở đây
registerFont(path.join(__dirname, "../fonts/COMICBD.TTF"), { family: "COMICBD" });

function getRankBadge(level) {
  if (level >= 1 && level <= 3) return "1.png";
  if (level >= 4 && level <= 9) return "2.png";
  if (level >= 10 && level <= 19) return "3.png";
  if (level >= 20 && level <= 34) return "4.png";
  if (level >= 35 && level <= 49) return "5.png";
  if (level >= 50) return "6.png";
  return null;
}

async function generateRankCard(user, level, xp, xpNeeded, rank, totalUsers) {
  const width = 700;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background (random 1 ảnh nền trong images/ranks hoặc tự set 1 ảnh galaxy)
  const bgPath = path.join(__dirname, "../images/ranks/bg.png");
  try {
    const bg = await loadImage(bgPath);
    ctx.drawImage(bg, 0, 0, width, height);
  } catch {
    ctx.fillStyle = "#1e1e2f";
    ctx.fillRect(0, 0, width, height);
  }

  // Avatar
  const avatar = await loadImage(user.displayAvatarURL({ extension: "png", size: 256 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 125, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 30, 55, 140, 140);
  ctx.restore();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(100, 125, 70, 0, Math.PI * 2, true);
  ctx.stroke();

  // Progress bar
  const barX = 220;
  const barY = 50;
  const barWidth = 450;
  const barHeight = 30;

  ctx.fillStyle = "#eee";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  const progressWidth = Math.floor((xp / xpNeeded) * barWidth);
  const barGradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
  barGradient.addColorStop(0, "#ff00cc");
  barGradient.addColorStop(1, "#3333ff");
  ctx.fillStyle = barGradient;
  ctx.fillRect(barX, barY, progressWidth, barHeight);

  // Level text + icon
  ctx.font = "bold 20px Arial"; // đổi font dễ đọc
  ctx.fillStyle = "#000";
  ctx.fillText(`Level: ${level}`, barX + 10, barY + 22);

    // --- Rank Badge ---
    const badgeFile = getRankBadge(level);
    if (badgeFile) {
      const badgePath = path.join(__dirname, `../images/ranks/${badgeFile}`);
      try {
        const badge = await loadImage(badgePath);
        // Đặt ở góc phải trên (khoanh đỏ)
        const badgeSize = 60;
        const badgeX = width - badgeSize - 40; // cách mép phải 20px
        const badgeY = 100;                     // cách mép trên 20px
        ctx.drawImage(badge, badgeX, badgeY, badgeSize, badgeSize);
      } catch (e) {
        console.error("Không tìm thấy icon rank:", badgePath);
      }
    }
  

  // Username
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(user.tag, 220, 110);

  // XP
  ctx.font = "bold 25px Arial";
  ctx.fillStyle = "#00ffff";
  ctx.fillText(`${xp} / ${xpNeeded} xp`, 220, 140);

  // % tiến trình
  const percent = Math.floor((xp / xpNeeded) * 100);
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#0ffff";
  ctx.fillText(`${percent}% `, 220, 170);

    // Rank global
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(
    `Rank : #${rank || "?"} / ${totalUsers} người`,
    220,
    200
  );


  return canvas.toBuffer();
}

module.exports = { generateRankCard };
