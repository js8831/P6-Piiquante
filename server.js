// Importation du package http de node pour les req http
const http = require("http");

// Importation de l'application express depuis app.js
const app = require("./app");

// Création du serveur qui recevra les req http via app
// Notre serveur retourne donc notre app express
const server = http.createServer(app);

// Port sur lequel va ecouter notre serveur pour chaque requete envoyé du frontend. 3000 ou var. env. si indisponibilité
server.listen(process.env.PORT || 3000);

// Il faut dire à l'app express sur quel port, elle va tourner (on set le port : l'environnement ou 3000)
app.set("port", process.env.PORT || 3000);
