# Application de Facturation

Solution web full-stack intuitive pour la création, le calcul et l'exportation de factures professionnelles en format PDF.

---

## Sommaire

- [Présentation Général](#présentation-générale)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Technologies Utilisées](#technologies-utilisées)
- [Structure du Projet](#structure-du-projet)
- [Prérequis et Installation](#prérequis-et-installation)
- [Modèles de Données](#modèles-de-données)
- [Endpoints de l'API REST](#endpoints-de-lapi-rest)
- [Design et Expérience Utilisateur](#design-et-expérience-utilisateur)
- [Guide d'Utilisation](#guide-dutilisation)
- [Déploiement en Production](#déploiement-en-production)
- [Licence](#licence)

---

## Présentation Générale

L'**Application de Facturation** est une solution web clé en main conçue pour simplifier l'émission de factures pour les indépendants, petits commerçants et PME. Elle offre une interface réactive adaptée aux mobiles et ordinateurs de bureau, permettant une saisie rapide d'articles avec autocomplétion, le calcul automatique des totaux et de la TVA, la sauvegarde locale temporaire ainsi que la persistance sur base de données MongoDB.

---

## Fonctionnalités Principales

- **Interface Simplifiée et Responsive** : Ergonomie claire avec typographie lisible et disposition adaptée aux écrans tactiles et de bureau.
- **Gestion des Produits et Autocomplétion** : Suggestion dynamique des articles déjà enregistrés et suivi des produits fréquemment utilisés.
- **Calculs Automatiques** : Calcul en temps réel des sous-totaux par ligne, de la TVA (optionnelle) et du total général.
- **Génération PDF Client** : Exportation directe des factures sous forme de document PDF professionnel via `jsPDF`.
- **Historique et Recherche** : Consultation et gestion de l'ensemble des factures sauvegardées en base de données.
- **Sauvegarde Temporaire Hors-Ligne** : Conservation automatique du brouillon de facture en cours dans le `localStorage` du navigateur.

---

## Technologies Utilisées

### Backend
- **Node.js** & **Express.js** : Serveur d'API REST
- **MongoDB** : Base de données NoSQL pour le stockage des factures et produits
- **Mongoose** : ODM (Object Data Modeling) pour MongoDB
- **CORS** & **Dotenv** : Gestion de la sécurité cross-origin et des variables d'environnement

### Frontend
- **React 18** : Bibliothéque d'interface utilisateur (Hooks)
- **Vite** : Outil de construction (bundler) moderne et rapide
- **Tailwind CSS** : Framework CSS utilitaire pour le style responsive
- **React Router DOM v6** : Gestion de la navigation multi-pages
- **jsPDF** : Génération côté client de fichiers PDF
- **Axios** : Client HTTP pour interagir avec l'API backend

---

## Structure du Projet

```text
facturation-app/
├── backend/
│   ├── models/
│   │   ├── Produit.js      # Modèle de données pour les produits
│   │   └── Facture.js      # Modèle de données pour les factures
│   ├── routes/
│   │   ├── produits.js     # Endpoints API pour les produits
│   │   └── factures.js     # Endpoints API pour les factures
│   ├── app.js              # Point d'entrée du serveur Express
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormulaireProduit.jsx  # Composant de saisie de produit
│   │   │   └── LigneProduit.jsx       # Composant d'affichage d'article
│   │   ├── pages/
│   │   │   ├── Accueil.jsx            # Tableau de bord / accueil
│   │   │   ├── Facture.jsx            # Module de création de facture
│   │   │   └── Historique.jsx         # Consultation de l'historique
│   │   ├── utils/
│   │   │   ├── api.js                 # Configuration du client Axios
│   │   │   └── pdfGenerator.js        # Moteur de génération PDF
│   │   ├── App.jsx                    # Routage principal
│   │   ├── main.jsx                   # Initialisation de React
│   │   └── index.css                  # Styles globaux Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── DEMARRAGE.md            # Guide de prise en main rapide
├── SETUP_MONGODB.md        # Guide de configuration de la base MongoDB
└── README.md               # Documentation générale du projet
```

---

## Prérequis et Installation

### Prérequis Système
- **Node.js** : Version 18 ou supérieure
- **MongoDB** : Serveur local actif ou chaîne de connexion MongoDB Atlas (voir `SETUP_MONGODB.md`)
- **Gestionnaire de paquets** : `npm` ou `yarn`

### Configuration du Backend

```bash
cd backend
npm install

# Créer un fichier .env
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/facturation-app
PORT=3001
FRONTEND_URL=http://localhost:5173
EOF

# Lancer le serveur en mode développement
npm run dev
```

Le serveur backend est accessible à l'adresse `http://localhost:3001`.

### Configuration du Frontend

```bash
cd frontend
npm install

# Lancer le serveur de développement Vite
npm run dev
```

L'application web est accessible à l'adresse `http://localhost:5173`.

---

## Modèles de Données

### Schéma Produit (`Produit`)
```javascript
{
  nom: String,                // Requis, indexé pour recherche textuelle
  prixUnitaire: Number,       // Requis, valeur minimale: 0
  description: String,        // Optionnel
  nbUtilisations: Number,     // Par défaut: 1 (compteur de popularité)
  derniereUtilisation: Date   // Par défaut: Date courante
}
```

### Schéma Facture (`Facture`)
```javascript
{
  numero: String,             // Requis, unique (Format: FACT-YYYYMMDD-XXXX)
  date: Date,                 // Requis, par défaut: Date courante
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
  sousTotal: Number,          // Somme des totaux des lignes
  tva: {
    taux: Number,             // Taux de TVA en pourcentage
    montant: Number           // Montant calculé de la TVA
  },
  totalGeneral: Number,       // Sous-total + Montant TVA
  devise: String,             // Par défaut: "FCFA"
  remarques: String           // Notes ou conditions particulières
}
```

---

## Endpoints de l'API REST

### API Produits (`/api/produits`)

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/produits` | Récupère la liste des produits (triés par utilisation) |
| `GET` | `/api/produits/recherche?q=nom` | Recherche dynamique de produits par nom |
| `GET` | `/api/produits/recents` | Liste des produits les plus fréquemment utilisés |
| `POST` | `/api/produits` | Crée ou met à jour un produit existant |
| `PUT` | `/api/produits/:id` | Modifie les informations d'un produit |
| `DELETE` | `/api/produits/:id` | Supprime un produit du catalogue |

### API Factures (`/api/factures`)

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/factures` | Récupère la liste de toutes les factures |
| `GET` | `/api/factures/:id` | Récupère le détail d'une facture spécifique |
| `POST` | `/api/factures` | Enregistre une nouvelle facture en base de données |
| `DELETE` | `/api/factures/:id` | Supprime une facture enregistrée |

---

## Design et Expérience Utilisateur

L'application repose sur des principes d'ergonomie modernes :
- **Conception Mobile-First** : Priorité donnée à la simplicité d'utilisation sur smartphone et tablette.
- **Éléments Visuels Lisibles** : Boutons de grande taille et typographie claire facilitant la saisie.
- **Feedback Immédiat** : Notification des actions et mise à jour dynamique des montants sans rechargement de page.

---

## Guide d'Utilisation

### Création d'une Facture
1. Naviguer vers **Nouvelle Facture**.
2. Renseigner les coordonnées de l'émetteur (entreprise) si nécessaire.
3. Ajouter des articles au panier via la recherche/autocomplétion ou les suggestions rapides.
4. Ajuster les quantités et vérifier le calcul automatique des totaux.
5. Indiquer le taux de TVA applicable et des remarques complémentaires si requis.
6. Cliquer sur **Générer et Sauvegarder** pour enregistrer la facture et télécharger le document PDF.

### Consultation de l'Historique
1. Naviguer vers l'onglet **Historique**.
2. Parcourir la liste chronologique des factures émise.
3. Télécharger à nouveau le PDF d'une facture ou supprimer un enregistrement si besoin.

---

## Déploiement en Production

### Backend (Render, Railway, Heroku)
1. Déployer le dossier `backend/` sur votre hébergeur Node.js.
2. Définir les variables d'environnement en production : `MONGODB_URI`, `PORT`, `FRONTEND_URL`.

### Frontend (Vercel, Netlify)
1. Déployer le dossier `frontend/`.
2. Définir la commande de build (`npm run build`) et le dossier de sortie (`dist`).

---

## Licence

Projet distribué sous licence **ISC**.

