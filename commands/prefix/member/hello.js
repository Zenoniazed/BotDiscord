module.exports = {
    name: 'hello',
    description: 'Xin chào bot',
    adminOnly: false, 
    modOnly: false,
    execute(message) {
      message.reply(`👋 Xin chào nô lệ ${message.author.username}!`);
    },
  };
  