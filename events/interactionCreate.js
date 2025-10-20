const config = require("../config");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    // ================== PHÂN QUYỀN ==================
    const member = interaction.member;

    const isOwner = config.owners.includes(interaction.user.id);
    const isAdminUser = config.adminIds?.includes(interaction.user.id);
    const hasAdminRole = member.roles.cache.some(r =>
      config.adminRoles.includes(r.id)
    );
    const isModUser = config.modIds?.includes(interaction.user.id);
    const hasModRole = member.roles.cache.some(r =>
      config.modRoles.includes(r.id)
    );

    // Nếu là Owner thì bypass
    if (isOwner) {
      return runCommand();
    }

    // Nếu command yêu cầu admin
    if (command.adminOnly) {
      if (isAdminUser || hasAdminRole) {
        return runCommand();
      } else {
        return interaction.reply({
          content: "❌ Lệnh này chỉ dành cho Admin.",
          ephemeral: true,
        });
      }
    }

    // Nếu command yêu cầu mod
    if (command.modOnly) {
      if (isAdminUser || hasAdminRole || isModUser || hasModRole) {
        return runCommand();
      } else {
        return interaction.reply({
          content: "❌ Lệnh này chỉ dành cho Moderator.",
          ephemeral: true,
        });
      }
    }

    // Nếu không yêu cầu gì → ai cũng chạy
    return runCommand();

    // Hàm chạy lệnh
    async function runCommand() {
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "❌ Có lỗi khi chạy slash command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "❌ Có lỗi khi chạy slash command!",
            ephemeral: true,
          });
        }
      }
    }
  },
};
