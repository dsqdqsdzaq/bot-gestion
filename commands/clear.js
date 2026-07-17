const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { isModerator } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer un nombre de messages dans le salon')
    .addIntegerOption(opt => opt.setName('nombre').setDescription('Nombre de messages à supprimer (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    if (!isModerator(interaction.member) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const amount = interaction.options.getInteger('nombre');

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `🧹 ${deleted.size} message(s) supprimé(s).`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Échec (les messages de plus de 14 jours ne peuvent pas être supprimés en masse) : ${err.message}`, ephemeral: true });
    }
  },
};
