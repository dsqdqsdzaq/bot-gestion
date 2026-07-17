const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un membre pendant une durée donnée (timeout Discord)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à rendre muet').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Durée en minutes (max 40320 = 28 jours)').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "❌ Ce membre n'est pas sur le serveur.", ephemeral: true });
    }
    if (!member.moderatable) {
      return interaction.reply({ content: "❌ Je ne peux pas rendre ce membre muet (rôle trop élevé ou permissions insuffisantes).", ephemeral: true });
    }

    try {
      await member.timeout(minutes * 60 * 1000, reason);
    } catch (err) {
      return interaction.reply({ content: `❌ Échec : ${err.message}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('🔇 Membre rendu muet')
      .addFields(
        { name: 'Membre', value: `${target.tag} (${target.id})` },
        { name: 'Durée', value: `${minutes} minute(s)` },
        { name: 'Modérateur', value: `${interaction.user.tag}` },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    sendLog(interaction.guild, embed);
  },
};
