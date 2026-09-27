import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import produitsRoutes from './routes/produits.js';
import facturesRoutes from './routes/factures.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facturation-app';

// Tentative de connexion à MongoDB (sans faire planter l'application)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion à MongoDB réussie');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    console.warn('⚠️  Le serveur démarre sans MongoDB. Les données seront perdues au redémarrage.');
    console.warn('📝 Pour résoudre ce problème:');
    console.warn('   1. Démarrer MongoDB localement: sudo systemctl start mongod');
    console.warn('   2. Ou utiliser MongoDB Atlas (cloud): définir MONGODB_URI dans .env');
    console.warn('   3. Ou installer MongoDB: https://www.mongodb.com/try/download/community');
  });

// Routes
app.use('/api/produits', produitsRoutes);
app.use('/api/factures', facturesRoutes);

// Route de santé (health check)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Facturation est opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});
