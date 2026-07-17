const { PermissionsBitField } = require('discord.js');
const config = require('../config.json');

/**
 * Vérifie si un membre a le droit d'utiliser les commandes de modération.
 * Autorisé si : Administrateur, permission ModerateMembers/BanMembers,
 * ou possède un des rôles listés dans config.modRoleIds.
 */
function isModerator(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) return true;
  if (config.modRoleIds && config.modRoleIds.length > 0) {
    return member.roles.cache.some(r => config.modRoleIds.includes(r.id));
  }
  return false;
}

module.exports = { isModerator };
