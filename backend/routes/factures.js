import express from 'express';
import mongoose from 'mongoose';
import Facture from '../models/Facture.js';
import Produit from '../models/Produit.js';

const router = express.Router();

/**
 * Génère un numéro de facture unique
 * Format: FACT-YYYYMMDD-XXXX
 */
function genererNumeroFacture() {
  const date = new Date();
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `FACT-${annee}${mois}${jour}-${random}`;
}

/**
 * Calcule les totaux d'une facture
 */
function calculerTotaux(produits, tauxTVA = 0) {
  const sousTotal = produits.reduce((sum, p) => sum + p.total, 0);
  const montantTVA = sousTotal * (tauxTVA / 100);
  const totalGeneral = sousTotal + montantTVA;

  return {
    sousTotal: Math.round(sousTotal * 100) / 100,
    tva: {
      taux: tauxTVA,
      montant: Math.round(montantTVA * 100) / 100
    },
    totalGeneral: Math.round(totalGeneral * 100) / 100
  };
}

/**
 * GET /api/factures
 * Récupère toutes les factures, triées par date décroissante
 */
router.get('/', async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Base de données non disponible. Vérifiez que MongoDB est démarré.',
        error: 'MongoDB not connected'
      });
    }

    const factures = await Facture.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(100); // Limite pour les performances
    
    res.json({
      success: true,
      data: factures
    });
  } catch (error) {
    console.error('Erreur récupération factures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/factures/:id
 * Récupère une facture spécifique par son ID
 */
router.get('/:id', async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);

    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    res.json({
      success: true,
      data: facture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture',
      error: error.message
    });
  }
});

/**
 * POST /api/factures
 * Crée une nouvelle facture
 * Met aussi à jour les statistiques des produits utilisés
 */
router.post('/', async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Base de données non disponible. Impossible de sauvegarder la facture.',
        error: 'MongoDB not connected'
      });
    }

    const { produits, entreprise, devise, remarques, tauxTVA } = req.body;

    if (!produits || produits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un produit est requis'
      });
    }

    // Vérifier que tous les produits ont les champs requis
    const produitsValides = produits.map(p => {
      if (!p.nom || p.prixUnitaire === undefined || !p.quantite) {
        throw new Error('Chaque produit doit avoir un nom, un prix unitaire et une quantité');
      }

      return {
        nom: p.nom,
        prixUnitaire: Number(p.prixUnitaire),
        quantite: Number(p.quantite),
        description: p.description || '',
        total: Number(p.prixUnitaire) * Number(p.quantite)
      };
    });

    // Calculer les totaux
    const totaux = calculerTotaux(produitsValides, tauxTVA || 0);

    // Générer un numéro de facture unique
    let numero = genererNumeroFacture();
    let existe = await Facture.findOne({ numero });
    
    // Si le numéro existe déjà, en générer un nouveau (très rare)
    while (existe) {
      numero = genererNumeroFacture();
      existe = await Facture.findOne({ numero });
    }

    // Créer la facture
    const facture = new Facture({
      numero,
      date: new Date(),
      entreprise: entreprise || {},
      produits: produitsValides,
      sousTotal: totaux.sousTotal,
      tva: totaux.tva,
      totalGeneral: totaux.totalGeneral,
      devise: devise || 'FCFA',
      remarques: remarques || ''
    });

    await facture.save();

    // Mettre à jour les statistiques des produits utilisés
    for (const produitFacture of produitsValides) {
      await Produit.findOneAndUpdate(
        { nom: { $regex: `^${produitFacture.nom}$`, $options: 'i' } },
        {
          $inc: { nbUtilisations: 1 },
          $set: { derniereUtilisation: new Date() }
        },
        { upsert: false } // Ne pas créer si n'existe pas
      );
    }

    res.status(201).json({
      success: true,
      data: facture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture',
      error: error.message
    });
  }
});

/**
 * DELETE /api/factures/:id
 * Supprime une facture
 */
router.delete('/:id', async (req, res) => {
  try {
    const facture = await Facture.findByIdAndDelete(req.params.id);

    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

export default router;
