const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription("Débannir un membre via son ID")
    .addStringOption(opt => opt.setName('id').setDescription('ID Discord du membre à débannir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison du débannissement').setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const userId = interaction.options.getString('id');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    try {
      await interaction.guild.members.unban(userId, reason);
    } catch (err) {
      return interaction.reply({ content: `❌ Échec du débannissement (ID invalide ou membre non banni) : ${err.message}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Membre débanni')
      .addFields(
        { name: 'ID', value: userId },
        { name: 'Modérateur', value: `${interaction.user.tag}` },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    sendLog(interaction.guild, embed);
  },
};
