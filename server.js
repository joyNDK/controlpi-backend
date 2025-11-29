const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Route pour la clé Pi
app.get("/validation-key.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "validation-key.txt"));
});

// Route de test
app.get("/", (req, res) => {
  res.send("✅ ControlPi Backend en ligne !");
});

// Approve payment
app.post("/api/payments/approve", (req, res) => {
  const { paymentId } = req.body;
  console.log("Paiement à approuver:", paymentId);
  // Ici tu appelles l’API Pi pour approuver le paiement
  res.json({ success: true, message: "Paiement approuvé" });
});

// Callback pour finaliser paiement
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});