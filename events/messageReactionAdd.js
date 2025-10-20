// events/messageReactionAdd.js
module.exports = {
    name: "messageReactionAdd",
    async execute(reaction, user) {
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
  
      if (reaction.emoji.name === "✅") {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;
        const role = guild.roles.cache.find(r => r.name === "DIAMOND 💎"); // đổi tên role nếu khác
        if (role) {
          await member.roles.add(role);
        }
      }
    }
  };
  