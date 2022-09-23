// Importation de mongoose pour creer un schema, afin de respecter un modèle de données
const mongoose = require("mongoose");

// Mdb generera un id pour chaque sauce mais qui n'entre pas dans le schema

// Utilisation de la méthode schema (mise à disposition par le package mongoose) pour creer un schema de données pour la bdd mongoDB
// On va lui passer un obj. dictant les différents champs que notre schema "sauce" à besoin
const sauceSchema = mongoose.Schema({
  // l'id est automatiquement généré par mongoose lors de la création d'un nouvel objet alors ne pas mettre ce champs
  // Les clés suivantes ont pour valeurs des obj contenant le type de champs et le caractère requis ou non
  // Si oui (true), sans clé, on ne peut pas enregistrer une "sauce" dans la bdd
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  // A confirmer pour le type
  usersLiked: { type: Array, required: true },
  usersDisliked: { type: Array, required: true },
});

// Exportation du schema pour pouvoir l'exploiter comme modèle dans express avec la méthode .model de mongoose
// 1er argument : le nom du modèle
// 2 ie : le schema de données qu'on va utiliser
module.exports = mongoose.model("Sauce", sauceSchema);
