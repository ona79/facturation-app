# 🗄️ Configuration MongoDB

## Problème : Erreur de connexion MongoDB

Si vous voyez cette erreur :
```
❌ Erreur de connexion à MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

Cela signifie que MongoDB n'est pas démarré ou n'est pas installé.

## Solutions

### Option 1 : MongoDB Atlas (Recommandé - Gratuit et Simple) ⭐

MongoDB Atlas est un service cloud gratuit qui ne nécessite pas d'installation locale.

1. **Créer un compte** : https://www.mongodb.com/cloud/atlas/register

2. **Créer un cluster gratuit** :
   - Cliquez sur "Build a Database"
   - Choisissez "FREE" (M0 Sandbox)
   - Choisissez votre région (le plus proche de vous)
   - Cliquez sur "Create"

3. **Créer un utilisateur** :
   - Security → Database Access → Add New Database User
   - Username : `facturation-user`
   - Password : Générez un mot de passe fort
   - Database User Privileges : "Atlas admin"
   - Cliquez sur "Add User"

4. **Autoriser l'accès réseau** :
   - Security → Network Access → Add IP Address
   - Cliquez sur "Allow Access from Anywhere" (0.0.0.0/0) pour le développement
   - Ou ajoutez votre IP spécifique pour la production
   - Cliquez sur "Confirm"

5. **Récupérer l'URI de connexion** :
   - Clusters → Connect → Connect your application
   - Copiez l'URI qui ressemble à :
     ```
     mongodb+srv://facturation-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Remplacez `<password>` par votre mot de passe réel

6. **Configurer le backend** :
   ```bash
   cd backend
   # Créer le fichier .env
   cat > .env << EOF
   MONGODB_URI=mongodb+srv://facturation-user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/facturation-app?retryWrites=true&w=majority
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   EOF
   ```

7. **Redémarrer le backend** :
   ```bash
   npm start
   ```

✅ Vous devriez voir : `✅ Connexion à MongoDB réussie`

---

### Option 2 : MongoDB Local (Linux/Ubuntu)

1. **Installer MongoDB** :
   ```bash
   # Importer la clé publique
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

   # Ajouter le repository
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

   # Mettre à jour et installer
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Démarrer MongoDB** :
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Pour démarrer automatiquement au boot
   ```

3. **Vérifier que MongoDB fonctionne** :
   ```bash
   sudo systemctl status mongod
   ```

4. **Créer le fichier .env** (si pas déjà fait) :
   ```bash
   cd backend
   cat > .env << EOF
   MONGODB_URI=mongodb://localhost:27017/facturation-app
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   EOF
   ```

5. **Redémarrer le backend** :
   ```bash
   npm start
   ```

---

### Option 3 : MongoDB avec Docker

Si vous avez Docker installé :

```bash
# Démarrer MongoDB dans un conteneur
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:latest

# Créer le fichier .env dans backend/
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/facturation-app
PORT=3001
FRONTEND_URL=http://localhost:5173
EOF
```

---

## Vérification

Une fois MongoDB configuré, redémarrez le backend :

```bash
cd backend
npm start
```

Vous devriez voir :
```
✅ Connexion à MongoDB réussie
🚀 Serveur démarré sur le port 3001
```

---

## Dépannage

### Le backend démarre mais l'historique est vide

- Vérifiez que MongoDB est bien connecté
- Vérifiez les erreurs dans la console du navigateur (F12)
- Vérifiez que le backend répond sur http://localhost:3001/api/health

### L'erreur persiste

- Vérifiez que le port 27017 n'est pas utilisé par un autre service
- Vérifiez les logs MongoDB : `sudo journalctl -u mongod`
- Pour MongoDB Atlas, vérifiez que votre IP est autorisée

---

## Recommandation

Pour un développement rapide et sans installation, utilisez **MongoDB Atlas** (Option 1). C'est gratuit, ne nécessite pas d'installation locale, et fonctionne partout.

