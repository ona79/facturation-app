import React from 'react';

/**
 * Composant pour afficher une ligne de produit dans la facture
 * Affiche les détails et permet la suppression
 */
function LigneProduit({ produit, onDelete, index }) {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-base font-bold text-gray-800 mb-1">
            {produit.nom}
          </h4>
          {produit.description && (
            <p className="text-gray-600 text-xs mb-2">{produit.description}</p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(index)}
            className="text-red-500 text-lg font-bold hover:scale-110 hover:text-red-600 transition-all"
            aria-label="Supprimer"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-600 text-xs">Prix unitaire:</span>
          <div className="font-semibold text-sm">
            {produit.prixUnitaire.toLocaleString()} FCFA
          </div>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Quantité:</span>
          <div className="font-semibold text-sm">{produit.quantite}</div>
        </div>
        <div className="col-span-2 md:col-span-1 md:col-start-4">
          <span className="text-gray-600 text-xs">Total:</span>
          <div className="font-bold text-cyan-600 text-base">
            {produit.total.toLocaleString()} FCFA
          </div>
        </div>
      </div>
    </div>
  );
}

export default LigneProduit;
