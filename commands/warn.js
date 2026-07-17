const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { sendLog } = require('../utils/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre (envoie un message privé + log)')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre à avertir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison de l\'avertissement').setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison');

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle(`⚠️ Vous avez reçu un avertissement sur ${interaction.guild.name}`)
      .addFields({ name: 'Raison', value: reason })
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('⚠️ Avertissement')
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
