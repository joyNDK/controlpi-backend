// Route callback pour les paiements Pi
app.post("/api/payments/callback", (req, res) => {
  console.log("📩 Paiement reçu :", req.body);

  // Ici tu traites la validation du paiement Pi
  // Exemple : vérifier l'identifiant de paiement, mettre à jour ta base de données, etc.

  res.status(200).send({ message: "Paiement validé ✅" });
});
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Servir tous les fichiers statiques du dossier courant
app.use(express.static(__dirname));

// Route de test
app.get("/", (req, res) => {
  res.send("✅ ControlPi Backend en ligne !");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});