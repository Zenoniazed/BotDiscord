// events/messageReactionRemove.js
module.exports = {
    name: "messageReactionRemove",
    async execute(reaction, user) {
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
  
      if (reaction.emoji.name === "✅") {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;
        const role = guild.roles.cache.find(r => r.name === "DIAMOND 💎");
        if (role) {
          await member.roles.remove(role);
        }
      }
    }
  };
  