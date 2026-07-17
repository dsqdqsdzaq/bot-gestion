const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { setVerifiedDoubleBooster, syncAccess } = require('../utils/access');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifboost')
    .setDescription('Valider manuellement qu\'un membre a boosté le serveur 2 fois (donne l\'accès privé)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à valider').setRequired(true))
    .addBooleanOption(opt => opt.setName('valide').setDescription('true = valider, false = retirer la validation').setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    const valide = interaction.options.getBoolean('valide');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "❌ Ce membre n'est pas sur le serveur.", ephemeral: true });
    }

    setVerifiedDoubleBooster(target.id, valide);
    await syncAccess(member);

    const embed = new EmbedBuilder()
      .setColor(valide ? 0x2ECC71 : 0xE74C3C)
      .setTitle(valide ? '✅ Double boost validé' : '❌ Validation de double boost retirée')
      .addFields(
        { name: 'Membre', value: `${target.tag} (${target.id})` },
        { name: 'Validé par', value: `${interaction.user.tag}` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
