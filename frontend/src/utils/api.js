import axios from 'axios';

/**
 * Configuration axios pour toutes les requêtes API
 * Point d'entrée unique pour communiquer avec le backend
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Gestion des produits
 */
export const produitsAPI = {
  // Récupérer tous les produits
  getAll: () => api.get('/produits'),
  
  // Rechercher des produits (auto-complétion)
  rechercher: (query) => api.get(`/produits/recherche?q=${encodeURIComponent(query)}`),
  
  // Produits récemment utilisés
  getRecents: () => api.get('/produits/recents'),
  
  // Créer ou mettre à jour un produit
  creer: (donnees) => api.post('/produits', donnees),
  
  // Mettre à jour un produit
  mettreAJour: (id, donnees) => api.put(`/produits/${id}`, donnees),
  
  // Supprimer un produit
  supprimer: (id) => api.delete(`/produits/${id}`)
};

/**
 * Gestion des factures
 */
export const facturesAPI = {
  // Récupérer toutes les factures
  getAll: () => api.get('/factures'),
  
  // Récupérer une facture par ID
  getById: (id) => api.get(`/factures/${id}`),
  
  // Créer une nouvelle facture
  creer: (donnees) => api.post('/factures', donnees),
  
  // Supprimer une facture
  supprimer: (id) => api.delete(`/factures/${id}`)
};

export default api;
