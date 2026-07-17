const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, parseEmoji } = require('discord.js');
const { isModerator } = require('../utils/permissions');
const { TICKET_TYPES } = require('../utils/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Poster le panneau de création de tickets')
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster le panneau (par défaut : salon actuel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
    }

    const targetChannel = interaction.options.getChannel('salon') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0x2C2F33)
      .setTitle('🎫 Ticket Support')
      .setDescription(
        '**1. Sujet du ticket**\n' +
        "Ouvre un ticket **uniquement** pour une demande liée à la catégorie concernée.\n" +
        "Les questions **hors sujet** ou **personnelles** ne seront pas prises en compte.\n\n" +
        '**2. Comportement & attitude**\n' +
        'Adopte un ton **respectueux & poli**.\n' +
        'Tout comportement **agressif, impoli ou provocant** entraînera la fermeture immédiate du ticket, voire une **sanction** si nécessaire.\n\n' +
        '**3. Concernant les achats**\n' +
        "Pour les achats, merci de **n'ouvrir un ticket** que si vous **achetez immédiatement**, afin d'éviter les tickets inactifs."
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_open_select')
      .setPlaceholder('Ouvrir un ticket')
      .addOptions(
        Object.entries(TICKET_TYPES).map(([value, info]) => {
          const option = new StringSelectMenuOptionBuilder()
            .setLabel(info.label)
            .setValue(value);

          // Emoji personnalisé du serveur, ex: <:nom:1234567890>
          const parsed = parseEmoji(info.emoji);
          if (parsed && parsed.id) {
            option.setEmoji({ id: parsed.id, name: parsed.name, animated: parsed.animated });
          } else if (parsed && parsed.name && /\p{Extended_Pictographic}/u.test(parsed.name)) {
            // Emoji unicode classique valide, ex: 💠
            option.setEmoji(parsed.name);
          }
          // Sinon (placeholder non configuré ou texte invalide) : pas d'emoji, mais le menu fonctionne quand même

          return option;
        })
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await targetChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Panneau de tickets posté dans ${targetChannel}.`, ephemeral: true });
  },
};
