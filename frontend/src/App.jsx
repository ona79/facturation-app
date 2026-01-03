import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Facture from './pages/Facture';
import Historique from './pages/Historique';

/**
 * Composant principal de l'application
 * Gère la navigation entre les différentes pages
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/facture" element={<Facture />} />
          <Route path="/historique" element={<Historique />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
