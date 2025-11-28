const express = require("express");
const path = require("path");

const app = express();

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