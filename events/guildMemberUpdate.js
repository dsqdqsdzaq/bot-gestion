const { syncAccess } = require('../utils/access');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    // Se déclenche notamment quand premiumSince change (le membre commence/arrête de booster).
    // Rappel : Discord n'expose pas le NOMBRE de boosts d'un membre via l'API,
    // seulement s'il boost actuellement. Le "double boost" reste donc validé
    // manuellement via /verifboost après vérification dans Server Settings > Membres.
    await syncAccess(newMember);
  },
};
