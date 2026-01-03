import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Page d'accueil - Point d'entrée de l'application
 * Interface ultra simple avec de gros boutons
 */
function Accueil() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Titre */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Facturation
          </h1>
          <p className="text-lg text-gray-600">Simple, rapide et intuitif</p>
        </div>

        {/* Boutons principaux avec design glassmorphism */}
        <div className="space-y-4 w-full">
          {/* Bouton Nouvelle Facture */}
          <button
            onClick={() => navigate('/facture')}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 shadow-lg shadow-cyan-200/50"
          >
            <span className="text-2xl">➕</span>
            <span>Nouvelle Facture</span>
          </button>

          {/* Bouton Historique */}
          <button
            onClick={() => navigate('/historique')}
            className="w-full btn-secondary text-lg py-4 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📋</span>
            <span>Historique</span>
          </button>
        </div>

        {/* Informations utiles */}
        <div className="mt-12 card">
          <p className="text-sm text-cyan-700 text-center">
            💡 Vos factures sont sauvegardées automatiquement
          </p>
        </div>
      </div>
    </div>
  );
}

export default Accueil;
