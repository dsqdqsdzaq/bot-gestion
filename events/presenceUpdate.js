const { syncAccess } = require('../utils/access');

module.exports = {
  name: 'presenceUpdate',
  async execute(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member) return;
    await syncAccess(newPresence.member);
  },
};
