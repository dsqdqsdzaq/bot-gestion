const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à expulser').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription("Raison de l'expulsion").setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

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
    if (!member.kickable) {
      return interaction.reply({ content: "❌ Je ne peux pas expulser ce membre (rôle trop élevé ou permissions insuffisantes).", ephemeral: true });
    }

    try {
      await member.kick(reason);
    } catch (err) {
      return interaction.reply({ content: `❌ Échec de l'expulsion : ${err.message}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setTitle('👢 Membre expulsé')
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
