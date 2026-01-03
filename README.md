# 📄 Application de Facturation

Application web simple et intuitive pour générer des factures de paiement, optimisée pour mobile et PC.

## ✨ Fonctionnalités

- ✅ **Interface ultra simple** : Gros boutons, gros textes, icônes claires
- ✅ **Gestion des produits** : Ajout, modification, suppression avec auto-complétion
- ✅ **Calculs automatiques** : Total par produit et total général
- ✅ **Produits récents** : Accès rapide en un clic
- ✅ **Génération PDF** : Factures professionnelles en format PDF
- ✅ **Historique** : Toutes les factures sauvegardées automatiquement
- ✅ **Auto-sauvegarde** : Sauvegarde automatique dans localStorage
- ✅ **Mobile-first** : Interface optimisée pour téléphone et PC

## 🛠️ Technologies

### Backend
- **Node.js** + **Express** : API REST
- **MongoDB** : Base de données
- **Mongoose** : ODM pour MongoDB

### Frontend
- **React** (Hooks) : Framework UI
- **Vite** : Build tool moderne
- **Tailwind CSS** : Styles utilitaires
- **React Router** : Navigation
- **jsPDF** : Génération de PDFs
- **Axios** : Requêtes HTTP

## 📁 Structure du Projet

```
facturation-app/
├── backend/
│   ├── models/
│   │   ├── Produit.js      # Modèle de données produit
│   │   └── Facture.js       # Modèle de données facture
│   ├── routes/
│   │   ├── produits.js      # Routes API produits
│   │   └── factures.js      # Routes API factures
│   ├── app.js               # Point d'entrée serveur
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormulaireProduit.jsx  # Formulaire d'ajout produit
│   │   │   └── LigneProduit.jsx       # Affichage ligne produit
│   │   ├── pages/
│   │   │   ├── Accueil.jsx            # Page d'accueil
│   │   │   ├── Facture.jsx            # Page création facture
│   │   │   └── Historique.jsx         # Page historique
│   │   ├── utils/
│   │   │   ├── api.js                 # Configuration API
│   │   │   └── pdfGenerator.js        # Génération PDF
│   │   ├── App.jsx                    # Composant principal
│   │   ├── main.jsx                   # Point d'entrée React
│   │   └── index.css                  # Styles globaux
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- MongoDB (local ou MongoDB Atlas) - **Voir [SETUP_MONGODB.md](SETUP_MONGODB.md) pour la configuration**
- npm ou yarn

### Backend

```bash
cd backend
npm install

# Créer un fichier .env
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/facturation-app
PORT=3001
FRONTEND_URL=http://localhost:5173
EOF

# ⚠️ IMPORTANT : Configurez MongoDB avant de démarrer
# Voir SETUP_MONGODB.md pour les instructions détaillées

# Démarrer le serveur
npm start
# ou en mode développement
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

**📝 Note** : Si MongoDB n'est pas configuré, le serveur démarrera mais affichera un avertissement. Consultez [SETUP_MONGODB.md](SETUP_MONGODB.md) pour résoudre ce problème.

### Frontend

```bash
cd frontend
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📊 Schéma de Base de Données

### Produit
```javascript
{
  nom: String (requis, indexé),
  prixUnitaire: Number (requis, min: 0),
  description: String (optionnel),
  nbUtilisations: Number (défaut: 1),
  derniereUtilisation: Date (défaut: maintenant)
}
```

### Facture
```javascript
{
  numero: String (requis, unique, format: FACT-YYYYMMDD-XXXX),
  date: Date (requis, défaut: maintenant),
  entreprise: {
    nom: String,
    logo: String,
    adresse: String,
    telephone: String,
    email: String
  },
  produits: [{
    nom: String,
    prixUnitaire: Number,
    quantite: Number,
    description: String,
    total: Number
  }],
  sousTotal: Number,
  tva: {
    taux: Number (défaut: 0),
    montant: Number (défaut: 0)
  },
  totalGeneral: Number,
  devise: String (défaut: "FCFA"),
  remarques: String
}
```

## 🎨 Design & UX

### Principes
- **Mobile-first** : Interface conçue d'abord pour mobile
- **Gros éléments** : Boutons et textes de taille importante
- **Icônes claires** : Emojis et symboles pour navigation intuitive
- **Peu de texte** : Messages courts et simples
- **Feedback visuel** : Animations et transitions subtiles

### Couleurs
- Primary: Bleu (#2563eb)
- Success: Vert (#10b981)
- Danger: Rouge (#ef4444)
- Background: Gris clair (#f9fafb)

## 📱 Utilisation

### Créer une Facture

1. Cliquer sur "Nouvelle Facture"
2. Remplir les informations de l'entreprise (optionnel)
3. Ajouter des produits :
   - Utiliser les produits récents (accès rapide)
   - Ou créer un nouveau produit avec le formulaire
   - L'auto-complétion suggère les produits existants
4. Vérifier les totaux (calculés automatiquement)
5. Ajouter des remarques si nécessaire
6. Cliquer sur "Générer et Sauvegarder"

### Consulter l'Historique

1. Cliquer sur "Historique"
2. Voir toutes les factures créées
3. Télécharger le PDF d'une facture
4. Voir les détails d'une facture
5. Supprimer une facture si nécessaire

## 🔧 API Endpoints

### Produits

- `GET /api/produits` : Liste tous les produits
- `GET /api/produits/recherche?q=nom` : Recherche produits
- `GET /api/produits/recents` : Produits récemment utilisés
- `POST /api/produits` : Crée/met à jour un produit
- `PUT /api/produits/:id` : Met à jour un produit
- `DELETE /api/produits/:id` : Supprime un produit

### Factures

- `GET /api/factures` : Liste toutes les factures
- `GET /api/factures/:id` : Récupère une facture
- `POST /api/factures` : Crée une nouvelle facture
- `DELETE /api/factures/:id` : Supprime une facture

## 🚢 Déploiement

### Backend (ex: Heroku, Railway, Render)

1. Créer un compte sur la plateforme
2. Connecter votre repository
3. Configurer les variables d'environnement :
   - `MONGODB_URI` : URI de connexion MongoDB
   - `PORT` : Port du serveur (généré automatiquement sur certaines plateformes)
   - `FRONTEND_URL` : URL du frontend pour CORS

### Frontend (ex: Vercel, Netlify)

1. Créer un compte sur la plateforme
2. Connecter votre repository
3. Configurer :
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables si nécessaire

### MongoDB

- **Local** : Installer MongoDB localement
- **MongoDB Atlas** : Service cloud gratuit (recommandé)
  1. Créer un compte sur mongodb.com
  2. Créer un cluster gratuit
  3. Récupérer l'URI de connexion
  4. L'ajouter dans les variables d'environnement

## 📝 Notes

- Les factures en cours sont sauvegardées automatiquement dans `localStorage`
- Les produits sont triés par utilisation récente pour faciliter l'accès
- Le format PDF est simple et professionnel
- L'application fonctionne hors ligne pour la création (avec localStorage)
- La synchronisation avec le serveur se fait lors de la génération

## 🤝 Contribution

Ce projet est conçu pour être simple et maintenable. Les contributions sont les bienvenues !

## 📄 Licence

ISC

---

**Développé avec ❤️ pour une facturation simple et accessible**
