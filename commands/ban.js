const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à bannir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison du bannissement').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('jours_messages')
        .setDescription('Supprimer les messages des X derniers jours (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const days = interaction.options.getInteger('jours_messages') ?? 0;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (member) {
      if (!member.bannable) {
        return interaction.reply({ content: "❌ Je ne peux pas bannir ce membre (rôle trop élevé ou permissions insuffisantes).", ephemeral: true });
      }
    }

    try {
      await interaction.guild.members.ban(target.id, { deleteMessageSeconds: days * 86400, reason });
    } catch (err) {
      return interaction.reply({ content: `❌ Échec du bannissement : ${err.message}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔨 Membre banni')
      .addFields(
        { name: 'Membre', value: `${target.tag} (${target.id})` },
        { name: 'Modérateur', value: `${interaction.user.tag}` },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    sendLog(interaction.guild, embed);
  },
};
