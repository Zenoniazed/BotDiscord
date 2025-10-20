const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Danh sách nhiều kênh
    const welcomeChannelIds = [
      "1414282032057684160"
    ];

    // Tạo embed chào mừng
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle("🎉 Chào mừng thành viên mới!")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `👋 Xin chào **${member.user.username}**!\n\nChào mừng bạn đến với **${member.guild.name}**.\n` +
        `Bạn là thành viên thứ **${member.guild.memberCount}** của server! 🎊`
      )
      .setImage("https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3Q4ajFmenN6ajNramlhcjIyendkbDU0cXVubjI5Zmtram9odWd5biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YZX4FWwOJTK5W/giphy.gif")
      .setFooter({ 
        text: "Chúc bạn có trải nghiệm vui vẻ trong server 💖", 
        iconURL: member.guild.iconURL({ dynamic: true }) 
      })
      .setTimestamp();

    // Lặp qua từng channel id và gửi embed
    for (const id of welcomeChannelIds) {
      const channel = member.guild.channels.cache.get(id);
      if (channel) {
        channel.send({ embeds: [embed] });
      }
    }
  },
};
