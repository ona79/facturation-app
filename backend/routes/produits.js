import express from 'express';
import Produit from '../models/Produit.js';

const router = express.Router();

/**
 * GET /api/produits
 * Récupère tous les produits, triés par utilisation récente
 */
router.get('/', async (req, res) => {
  try {
    const produits = await Produit.find()
      .sort({ derniereUtilisation: -1, nbUtilisations: -1 })
      .limit(50); // Limite pour éviter de surcharger
    
    res.json({
      success: true,
      data: produits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
});

/**
 * GET /api/produits/recherche?q=nom
 * Recherche de produits par nom (pour auto-complétion)
 */
router.get('/recherche', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query.trim()) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Recherche insensible à la casse et partielle
    const produits = await Produit.find({
      nom: { $regex: query, $options: 'i' }
    })
    .sort({ nbUtilisations: -1, derniereUtilisation: -1 })
    .limit(10);

    res.json({
      success: true,
      data: produits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
});

/**
 * GET /api/produits/recents
 * Récupère les produits les plus récemment utilisés (pour accès rapide)
 */
router.get('/recents', async (req, res) => {
  try {
    const produits = await Produit.find()
      .sort({ derniereUtilisation: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: produits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits récents',
      error: error.message
    });
  }
});

/**
 * POST /api/produits
 * Crée un nouveau produit ou met à jour un existant
 */
router.post('/', async (req, res) => {
  try {
    const { nom, prixUnitaire, description } = req.body;

    if (!nom || prixUnitaire === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le prix unitaire sont requis'
      });
    }

    // Vérifier si le produit existe déjà (insensible à la casse)
    let produit = await Produit.findOne({
      nom: { $regex: `^${nom}$`, $options: 'i' }
    });

    if (produit) {
      // Mettre à jour le produit existant
      produit.prixUnitaire = prixUnitaire;
      if (description !== undefined) produit.description = description;
      produit.nbUtilisations += 1;
      produit.derniereUtilisation = new Date();
      await produit.save();
    } else {
      // Créer un nouveau produit
      produit = new Produit({
        nom: nom.trim(),
        prixUnitaire: Number(prixUnitaire),
        description: description || ''
      });
      await produit.save();
    }

    res.status(201).json({
      success: true,
      data: produit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création/mise à jour du produit',
      error: error.message
    });
  }
});

/**
 * PUT /api/produits/:id
 * Met à jour un produit existant
 */
router.put('/:id', async (req, res) => {
  try {
    const { nom, prixUnitaire, description } = req.body;
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (nom) produit.nom = nom;
    if (prixUnitaire !== undefined) produit.prixUnitaire = prixUnitaire;
    if (description !== undefined) produit.description = description;

    await produit.save();

    res.json({
      success: true,
      data: produit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
});

/**
 * DELETE /api/produits/:id
 * Supprime un produit
 */
router.delete('/:id', async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
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
