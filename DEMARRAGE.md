# 🚀 Guide de Démarrage Rapide

## Étapes pour lancer l'application

### 1. Installer MongoDB

**Option A : MongoDB Local**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Télécharger depuis https://www.mongodb.com/try/download/community
```

**Option B : MongoDB Atlas (Cloud - Gratuit)**
1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Récupérer l'URI de connexion (ex: `mongodb+srv://user:password@cluster.mongodb.net/facturation-app`)

### 2. Configurer le Backend

```bash
cd backend
npm install

# Créer le fichier .env
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/facturation-app
PORT=3001
FRONTEND_URL=http://localhost:5173
EOF

# Démarrer le serveur (mode développement)
npm run dev
```

Le backend devrait démarrer sur `http://localhost:3001`

### 3. Configurer le Frontend

```bash
# Dans un nouveau terminal
cd frontend
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend devrait démarrer sur `http://localhost:5173`

### 4. Accéder à l'application

Ouvrir votre navigateur et aller sur : **http://localhost:5173**

## ✅ Vérification

1. Vous devriez voir la page d'accueil avec deux gros boutons
2. Cliquer sur "Nouvelle Facture"
3. Ajouter un produit de test
4. Cliquer sur "Générer et Sauvegarder"
5. Un PDF devrait se télécharger
6. Retourner à l'accueil et cliquer sur "Historique"
7. Votre facture devrait apparaître dans la liste

## 🔧 Dépannage

### Le backend ne démarre pas
- Vérifier que MongoDB est bien installé et démarré
- Vérifier l'URI MongoDB dans le fichier `.env`
- Vérifier que le port 3001 n'est pas déjà utilisé

### Le frontend ne se connecte pas au backend
- Vérifier que le backend est bien démarré
- Vérifier la configuration du proxy dans `vite.config.js`
- Vérifier les erreurs dans la console du navigateur

### Les données ne se sauvegardent pas
- Vérifier la connexion à MongoDB
- Vérifier les logs du backend pour les erreurs
- Vérifier que MongoDB est bien accessible

## 📝 Notes

- Le mode développement utilise `nodemon` pour recharger automatiquement le backend
- Les modifications frontend sont rechargées automatiquement par Vite
- Les données sont sauvegardées dans MongoDB
- Les factures en cours sont aussi sauvegardées dans le localStorage du navigateur

## 🎯 Prochaines Étapes

1. Personnaliser les informations de l'entreprise par défaut
2. Ajouter votre logo d'entreprise
3. Configurer la TVA si nécessaire
4. Déployer l'application en production (voir README.md)

---

**Bon développement ! 🚀**
