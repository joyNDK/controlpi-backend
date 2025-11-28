const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Servir tous les fichiers statiques du dossier courant
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send("✅ ControlPi Backend en ligne !");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});