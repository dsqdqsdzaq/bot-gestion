const config = require('../config.json');

async function sendLog(guild, embed) {
  if (!config.logChannelId) return;
  const channel = guild.channels.cache.get(config.logChannelId);
  if (!channel) return;
  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };
