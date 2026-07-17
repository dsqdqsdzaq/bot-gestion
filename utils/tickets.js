const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

const TICKET_TYPES = {
  boost: { label: "J'ai boost le serv", emoji: config.ticketEmojis?.boost || '💠', title: '💠 Ticket — Boost du serveur', categoryKey: 'aide' },
  aide: { label: "Demande d'aide", emoji: config.ticketEmojis?.aide || '🙋', title: "🙋 Ticket — Demande d'aide", categoryKey: 'aide' },
  achat: { label: 'Achat de base', emoji: config.ticketEmojis?.achat || '🛒', title: '🛒 Ticket — Achat', categoryKey: 'achat' },
  owner: { label: 'Contact owner', emoji: config.ticketEmojis?.owner || '👑', title: '👑 Ticket — Contact owner', categoryKey: 'owner' },
};

function findExistingTicket(guild, userId) {
  const categoryIds = Object.values(config.ticketCategories || {});
  return guild.channels.cache.find(
    c => categoryIds.includes(c.parentId) && c.topic === `ticket-owner:${userId}`
  );
}

async function createTicket(interaction, type) {
  const guild = interaction.guild;
  const user = interaction.user;
  const info = TICKET_TYPES[type];

  if (!info) {
    return interaction.reply({ content: '❌ Type de ticket inconnu.', ephemeral: true });
  }

  if (!config.ticketCategories || !config.ticketCategories[info.categoryKey] || config.ticketCategories[info.categoryKey].startsWith('COLLE_')) {
    return interaction.reply({ content: `❌ La catégorie "${info.categoryKey}" n'est pas encore configurée dans config.json (ticketCategories).`, ephemeral: true });
  }

  const category = guild.channels.cache.get(config.ticketCategories[info.categoryKey]);
  if (!category) {
    return interaction.reply({ content: `❌ Catégorie de tickets introuvable pour "${info.categoryKey}". Vérifie ticketCategories dans config.json.`, ephemeral: true });
  }

  const existing = findExistingTicket(guild, user.id);
  if (existing) {
    return interaction.reply({ content: `⚠️ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });
  }

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
    { id: guild.members.me.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
  ];

  if (config.ticketStaffRoleId) {
    overwrites.push({
      id: config.ticketStaffRoleId,
      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${user.username}`.toLowerCase().slice(0, 90),
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `ticket-owner:${user.id}`,
    permissionOverwrites: overwrites,
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(info.title)
    .setDescription(
      `Bienvenue ${user} 👋\n\nUn membre du staff va s'occuper de ta demande sous peu.\nMerci de décrire ta demande en détail ci-dessous.`
    )
    .setFooter({ text: 'Un membre du staff peut fermer ce ticket avec le bouton ci-dessous.' })
    .setTimestamp();

  const closeButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('🔒 Fermer le ticket')
      .setStyle(ButtonStyle.Danger)
  );

  const staffMention = config.ticketStaffRoleId ? `<@&${config.ticketStaffRoleId}>` : '';

  await channel.send({ content: `${staffMention} ${user}`.trim(), embeds: [embed], components: [closeButton] });
  await interaction.reply({ content: `✅ Ton ticket a été créé : ${channel}`, ephemeral: true });
}

async function closeTicket(interaction) {
  const channel = interaction.channel;

  if (!channel.topic || !channel.topic.startsWith('ticket-owner:')) {
    return interaction.reply({ content: "❌ Ce salon n'est pas un ticket.", ephemeral: true });
  }

  await interaction.reply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });

  if (config.ticketLogChannelId) {
    const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannelId);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x99AAB5)
        .setTitle('🔒 Ticket fermé')
        .addFields(
          { name: 'Salon', value: `#${channel.name}` },
          { name: 'Fermé par', value: `${interaction.user.tag}` }
        )
        .setTimestamp();
      logChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  setTimeout(() => {
    channel.delete().catch(() => {});
  }, 5000);
}

module.exports = { TICKET_TYPES, createTicket, closeTicket };
