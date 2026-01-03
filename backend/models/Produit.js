import mongoose from 'mongoose';

/**
 * Modèle de données pour un produit
 * Chaque produit contient les informations nécessaires à la facturation
 */
const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    index: true // Index pour l'auto-complétion rapide
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  // Compteur d'utilisation pour suggérer les produits les plus utilisés
  nbUtilisations: {
    type: Number,
    default: 1
  },
  // Date de dernière utilisation
  derniereUtilisation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index composé pour recherche rapide par nom
produitSchema.index({ nom: 'text' });

const Produit = mongoose.model('Produit', produitSchema);

export default Produit;
