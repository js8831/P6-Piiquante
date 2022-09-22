// Installation d'express (npm install express avant)
const express = require("express");
// Appel de la fct express
const app = express();
// Installation de mongoose (npm install mongoose avant)
const mongoose = require("mongoose");
// Exportation d'express dans server.js
module.exports = app;

// Pour avoir acces au corp d'une requete de content-type : JSON (req.body)
// Servira par ex pour les req "post"
app.use(express.json());

// Lier la BDD avec l'API
mongoose
  .connect(
    "mongodb+srv://pierre-o:gb6DVDHfaczV7GCX@cluster0.n1kyldi.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
