const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Route pour la clé Pi (validation du domaine)
app.get("/validation-key.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "validation-key.txt"));
});

// Route de test
app.get("/", (req, res) => {
  res.send("✅ ControlPi Backend en ligne !");
});

// -------------------- AUTHENTIFICATION --------------------
app.post("/api/auth", (req, res) => {
  const { accessToken } = req.body;
  console.log("Token reçu :", accessToken);

  // Ici tu devrais appeler l’API Pi pour valider le token
  // Pour l’instant on simule une réponse OK
  res.json({ success: true, user: { username: "TestUser" } });
});

// -------------------- PAIEMENTS --------------------

// Création d’un paiement (appelé par window.Pi.createPayment)
app.post("/api/payments/create", (req, res) => {
  const { amount, memo, metadata } = req.body;
  console.log("Paiement créé :", { amount, memo, metadata });

  // Ici tu pourrais stocker le paiement en base
  res.json({ success: true, status: "pending", paymentId: "demo-payment-id" });
});

// Approve payment (appelé par le SDK Pi)
app.post("/api/payments/approve", (req, res) => {
  const { paymentId } = req.body;
  console.log("Paiement à approuver:", paymentId);

  // Ici tu appelles l’API Pi pour approuver le paiement
  res.json({ success: true, message: "Paiement approuvé" });
});

// Callback pour finaliser paiement (appelé par le SDK Pi)
app.post("/api/payments/callback", (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    console.log("Paiement complété:", paymentId, txid);

    // Vérification JWT si nécessaire
    // const decoded = jwt.verify(txid, process.env.PI_API_SECRET);

    res.status(200).json({ success: true, message: "Paiement validé" });
  } catch (err) {
    console.error("Erreur de validation paiement:", err);
    res.status(400).json({ success: false, message: "Paiement invalide" });
  }
});

// Confirmation manuelle (optionnelle)
app.post("/api/payments/complete", (req, res) => {
  const { paymentId } = req.body;
  console.log("Paiement confirmé manuellement:", paymentId);
  res.json({ success: true, status: "completed" });
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur ControlPi démarré sur le port ${PORT}`);
});