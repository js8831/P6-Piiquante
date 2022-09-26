// Importation de multer pour configurer le middleware qui gerera les fichiers des req envoyé à l'api
const multer = require("multer");

// Création d'un objet (dictionnaire Mime) qui sert plus bas pour generer les extensions
// On y incorpore les extensions possibles
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Création d'un obj de configuration pour multer
const storage = multer.diskStorage({
  // Explique à multer dans quel dossier enregistrer les fichiers (3 arguments)
  destination: (req, file, callback) => {
    // Appel de la callback avec cme 1er argument : null pour dire qu'il n y a pas eu d'erreurs à ce niveau et le nom du dossier en 2eme argument
    callback(null, "images");
  },
  // La fct qui explique à multer quels noms de fichier utiliser pour les rendre unique au max.
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// Exportation de multer en l'appelant pour l'intégrer aux routes pour gerer les fichiers entrants
// Concerne les fichiers uniques de type image
module.exports = multer({ storage: storage }).single("image");

// Ne pas oublier de l'ajouter aux routes
