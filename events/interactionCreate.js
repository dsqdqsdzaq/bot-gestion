const { createTicket, closeTicket } = require('../utils/tickets');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Commandes slash
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Erreur dans la commande ${interaction.commandName} :`, err);
        const payload = { content: "❌ Une erreur est survenue en exécutant cette commande.", ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }
      return;
    }

    // Menu déroulant "Ouvrir un ticket"
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_open_select') {
      try {
        await createTicket(interaction, interaction.values[0]);
      } catch (err) {
        console.error('Erreur création ticket :', err);
        await interaction.reply({ content: '❌ Une erreur est survenue lors de la création du ticket.', ephemeral: true }).catch(() => {});
      }
      return;
    }

    // Bouton "Fermer le ticket"
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      try {
        await closeTicket(interaction);
      } catch (err) {
        console.error('Erreur fermeture ticket :', err);
        await interaction.reply({ content: '❌ Une erreur est survenue lors de la fermeture du ticket.', ephemeral: true }).catch(() => {});
      }
      return;
    }
  },
};
