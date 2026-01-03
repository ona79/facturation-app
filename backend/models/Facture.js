import mongoose from 'mongoose';

/**
 * Schéma pour un produit dans une facture
 * Stocke les détails d'un produit au moment de la facturation
 */
const produitFactureSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prixUnitaire: {
    type: Number,
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    required: true
  }
}, { _id: false }); // Pas besoin d'ID pour les sous-documents

/**
 * Modèle de données pour une facture complète
 */
const factureSchema = new mongoose.Schema({
  // Numéro de facture unique généré automatiquement
  numero: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Date de la facture
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Informations sur l'entreprise
  entreprise: {
    nom: {
      type: String,
      default: 'Mon Entreprise'
    },
    logo: {
      type: String, // URL ou chemin vers le logo
      default: ''
    },
    adresse: {
      type: String,
      default: ''
    },
    telephone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  // Liste des produits facturés
  produits: [produitFactureSchema],
  // Totaux calculés
  sousTotal: {
    type: Number,
    required: true,
    default: 0
  },
  // TVA (optionnelle)
  tva: {
    taux: {
      type: Number,
      default: 0
    },
    montant: {
      type: Number,
      default: 0
    }
  },
  totalGeneral: {
    type: Number,
    required: true,
    default: 0
  },
  // Devise utilisée
  devise: {
    type: String,
    default: 'FCFA'
  },
  // Remarques ou notes supplémentaires
  remarques: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index pour rechercher rapidement par date
factureSchema.index({ date: -1 });

const Facture = mongoose.model('Facture', factureSchema);

export default Facture;
