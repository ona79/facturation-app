import axios from 'axios';

/**
 * Configuration axios pour toutes les requêtes API.
 * On utilise la variable d'environnement définie sur Render (VITE_API_URL).
 * Si elle n'est pas trouvée, on utilise localhost pour le développement.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Gestion des produits
 * Note : On ajoute /api devant chaque route pour correspondre au backend
 */
export const produitsAPI = {
  // Récupérer tous les produits
  getAll: () => api.get('/api/produits'),
  
  // Rechercher des produits (auto-complétion)
  rechercher: (query) => api.get(`/api/produits/recherche?q=${encodeURIComponent(query)}`),
  
  // Produits récemment utilisés
  getRecents: () => api.get('/api/produits/recents'),
  
  // Créer ou mettre à jour un produit
  creer: (donnees) => api.post('/api/produits', donnees),
  
  // Mettre à jour un produit
  mettreAJour: (id, donnees) => api.put(`/api/produits/${id}`, donnees),
  
  // Supprimer un produit
  supprimer: (id) => api.delete(`/api/produits/${id}`)
};

/**
 * Gestion des factures
 */
export const facturesAPI = {
  // Récupérer toutes les factures
  getAll: () => api.get('/api/factures'),
  
  // Récupérer une facture par ID
  getById: (id) => api.get(`/api/factures/${id}`),
  
  // Créer une nouvelle facture
  creer: (donnees) => api.post('/api/factures', donnees),
  
  // Supprimer une facture
  supprimer: (id) => api.delete(`/api/factures/${id}`)
};

export default api;