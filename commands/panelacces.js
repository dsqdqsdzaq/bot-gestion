const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panelacces')
    .setDescription('Poster le panneau expliquant les conditions d\'accès aux salons privés')
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster le panneau (par défaut : ce salon)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    if (!isModerator(interaction.member) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const targetChannel = interaction.options.getChannel('salon') || interaction.channel;

    // Récupère le nom de la catégorie privée pour l'affichage
    const category = interaction.guild.channels.cache.get(config.privateCategoryId);
    const categoryName = category ? category.name : 'Salons privés';

    // Construit la liste des salons mentionnés (Discord affiche automatiquement leur icône + nom)
    const channelMentions = config.privateChannelIds
      .map(id => interaction.guild.channels.cache.get(id))
      .filter(Boolean)
      .map(ch => `<#${ch.id}>`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x1F8B4C)
      .setTitle('🔒 Accès aux salons privés')
      .setDescription('Pour débloquer l\'accès :')
      .addFields(
        {
          name: 'Conditions',
          value: `💎 Booster le serveur **2 fois**\n**OU**\n📝 Mettre \`${config.requiredStatusText}\` dans ton statut Discord`,
        },
        {
          name: '\u200B',
          value: '✅ Le rôle vous sera **automatiquement attribué** dès que la condition est remplie.',
        },
        {
          name: `📁 ${categoryName}`,
          value: channelMentions || '*Aucun salon configuré*',
        }
      )
      .setFooter({ text: '⚠️ Pour toute demande d\'aide / signaler un problème → merci de créer un ticket !' });

    await targetChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Panneau posté dans ${targetChannel}.`, ephemeral: true });
  },
};
