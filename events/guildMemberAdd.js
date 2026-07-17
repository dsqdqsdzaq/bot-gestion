const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // 1. Attribution automatique du rôle
    if (config.welcomeRoleId) {
      const role = member.guild.roles.cache.get(config.welcomeRoleId);
      if (role) {
        await member.roles.add(role).catch(err => {
          console.error(`❌ Impossible d'ajouter le rôle de bienvenue à ${member.user.tag} :`, err.message);
        });
      } else {
        console.error(`❌ Rôle de bienvenue introuvable (ID: ${config.welcomeRoleId}). Vérifie que le bot est bien au-dessus de ce rôle et que l'ID est correct.`);
      }
    }

    // 2. Message dans le salon de bienvenue
    if (config.welcomeChannelId) {
      const channel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (channel) {
        const memberCount = member.guild.memberCount;
        channel.send(
          `${member} vient de **rejoindre le serveur**. Nous sommes désormais **${memberCount}**`
        ).catch(err => {
          console.error('❌ Impossible d\'envoyer le message de bienvenue :', err.message);
        });
      } else {
        console.error(`❌ Salon de bienvenue introuvable (ID: ${config.welcomeChannelId}).`);
      }
    }
  },
};
