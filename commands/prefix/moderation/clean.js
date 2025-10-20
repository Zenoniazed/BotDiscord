module.exports = {
    name: "clean",
    description: "Xóa tin nhắn (1-100) hoặc tin nhắn của thành viên",
    adminOnly: true,
    async execute(message, args) {
      const member = message.mentions.members.first();
      let count = parseInt(args[0]);
  
      // Nếu có tag user => cú pháp: !clear @user 50
      if (member) {
        count = parseInt(args[1]);
        if (!count || count < 1 || count > 100)
          return message.reply("❌ Nhập số lượng tin nhắn cần xóa (1-100).");
  
        const fetched = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = fetched.filter(m => m.author.id === member.id).first(count);
  
        await message.channel.bulkDelete(userMessages, true);
        return message.channel.send(
          `✅ Đã xóa ${userMessages.length} tin nhắn của ${member.user.tag}.`
        ).then(msg => setTimeout(() => msg.delete(), 3000));
      }
  
      // Nếu không tag user => xóa theo số lượng
      if (!count || count < 1 || count > 100)
        return message.reply("❌ Nhập số lượng tin nhắn cần xóa (1-100).");
  
      await message.channel.bulkDelete(count, true);
      message.channel.send(`✅ Đã xóa ${count} tin nhắn!`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    }
  };
  