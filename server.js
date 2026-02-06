// server.js - Backend ControlPi pour Vercel (CORRIGÉ)
const express = require('express');
const cors = require('cors');
const app = express();

// ========== CONFIGURATION VERCEL (CORRIGÉ) ==========
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = 'https://controlpi-frontend.vercel.app';

// IMPORTANT: URL FIXE pour Pi Network - TOUJOURS la production
const PI_BACKEND_URL = 'https://controlpi-backend.vercel.app';

// URL dynamique pour l'API (peut être preview ou production)
const CURRENT_BACKEND_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

// ========== MIDDLEWARE ==========
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

// ========== FICHIER VALIDATION PI NETWORK (CORRIGÉ) ==========
app.get('/validation-key.txt', (req, res) => {
  console.log('📄 Validation file requested for Pi Network');
  res.set({
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  });
  
  // TOUJOURS utiliser l'URL de production pour Pi Network
  const content = `pi://verify-domain?domain=controlpi-backend.vercel.app`;
  
  res.send(content);
  console.log(`✅ Validation file sent: ${content}`);
});

// ========== ROUTES PRINCIPALES (CORRIGÉES) ==========

// Root - Montre les deux URLs
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'ControlPi Backend',
    platform: 'Vercel',
    urls: {
      backend_current: CURRENT_BACKEND_URL,
      backend_pi: PI_BACKEND_URL,  // URL pour Pi Network
      frontend: FRONTEND_URL,
      validation: `${PI_BACKEND_URL}/validation-key.txt`  // URL fixe pour Pi
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
    pi_network: 'ready',
    note: 'Pi Network doit utiliser les URLs avec backend_pi'
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
    node_version: process.version,
    pi_backend_url: PI_BACKEND_URL
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
    backend: PI_BACKEND_URL  // URL fixe pour Pi
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
        backend_url: PI_BACKEND_URL  // URL fixe pour Pi
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
    backend: PI_BACKEND_URL  // URL fixe pour Pi
  });
});

// Complétion
app.post('/api/payments/complete', (req, res) => {
  res.json({
    success: true,
    message: 'Paiement complété sur Vercel',
    paymentId: req.body.paymentId,
    txid: req.body.txid,
    backend: PI_BACKEND_URL  // URL fixe pour Pi
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
    backend: PI_BACKEND_URL  // URL fixe pour Pi
  });
});

// Route test pour vérifier que l'API fonctionne
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'ControlPi Backend API fonctionne sur Vercel!',
    urls: {
      validation_file: `${PI_BACKEND_URL}/validation-key.txt`,  // URL fixe
      frontend: FRONTEND_URL,
      health_check: `${PI_BACKEND_URL}/health`,
      current_backend: CURRENT_BACKEND_URL,
      pi_backend: PI_BACKEND_URL
    },
    instructions: [
      '1. Utilise cette URL pour Pi Developer Portal:',
      `   ${PI_BACKEND_URL}/validation-key.txt`,
      '2. Le frontend doit pointer vers cette URL:',
      `   ${PI_BACKEND_URL}`,
      '3. Test avec:',
      `   curl ${PI_BACKEND_URL}`
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
    ],
    pi_backend_url: PI_BACKEND_URL
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Erreur Vercel:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    platform: 'Vercel',
    pi_backend_url: PI_BACKEND_URL
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
📡 URL actuelle: ${CURRENT_BACKEND_URL}
🎯 URL Pi Network: ${PI_BACKEND_URL}
🔗 Frontend: ${FRONTEND_URL}

=== TESTS ===
1. ${CURRENT_BACKEND_URL}
2. ${PI_BACKEND_URL}/validation-key.txt
3. ${PI_BACKEND_URL}/health
4. ${PI_BACKEND_URL}/api/test

=== PI DEVELOPER PORTAL ===
• Domain Verification URL: ${PI_BACKEND_URL}/validation-key.txt
• API Base URL: ${PI_BACKEND_URL}
• Callback URL: ${PI_BACKEND_URL}/api/payments/callback

⚠️ IMPORTANT: Pi Network doit utiliser ${PI_BACKEND_URL}
    `);
  });
}