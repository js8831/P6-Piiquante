// ------- EXPRESS -------
// Installation d'express (npm install express avant)
const express = require("express");

// Appel de la fct express
const app = express();

// Exportation d'express dans server.js
module.exports = app;

// ------- ROUTEUR -------
// Importation des routeurs 
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// ------- PKG -------
// Helmet qui configure les headers pour être moins vulnérable
const helmet = require("helmet");
// Importation de doten pour utiliser des var. d'environnement
require("dotenv").config();
// Pour recup les log des req http pour faire du monitoring
const morgan = require("morgan");
// Paramètrage prédéfini
app.use(morgan("dev"));
// express-mongo-sanitize pour se protéger des attaques par injections dans les inputs
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// ------- MONGOOSE -------
// Installation de mongoose (npm install mongoose avant)
const mongoose = require("mongoose");

// Lie la BDD avec l'API
mongoose
  .connect(process.env.SECRET_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// ------- PATH -------
const path = require("path");

// ------- SERVEUR -------
// Utilisation d'helmet sur toute nos routes
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    // Permet de charger des photos en paramètrant les en-têtes de réponses
  })
);
// ------- CORS -------
// On configure la sécurité CORS car communication entre différent serveur
// Il faut mettre ce middleware "general" en premier car il sera le 1er middleware executé par le serveur
// Général car pas de route spécifique (endpoint), donc s'applique à toutes les routes et requetes (car use) d'acceder au serveur
app.use((req, res, next) => {
  // On met des headers à l'obj. reponse qu'on renvoit au navigateur pour permettre des requêtes cross-origin (et empêcher des erreurs cors) afin d'acceder a l'API
  // * = accessible pour tous le monde peu importe l'origine
  res.setHeader("Access-Control-Allow-Origin", "*");
  // On donne l'autorisation d'utiliser certains en tête (headers) sur l'obj. requete
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  // Ainsi que des autorisation sur certaines méthodes (les verbes de requêtes)
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// C'est notre serveur qui gere toutes les requetes via express
// Pour avoir acces au corp d'une requete de content-type : JSON (req.body), le contenu des champs remplis par le client
// Servira par ex pour les middlewares des req "post"
app.use(express.json());

// On utlise le routeur qui est exposé par sauceRoutes et qui se trouve dans le dossier router mais qu'on a importé plus haut
// le routeur importé contient le segment final et le contrôleur a appliquer. Cela permet de structurer le code
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
// Ajout de la req vers le repertoire images pour pouvoir utliser le dossier
app.use("/images", express.static(path.join(__dirname,"images")));

