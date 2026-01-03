import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facturesAPI } from '../utils/api';
import { genererPDF } from '../utils/pdfGenerator';
import { format } from 'date-fns';

/**
 * Page d'historique des factures
 * Affiche toutes les factures créées et permet de les télécharger
 */
function Historique() {
  const navigate = useNavigate();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacture, setSelectedFacture] = useState(null);

  // Charger les factures au montage
  useEffect(() => {
    chargerFactures();
  }, []);

  // Recharger les factures quand la page redevient visible (retour depuis création)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        chargerFactures();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const chargerFactures = async () => {
    try {
      setLoading(true);
      const response = await facturesAPI.getAll();
      setFactures(response.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      // Gestion d'erreur améliorée
      if (error.response?.status === 500) {
        alert('⚠️ Impossible de se connecter à la base de données.\n\nVérifiez que MongoDB est démarré ou configurez MongoDB Atlas.');
      } else if (error.code === 'ECONNREFUSED' || !error.response) {
        alert('⚠️ Le serveur backend n\'est pas accessible.\n\nAssurez-vous que le backend est démarré sur le port 3001.');
      } else {
        alert('Erreur lors du chargement des factures');
      }
      setFactures([]); // Afficher une liste vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette facture ?')) {
      return;
    }

    try {
      await facturesAPI.supprimer(id);
      chargerFactures();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTelechargerPDF = (facture) => {
    genererPDF(facture);
  };

  const handleDupliquer = (facture) => {
    // Sauvegarder la facture dans localStorage pour qu'elle soit chargée dans la page Facture
    const factureADupliquer = {
      produits: facture.produits,
      entreprise: facture.entreprise,
      remarques: facture.remarques || '',
      timestamp: Date.now()
    };
    localStorage.setItem('facture_en_cours', JSON.stringify(factureADupliquer));
    navigate('/facture');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-semibold text-cyan-700 hover:text-cyan-900 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            📋 Historique
          </h1>
          <button
            onClick={() => navigate('/facture')}
            className="btn-primary"
          >
            ➕ Nouvelle
          </button>
        </div>

        {/* Liste des factures */}
        {factures.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold mb-2 text-cyan-800">Aucune facture</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Créez votre première facture pour commencer
            </p>
            <button
              onClick={() => navigate('/facture')}
              className="btn-primary"
            >
              ➕ Créer une Facture
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {factures.map((facture) => (
              <div key={facture._id} className="card hover:shadow-xl transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">
                        Facture #{facture.numero}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(facture.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {facture.produits.length} produit(s)
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {facture.totalGeneral.toLocaleString()} {facture.devise}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTelechargerPDF(facture)}
                      className="btn-primary flex-1 md:flex-none"
                      title="Télécharger PDF"
                    >
                      📥 PDF
                    </button>
                    <button
                      onClick={() => handleDupliquer(facture)}
                      className="btn-secondary flex-1 md:flex-none"
                      title="Dupliquer"
                    >
                      📋 Copier
                    </button>
                    <button
                      onClick={() => setSelectedFacture(facture)}
                      className="btn-secondary flex-1 md:flex-none"
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleSupprimer(facture._id)}
                      className="btn-danger"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Détails de la facture (expandable) */}
                {selectedFacture?._id === facture._id && (
                  <div className="mt-4 pt-4 border-t border-cyan-200/50">
                    <div className="space-y-2 mb-4">
                      <h4 className="font-bold text-sm text-cyan-800">Produits:</h4>
                      {facture.produits.map((p, idx) => (
                        <div
                          key={idx}
                          className="bg-cyan-50/50 p-3 rounded-lg flex justify-between border border-cyan-100/50"
                        >
                          <div>
                            <span className="font-semibold">{p.nom}</span>
                            {p.description && (
                              <div className="text-sm text-gray-600">
                                {p.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div>
                              {p.quantite} × {p.prixUnitaire.toLocaleString()}
                            </div>
                            <div className="font-bold">
                              {p.total.toLocaleString()} {facture.devise}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedFacture(null)}
                      className="text-sm text-gray-600"
                    >
                      Masquer les détails
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Historique;

