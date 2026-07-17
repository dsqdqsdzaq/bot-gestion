module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    client.user.setActivity('gestion du serveur', { type: 3 }); // 3 = Watching
  },
};
