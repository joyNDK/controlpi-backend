const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Servir le fichier validation-key.txt
app.get("/validation-key.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "validation-key.txt"));
});

app.get("/", (req, res) => {
  res.send("✅ ControlPi Backend en ligne !");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});