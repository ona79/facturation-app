import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormulaireProduit from '../components/FormulaireProduit';
import LigneProduit from '../components/LigneProduit';
import { facturesAPI, produitsAPI } from '../utils/api';
import { genererPDF } from '../utils/pdfGenerator';

/**
 * Page principale pour créer une nouvelle facture
 * Gère l'ajout de produits, calculs automatiques et génération PDF
 */
function Facture() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [produitsRecents, setProduitsRecents] = useState([]);
  const [entreprise, setEntreprise] = useState({
    nom: 'Mon Entreprise',
    adresse: '',
    telephone: '',
    email: '',
    logo: ''
  });
  const [remarques, setRemarques] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEntreprise, setShowEntreprise] = useState(false);
  const produitsEndRef = React.useRef(null);

  // Charger les produits récents au chargement
  useEffect(() => {
    produitsAPI.getRecents()
      .then(res => setProduitsRecents(res.data.data || []))
      .catch(() => {});
  }, []);

  // Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    const data = {
      produits,
      entreprise,
      remarques,
      timestamp: Date.now()
    };
    localStorage.setItem('facture_en_cours', JSON.stringify(data));
  }, [produits, entreprise, remarques]);

  // Restaurer depuis localStorage au chargement
  useEffect(() => {
    const saved = localStorage.getItem('facture_en_cours');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Ne restaurer que si moins de 24h
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setProduits(data.produits || []);
          setEntreprise(data.entreprise || entreprise);
          setRemarques(data.remarques || '');
        }
      } catch (e) {
        console.error('Erreur restauration:', e);
      }
    }
  }, []);

  // Ajouter un produit avec calcul automatique du total
  const handleAjouterProduit = (produit) => {
    // S'assurer que le total est toujours calculé correctement
    const produitAvecTotal = {
      ...produit,
      id: Date.now(),
      total: (produit.prixUnitaire || 0) * (produit.quantite || 1)
    };
    setProduits([...produits, produitAvecTotal]);
    
    // Scroll vers le nouveau produit après un court délai
    setTimeout(() => {
      produitsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Supprimer un produit
  const handleSupprimerProduit = (index) => {
    setProduits(produits.filter((_, i) => i !== index));
  };

  // Utiliser un produit récent
  const handleProduitRecent = (produitRecent) => {
    handleAjouterProduit({
      nom: produitRecent.nom,
      prixUnitaire: produitRecent.prixUnitaire,
      quantite: 1,
      description: produitRecent.description || '',
      total: produitRecent.prixUnitaire
    });
  };

  // Calculer les totaux avec recalcul automatique pour garantir l'exactitude
  const produitsAvecTotaux = produits.map(p => ({
    ...p,
    total: (p.prixUnitaire || 0) * (p.quantite || 1)
  }));
  const sousTotal = produitsAvecTotaux.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalGeneral = Math.round(sousTotal * 100) / 100; // Arrondir à 2 décimales

  // Générer et sauvegarder la facture
  const handleGenererFacture = async () => {
    if (produits.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    setIsGenerating(true);

    try {
      // Créer la facture dans la base de données avec totaux recalculés
      const response = await facturesAPI.creer({
        produits: produitsAvecTotaux.map(p => ({
          nom: p.nom,
          prixUnitaire: p.prixUnitaire,
          quantite: p.quantite,
          description: p.description || '',
          total: p.total
        })),
        entreprise,
        devise: 'FCFA',
        remarques
      });

      const facture = response.data.data;

      // Générer le PDF
      genererPDF(facture);

      // Nettoyer le localStorage et réinitialiser le formulaire
      localStorage.removeItem('facture_en_cours');
      setProduits([]);
      setRemarques('');

      // Rediriger vers l'historique après un court délai
      setTimeout(() => {
        navigate('/historique');
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      // Gestion d'erreur améliorée
      if (error.response?.status === 500) {
        alert('⚠️ Impossible de sauvegarder la facture.\n\nVérifiez que MongoDB est démarré.\nLa facture sera sauvegardée localement.');
        // Sauvegarder quand même dans localStorage en cas d'erreur
        const factureLocale = {
          numero: numeroFacture,
          date: new Date().toISOString(),
          produits: produitsAvecTotaux.map(p => ({
            nom: p.nom,
            prixUnitaire: p.prixUnitaire,
            quantite: p.quantite,
            description: p.description || '',
            total: p.total
          })),
          entreprise,
          devise: 'FCFA',
          remarques,
          totalGeneral
        };
        const facturesLocales = JSON.parse(localStorage.getItem('factures_locales') || '[]');
        facturesLocales.push(factureLocale);
        localStorage.setItem('factures_locales', JSON.stringify(facturesLocales));
        genererPDF(factureLocale);
        setProduits([]);
        setRemarques('');
        navigate('/historique');
      } else if (error.code === 'ECONNREFUSED' || !error.response) {
        alert('⚠️ Le serveur backend n\'est pas accessible.\n\nAssurez-vous que le backend est démarré.');
      } else {
        alert('Erreur lors de la génération de la facture');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer numéro et date pour aperçu
  const numeroFacture = `FACT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const dateFacture = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Total sticky en bas (mobile uniquement) */}
      {produits.length > 0 && (
        <div className="sticky bottom-0 z-10 md:hidden bg-white/95 backdrop-blur-md border-t border-cyan-200/50 shadow-lg">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-xl font-bold text-cyan-600">
                  {totalGeneral.toLocaleString()} FCFA
                </div>
              </div>
              <button
                onClick={handleGenererFacture}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? '⏳' : '💾 Générer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 pb-24 md:pb-8">
        {/* En-tête avec navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-semibold text-cyan-700 hover:text-cyan-900 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Nouvelle Facture
          </h1>
          <button
            onClick={() => setShowEntreprise(!showEntreprise)}
            className="btn-secondary text-xs"
          >
            {showEntreprise ? '📋' : '🏢'}
          </button>
        </div>

        {/* Informations entreprise (collapsible) */}
        {showEntreprise && (
          <div className="card mb-4">
            <h2 className="text-sm font-bold mb-3 text-cyan-800">Informations Entreprise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={entreprise.nom}
                onChange={(e) => setEntreprise({ ...entreprise, nom: e.target.value })}
                className="input-field"
                placeholder="Nom de l'entreprise"
              />
              <input
                type="text"
                value={entreprise.telephone}
                onChange={(e) => setEntreprise({ ...entreprise, telephone: e.target.value })}
                className="input-field"
                placeholder="Téléphone"
              />
              <input
                type="text"
                value={entreprise.adresse}
                onChange={(e) => setEntreprise({ ...entreprise, adresse: e.target.value })}
                className="input-field md:col-span-2"
                placeholder="Adresse"
              />
            </div>
          </div>
        )}

        {/* Layout responsive : desktop (côte à côte) / mobile (vertical) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Colonne gauche : Liste des produits */}
          <div className="order-2 lg:order-1">
            {/* Produits récents (compact) */}
            {produitsRecents.length > 0 && (
              <div className="card mb-4">
                <h3 className="text-xs font-semibold text-cyan-700 mb-2">⚡ Produits Récents</h3>
                <div className="flex flex-wrap gap-2">
                  {produitsRecents.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleProduitRecent(p)}
                      className="px-3 py-1.5 text-xs bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                      <div className="font-medium">{p.nom}</div>
                      <div className="text-cyan-600">
                        {p.prixUnitaire.toLocaleString()} FCFA
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des produits */}
            {produits.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-600 text-sm">Aucun produit ajouté</p>
                <p className="text-xs text-gray-500 mt-2">Utilisez le formulaire pour ajouter</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-bold text-cyan-800">
                    Produits ({produits.length})
                  </h2>
                </div>
                {produitsAvecTotaux.map((produit, index) => (
                  <div key={produit.id || index}>
                    <LigneProduit
                      produit={produit}
                      onDelete={handleSupprimerProduit}
                      index={index}
                    />
                  </div>
                ))}
                <div ref={produitsEndRef} />
              </div>
            )}

            {/* Aperçu facture (desktop uniquement) */}
            {produits.length > 0 && (
              <div className="card mt-4 hidden lg:block">
                <h3 className="text-xs font-semibold text-cyan-700 mb-3">Aperçu</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro:</span>
                    <span className="font-mono text-xs">{numeroFacture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{dateFacture}</span>
                  </div>
                  <div className="border-t border-cyan-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-semibold">{sousTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-cyan-200">
                      <span className="font-bold text-cyan-700">Total:</span>
                      <span className="text-lg font-bold text-cyan-600">
                        {totalGeneral.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remarques */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Remarques
                  </label>
                  <textarea
                    value={remarques}
                    onChange={(e) => setRemarques(e.target.value)}
                    className="input-field text-sm"
                    rows="2"
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                {/* Bouton générer (desktop) */}
                <button
                  onClick={handleGenererFacture}
                  disabled={isGenerating}
                  className="w-full btn-primary mt-4"
                >
                  {isGenerating ? '⏳ Génération...' : '💾 Générer la Facture PDF'}
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite : Formulaire d'ajout */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-4">
              <FormulaireProduit onSave={handleAjouterProduit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Facture;
