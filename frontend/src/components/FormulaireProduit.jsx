import React, { useState, useEffect } from 'react';
import { produitsAPI } from '../utils/api';

/**
 * Composant pour ajouter/modifier un produit
 * Avec auto-complétion des produits existants
 */
function FormulaireProduit({ produit, onSave, onCancel }) {
  const [nom, setNom] = useState(produit?.nom || '');
  const [prixUnitaire, setPrixUnitaire] = useState(produit?.prixUnitaire || '');
  const [quantite, setQuantite] = useState(produit?.quantite || 1);
  const [description, setDescription] = useState(produit?.description || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recherche d'auto-complétion
  useEffect(() => {
    if (nom.length >= 2) {
      produitsAPI.rechercher(nom)
        .then(res => setSuggestions(res.data.data || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [nom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nom.trim() || !prixUnitaire) {
      alert('Le nom et le prix sont requis');
      return;
    }

    onSave({
      nom: nom.trim(),
      prixUnitaire: parseFloat(prixUnitaire),
      quantite: parseFloat(quantite) || 1,
      description: description.trim(),
      total: parseFloat(prixUnitaire) * (parseFloat(quantite) || 1)
    });

    // Réinitialiser le formulaire
    setNom('');
    setPrixUnitaire('');
    setQuantite(1);
    setDescription('');
  };

  const selectSuggestion = (suggestion) => {
    setNom(suggestion.nom);
    setPrixUnitaire(suggestion.prixUnitaire); // Pré-remplir automatiquement le prix
    setDescription(suggestion.description || '');
    setQuantite(1); // Réinitialiser la quantité
    setShowSuggestions(false);
    // Focus sur le champ quantité pour faciliter la saisie
    setTimeout(() => {
      const qtyInput = document.querySelector('input[type="number"][min="1"]');
      if (qtyInput) qtyInput.focus();
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-base font-bold mb-4 text-cyan-800">➕ Ajouter un produit</h3>

      {/* Nom du produit avec auto-complétion */}
      <div className="mb-4 relative">
        <label className="block text-lg font-semibold mb-2">
          Nom du produit *
        </label>
        <input
          type="text"
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="input-field"
          placeholder="Ex: T-shirt, Chaussures..."
          required
        />
        
        {/* Suggestions d'auto-complétion améliorées */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-md border border-cyan-200/50 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSuggestion(sug)}
                className="w-full text-left px-3 py-2.5 hover:bg-cyan-50 border-b border-cyan-100/50 transition-colors"
              >
                <div className="font-semibold text-cyan-900 text-sm">{sug.nom}</div>
                <div className="text-xs text-cyan-600">
                  {sug.prixUnitaire.toLocaleString()} FCFA
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prix unitaire et quantité côte à côte sur desktop */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-lg font-semibold mb-2">
            Prix unitaire (FCFA) *
          </label>
          <input
            type="number"
            value={prixUnitaire}
            onChange={(e) => setPrixUnitaire(e.target.value)}
            className="input-field"
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold mb-2">
            Quantité *
          </label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="input-field"
            min="1"
            step="1"
            required
          />
        </div>
      </div>

      {/* Description optionnelle */}
      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          rows="2"
          placeholder="Détails supplémentaires..."
        />
      </div>

      {/* Boutons compacts */}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          ✓ Ajouter
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

export default FormulaireProduit;
