module.exports = {
    name: 'kick',
    description: 'Kick 1 thành viên (Admin only)',
    adminOnly: true, // đánh dấu lệnh này cần quyền admin
    execute(message, args) {
      const member = message.mentions.members.first();
      if (!member) return message.reply("⚠️ Hãy tag người muốn kick.");
  
      member.kick()
        .then(() => message.reply(`✅ Đã kick ${member.user.tag}`))
        .catch(() => message.reply("❌ Không thể kick người này."));
    },
  };
  