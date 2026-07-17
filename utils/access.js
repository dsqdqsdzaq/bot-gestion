const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const DB_PATH = path.join(__dirname, '..', 'data', 'boosts.json');

// Petite "base" JSON pour suivre qui a été validé manuellement comme double-booster
function readDb() {
  if (!fs.existsSync(DB_PATH)) return { verifiedDoubleBoosters: [] };
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { verifiedDoubleBoosters: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function isVerifiedDoubleBooster(userId) {
  const db = readDb();
  return db.verifiedDoubleBoosters.includes(userId);
}

function setVerifiedDoubleBooster(userId, value) {
  const db = readDb();
  const has = db.verifiedDoubleBoosters.includes(userId);
  if (value && !has) db.verifiedDoubleBoosters.push(userId);
  if (!value && has) db.verifiedDoubleBoosters = db.verifiedDoubleBoosters.filter(id => id !== userId);
  writeDb(db);
}

/**
 * Vérifie si le statut personnalisé (custom status) du membre contient
 * le texte requis (ex: ".gg/penbyme"), insensible à la casse.
 */
function hasRequiredStatus(member) {
  const presence = member.presence;
  if (!presence || !presence.activities) return false;
  const custom = presence.activities.find(a => a.type === 4); // 4 = CustomStatus
  if (!custom || !custom.state) return false;
  return custom.state.toLowerCase().includes(config.requiredStatusText.toLowerCase());
}

/**
 * Détermine si un membre doit avoir accès aux salons privés :
 * - statut avec ".gg/penbyme", OU
 * - validé manuellement comme "double booster" via /verifboost
 */
function shouldHaveAccess(member) {
  return hasRequiredStatus(member) || isVerifiedDoubleBooster(member.id);
}

/**
 * Ajoute ou retire le rôle d'accès privé selon la situation actuelle du membre.
 */
async function syncAccess(member) {
  if (!config.accessRoleId || config.accessRoleId.startsWith('COLLE_')) return;
  const role = member.guild.roles.cache.get(config.accessRoleId);
  if (!role) return;

  const shouldHave = shouldHaveAccess(member);
  const has = member.roles.cache.has(role.id);

  if (shouldHave && !has) {
    await member.roles.add(role).catch(() => {});
  } else if (!shouldHave && has) {
    await member.roles.remove(role).catch(() => {});
  }
}

module.exports = {
  hasRequiredStatus,
  shouldHaveAccess,
  syncAccess,
  isVerifiedDoubleBooster,
  setVerifiedDoubleBooster,
};
