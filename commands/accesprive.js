const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { hasRequiredStatus, isVerifiedDoubleBooster, syncAccess, shouldHaveAccess } = require('../utils/access');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('accesprive')
    .setDescription('Vérifie si tu remplis les conditions pour accéder aux salons privés'),

  async execute(interaction) {
    const member = interaction.member;
    await syncAccess(member);

    const statusOk = hasRequiredStatus(member);
    const boostOk = isVerifiedDoubleBooster(member.id);
    const access = shouldHaveAccess(member);

    const embed = new EmbedBuilder()
      .setColor(access ? 0x2ECC71 : 0xE74C3C)
      .setTitle('🔐 Statut d\'accès aux salons privés')
      .addFields(
        { name: `Statut contient "${config.requiredStatusText}"`, value: statusOk ? '✅ Oui' : '❌ Non', inline: true },
        { name: 'Double boost validé', value: boostOk ? '✅ Oui' : '❌ Non', inline: true },
        { name: 'Accès accordé', value: access ? '✅ Oui' : '❌ Non' }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
