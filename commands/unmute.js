const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le mute (timeout) d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à démuter').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "❌ Ce membre n'est pas sur le serveur.", ephemeral: true });
    }

    try {
      await member.timeout(null, reason);
    } catch (err) {
      return interaction.reply({ content: `❌ Échec : ${err.message}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('🔊 Membre démuté')
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
