const mongoose = require("mongoose");

// Importation du plugin mongoose-unique-validator pour éviter des erreurs et prévalider les info avant de les save
// Ceci, malgré la configuration avec le mot clé "unique" pour l'attribut "e-mail"
// Ne pas oublier la cmd npm install --save mongoose-unique-validator avant
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  // Les informations du user que l'on va stocker
  // "unique" pour que des utilisateurs ne s'inscrivent pas avec la meme adresse e-mail
  email: { type: String, required: true, unique: true },
  // Le mdp sera un hash mais de type string
  password: { type: String, required: true },
});

// Appel de la méthode .plugin avec pour arugment la const "uniqueValidator"
// Appliquer le validator au schema avant d'en faire un modèle
userSchema.plugin(uniqueValidator);

// Exportation
module.exports = mongoose.model("User", userSchema);
