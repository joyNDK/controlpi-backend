// server.js ou index.js - Backend ControlPi pour Vercel
const express = require('express');
const cors = require('cors');
const app = express();

// Configuration Vercel
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = 'https://controlpi-frontend.vercel.app';
const BACKEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'https://controlpi-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Vercel`);
  next();
});

// ========== FICHIER VALIDATION PI NETWORK ==========
app.get('/validation-key.txt', (req, res) => {
  console.log('📄 Validation file requested for Pi Network');
  res.set({
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Utilise le domaine Vercel réel
  const domain = process.env.VERCEL_URL ? process.env.VERCEL_URL.replace('https://', '') : 'controlpi-backend.vercel.app';
  const content = `pi://verify-domain?domain=${domain}`;
  
  res.send(content);
  console.log(`✅ Validation file sent: ${content}`);
});

// ========== ROUTES PRINCIPALES ==========

// Root
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'ControlPi Backend',
    platform: 'Vercel',
    urls: {
      backend: BACKEND_URL,
      frontend: FRONTEND_URL,
      validation: `${BACKEND_URL}/validation-key.txt`
    },
    endpoints: [
      'GET /health',
      'GET /validation-key.txt',
      'POST /api/auth',
      'POST /api/payments/create',
      'POST /api/payments/approve',
      'POST /api/payments/complete',
      'POST /api/payments/callback'
    ],
    pi_network: 'ready'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Vercel',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version
  });
});

// Authentification
app.post('/api/auth', (req, res) => {
  res.json({
    success: true,
    user: {
      uid: `user_${Date.now()}`,
      username: 'controlpi_user',
      session: `sess_${Date.now()}`
    },
    message: 'Authentifié sur Vercel',
    backend: BACKEND_URL
  });
});

// Création de paiement
app.post('/api/payments/create', (req, res) => {
  const paymentId = `vercel_${Date.now()}`;
  res.json({
    success: true,
    payment: {
      identifier: paymentId,
      amount: req.body.amount || 3.14,
      memo: req.body.memo || 'ControlPi Vercel Payment',
      metadata: {
        platform: 'Vercel',
        app: 'ControlPi',
        timestamp: new Date().toISOString(),
        backend_url: BACKEND_URL
      }
    }
  });
});

// Approbation
app.post('/api/payments/approve', (req, res) => {
  res.json({
    success: true,
    txid: `tx_vercel_${Date.now()}`,
    message: 'Paiement approuvé sur Vercel',
    backend: BACKEND_URL
  });
});

// Complétion
app.post('/api/payments/complete', (req, res) => {
  res.json({
    success: true,
    message: 'Paiement complété sur Vercel',
    paymentId: req.body.paymentId,
    txid: req.body.txid,
    backend: BACKEND_URL
  });
});

// Callback Pi Network
app.post('/api/payments/callback', (req, res) => {
  console.log('📞 Callback Pi reçu sur Vercel:', req.body);
  res.json({
    success: true,
    received: true,
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    backend: BACKEND_URL
  });
});

// Route test pour vérifier que l'API fonctionne
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'ControlPi Backend API fonctionne sur Vercel!',
    urls: {
      validation_file: `${BACKEND_URL}/validation-key.txt`,
      frontend: FRONTEND_URL,
      health_check: `${BACKEND_URL}/health`
    },
    instructions: [
      '1. Utilise /validation-key.txt pour Pi Developer Portal',
      '2. Le frontend doit pointer vers cette URL',
      '3. Test avec: curl ' + BACKEND_URL
    ]
  });
});

// ========== GESTION ERREURS ==========

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    available_endpoints: [
      '/',
      '/health',
      '/validation-key.txt',
      '/api/auth',
      '/api/payments/create',
      '/api/test'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Erreur Vercel:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    platform: 'Vercel'
  });
});

// ========== DÉMARRAGE ==========

// Vercel utilise module.exports pour les fonctions serverless
if (process.env.VERCEL) {
  // Mode serverless Vercel
  module.exports = app;
} else {
  // Mode développement local
  app.listen(PORT, () => {
    console.log(`
✅ ControlPi Backend pour Vercel
📍 Port: ${PORT}
📡 URL: ${BACKEND_URL}
🔗 Frontend: ${FRONTEND_URL}

=== TESTS ===
1. ${BACKEND_URL}
2. ${BACKEND_URL}/health
3. ${BACKEND_URL}/validation-key.txt
4. ${BACKEND_URL}/api/test

=== PI DEVELOPER PORTAL ===
• Domain Verification URL: ${BACKEND_URL}/validation-key.txt
• API Base URL: ${BACKEND_URL}
• Callback URL: ${BACKEND_URL}/api/payments/callback
    `);
  });
}