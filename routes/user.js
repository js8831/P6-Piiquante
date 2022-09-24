// La logique de routing

// Import d'express pour créer des routeurs avec sa méthode
const express = require("express");
// Appel du routeur
const router = express.Router();
// Importation du controleur user
const userCtrl = require("../controllers/user");

// Implémentation des routes post pour se connecter ou s'enregistrer
// On utilise le segment final car la route de base est commune a chaque route et se trouve dans app.jss
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// Exportation du routeur pour l'importer dans app.js afin d'enregistrer les routes avec app.use
module.exports = router;
