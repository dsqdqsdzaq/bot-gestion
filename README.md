# Bot de Gestion Discord

Bot de modération + système d'accès automatique aux salons privés.

## 📋 Fonctionnalités

**Modération**
- `/ban` — bannir un membre (avec option de suppression des messages récents)
- `/unban` — débannir via ID
- `/kick` — expulser un membre
- `/mute` — rendre muet (timeout Discord natif, jusqu'à 28 jours)
- `/unmute` — retirer le mute
- `/warn` — avertir un membre (message privé + log)
- `/clear` — supprimer des messages en masse

**Accès aux salons privés**
- `/accesprive` — un membre vérifie s'il remplit les conditions
- `/verifboost` — un modérateur valide manuellement un double-boost (voir limitation ci-dessous)
- Détection automatique du statut Discord personnalisé contenant `.gg/xzerox`

---

## ⚠️ Point important : la détection du "boost x2"

L'API Discord **ne fournit pas** le nombre de fois qu'un membre a boosté un serveur. Elle indique seulement si un membre boost *actuellement* (`premiumSince`), pas le nombre de boosts cumulés (un membre avec du Nitro peut appliquer 1, 2 ou 3 boosts à un même serveur).

Donc :
- ✅ La détection du statut `.gg/xzerox` est **100 % automatique et fiable**.
- ⚠️ Pour le "boost x2", il n'existe aucun moyen fiable de l'automatiser via l'API. Solution mise en place : le staff vérifie manuellement dans **Paramètres du serveur → Membres** (Discord y affiche le nombre de boosts par membre), puis utilise `/verifboost @membre true` pour donner l'accès. Le bot se souvient de cette validation.

---

## 🚀 Installation

### 1. Prérequis
- [Node.js](https://nodejs.org) version 18 ou plus récente

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer l'application Discord
1. Va sur https://discord.com/developers/applications
2. Crée une nouvelle application, puis un Bot dans l'onglet "Bot"
3. Récupère le **token** (Bot → Reset Token)
4. Dans l'onglet "Bot", active ces **Privileged Gateway Intents** :
   - `Server Members Intent`
   - `Presence Intent`
   - `Message Content Intent`
5. Récupère le **Client ID** dans l'onglet "General Information"

### 4. Inviter le bot sur ton serveur
Remplace `CLIENT_ID` dans l'URL suivante et ouvre-la dans un navigateur :
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=1099780063446&scope=bot%20applications.commands
```
Ces permissions incluent : bannir, expulser, gérer les rôles/timeout, gérer les messages, voir les salons.

**Important** : le rôle du bot doit être placé **au-dessus** du rôle "Accès Privé" et de tous les rôles des membres qu'il doit pouvoir modérer, dans la liste des rôles du serveur (Paramètres → Rôles).

### 5. Configurer `config.json`
Ouvre `config.json` et remplis :
- `token` : le token du bot
- `clientId` : le Client ID de l'application
- `guildId` : l'ID de ton serveur (clic droit sur le serveur → Copier l'ID, mode développeur requis)
- `accessRoleId` : crée un rôle (ex: `🔓 Accès Privé`) et colle son ID
- `modRoleIds` : (optionnel) IDs des rôles staff autorisés à utiliser les commandes de modération
- `logChannelId` : (optionnel) ID d'un salon pour recevoir les logs de modération

Les IDs des salons privés que tu as fournis sont déjà pré-remplis dans `privateCategoryId` et `privateChannelIds`.

### 6. Configurer les permissions des salons privés
Sur chaque salon privé (et la catégorie), dans les paramètres de permissions du salon :
1. Retire la permission "Voir le salon" pour `@everyone`
2. Ajoute une permission pour le rôle `Accès Privé` (celui mis dans `accessRoleId`) : autorise "Voir le salon" + "Envoyer des messages"

Le bot gère uniquement l'attribution/retrait de ce rôle — les permissions des salons doivent être configurées une seule fois manuellement comme ci-dessus (ou en liant les salons à ce rôle dans leurs overwrites), Discord fera le reste automatiquement.

### 7. Déployer les commandes slash
```bash
npm run deploy
```

### 8. Lancer le bot
```bash
npm start
```

---

## 📁 Structure du projet
```
gestion-bot/
├── commands/          → une commande slash par fichier
├── events/            → gestionnaires d'événements Discord
├── utils/             → permissions, accès privé, logs
├── data/boosts.json   → mémorise les validations de double-boost
├── config.json        → toute la configuration
├── index.js           → point d'entrée du bot
└── deploy-commands.js → enregistre les commandes sur Discord
```

## 🔧 Ajouter un modérateur sans permission Discord "Bannir/Expulser"
Ajoute son ID de rôle dans `config.json` → `modRoleIds`. Ils pourront alors utiliser les commandes même sans les permissions Discord natives, tant que le bot lui-même a les permissions nécessaires.
