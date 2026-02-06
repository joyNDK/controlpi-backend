// index.js - ControlPi Backend pour Vercel
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const cors = require("cors");

// Configuration Vercel
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://controlpi-frontend.vercel.app";
const BACKEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

// ========== MIDDLEWARES ==========
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Logger pour Vercel
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
  
  const domain = process.env.VERCEL_URL ? process.env.VERCEL_URL.replace('https://', '') : 'controlpi-backend.vercel.app';
  const content = `pi://verify-domain?domain=${domain}`;
  
  res.send(content);
  console.log(`✅ Validation file sent: ${content}`);
});

// ========== MIDDLEWARE JWT ==========
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-par-defaut-vercel");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }
}

// ========== TRADUCTIONS ==========
const translations = {
  fr: {
    anomaly: (threshold) => `Montant inhabituel détecté (≥ ${threshold} Pi)`,
    thresholdSaved: (val) => `Seuil enregistré avec succès : ${val} Pi`,
    pdfTitle: "Rapport des transactions Pi",
    columns: ["ID", "Date", "Montant (Pi)", "Statut", "Contrepartie"]
  },
  en: {
    anomaly: (threshold) => `Unusual amount detected (≥ ${threshold} Pi)`,
    thresholdSaved: (val) => `Threshold saved successfully: ${val} Pi`,
    pdfTitle: "Pi Transactions Report",
    columns: ["ID", "Date", "Amount (Pi)", "Status", "Counterparty"]
  },
  zh: {
    anomaly: (threshold) => `检测到异常金额 (≥ ${threshold} Pi)`,
    thresholdSaved: (val) => `阈值已成功保存：${val} Pi`,
    pdfTitle: "Pi 交易报告",
    columns: ["编号", "日期", "金额 (Pi)", "状态", "交易方"]
  }
};

// ========== PARAMÈTRES UTILISATEUR ==========
let userSettings = { alert_threshold_pi: 10 };

// ========== ROUTES PRINCIPALES ==========

// Route racine - Info Vercel
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "ControlPi Backend",
    platform: "Vercel",
    urls: {
      backend: BACKEND_URL,
      frontend: FRONTEND_URL,
      validation: `${BACKEND_URL}/validation-key.txt`
    },
    endpoints: [
      "GET /health",
      "GET /validation-key.txt",
      "POST /api/auth/pi-login",
      "GET /api/transactions",
      "GET /api/export/pdf",
      "GET /api/export/csv"
    ],
    pi_network: "ready",
    node_version: process.version
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "Vercel",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Route de test
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "ControlPi Backend API fonctionne sur Vercel!",
    urls: {
      validation_file: `${BACKEND_URL}/validation-key.txt`,
      frontend: FRONTEND_URL,
      health_check: `${BACKEND_URL}/health`
    }
  });
});

// ========== AUTH PI ==========
app.post("/api/auth/pi-login", (req, res) => {
  const { authResult } = req.body || {};
  if (!authResult || !authResult.user) {
    return res.status(400).json({ error: "Résultat d’authentification invalide" });
  }
  const payload = { 
    uid: authResult.user.uid, 
    username: authResult.user.username,
    platform: "Vercel"
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "secret-par-defaut-vercel", { expiresIn: "1h" });
  res.json({ 
    token, 
    user: payload,
    backend: BACKEND_URL
  });
});

// ========== TRANSACTIONS (Exemple) ==========
app.get("/api/transactions", authMiddleware, (req, res) => {
  // Transactions fictives pour l'exemple
  const transactions = [
    {
      id: 1,
      date: new Date().toISOString(),
      amount: 5.2,
      status: "completed",
      counterparty: "user123",
      platform: "Vercel"
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString(),
      amount: 12.7,
      status: "pending",
      counterparty: "user456",
      platform: "Vercel"
    }
  ];
  
  res.json({
    success: true,
    transactions,
    count: transactions.length,
    backend: BACKEND_URL
  });
});

// ========== EXPORT PDF ==========
app.get("/api/export/pdf", authMiddleware, (req, res) => {
  try {
    const doc = new PDFDocument();
    const filename = `controlpi-report-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    doc.fontSize(20).text('Rapport ControlPi - Vercel Backend', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Généré le: ${new Date().toLocaleString()}`);
    doc.text(`Backend URL: ${BACKEND_URL}`);
    doc.text(`Frontend URL: ${FRONTEND_URL}`);
    doc.moveDown();
    doc.text('Ce PDF a été généré depuis le backend ControlPi sur Vercel.');
    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du PDF", details: error.message });
  }
});

// ========== EXPORT CSV ==========
app.get("/api/export/csv", authMiddleware, (req, res) => {
  const csvData = `ID,Date,Montant (Pi),Statut,Contrepartie,Platform
1,${new Date().toISOString()},5.2,completed,user123,Vercel
2,${new Date(Date.now() - 86400000).toISOString()},12.7,pending,user456,Vercel`;
  
  const filename = `controlpi-transactions-${Date.now()}.csv`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvData);
});

// ========== API PAIEMENTS PI ==========
app.post("/api/payments/create", (req, res) => {
  const paymentId = `vercel_${Date.now()}`;
  res.json({
    success: true,
    payment: {
      identifier: paymentId,
      amount: req.body.amount || 3.14,
      memo: req.body.memo || "ControlPi Vercel Payment",
      metadata: {
        platform: "Vercel",
        app: "ControlPi",
        timestamp: new Date().toISOString(),
        backend_url: BACKEND_URL
      }
    }
  });
});

app.post("/api/payments/approve", (req, res) => {
  res.json({
    success: true,
    txid: `tx_vercel_${Date.now()}`,
    message: "Paiement approuvé sur Vercel"
  });
});

app.post("/api/payments/complete", (req, res) => {
  res.json({
    success: true,
    message: "Paiement complété sur Vercel",
    paymentId: req.body.paymentId,
    txid: req.body.txid
  });
});

app.post("/api/payments/callback", (req, res) => {
  console.log("📞 Callback Pi reçu sur Vercel:", req.body);
  res.json({
    success: true,
    received: true,
    timestamp: new Date().toISOString(),
    platform: "Vercel",
    backend: BACKEND_URL
  });
});

// ========== GESTION DES ERREURS ==========
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.path,
    backend: BACKEND_URL,
    available_endpoints: [
      "/",
      "/health",
      "/validation-key.txt",
      "/api/auth/pi-login",
      "/api/payments/create"
    ]
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Erreur Vercel:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    platform: "Vercel"
  });
});

// ========== DÉMARRAGE ==========
if (process.env.VERCEL) {
  // Mode serverless Vercel - export l'app
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