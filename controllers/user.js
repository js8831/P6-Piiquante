// Importation du package bcrypt
// RAPPEL : require() est la commande permettant l'importation d'objets ou de fichiers (avec des lignes de code) qu'on met dedans
const bcrypt = require("bcrypt");

// Pour chiffrer l'email dans la bdd
const cryptoJs = require("crypto-js");

// Importation de jsonwebtoken en ayant au préalable fait npm install --save jsonwebtoken
// Il permettra de créer des tokens et de les vérifier. Ces tokens peuvent contenir un payload personnalisé et avoir une validité limitée dans le temps
const jwt = require("jsonwebtoken");

// Importation du modèle User qu'on utilise ici
const User = require("../models/User");

// La fct pour l'enregistrement des utilisateurs
exports.signup = (req, res, next) => {
  // Méthode de cryptage .HmacSHA256, 1er arg (l'email), 2e arg (la clé) et on converti avec .toString
  const emailCryptojs = cryptoJs
    .HmacSHA256(req.body.email, process.env.EMAIL_CRYPTO_KEY)
    .toString();
  // Utilisation de la méthode .hash sur bcrypt qui renvoie une promise avec then
  // ou un catch et prend du temps cme c'est une fct async
  bcrypt
    // On hash le password fourni dans le formulaire avec la méthode .hash
    // 10 = on exécute l'algorithme de hashage 10x
    // c'est suffisant pour un mdp sécurisé sans prendre trop de temps
    .hash(req.body.password, 10)
    // Si promesse résolue :
    .then((hash) => {
      // Création du user
      const user = new User({
        // email fourni dans le corp de la requete
        email: emailCryptojs,
        // On affecte le hash capté par la promesse au password
        password: hash,
      });
      user
        // On save l'user dans la bdd
        .save()
        // Cela renvoie une promsesse
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        // erreur 400 pour différencier du 500
        .catch((error) => res.status(400).json({ error }));
    })
    // Sinon on capte l'erreur. On affecte le code 500 : erreur serveur
    .catch((error) => res.status(500).json({ error }));
};

// Pour la connection
exports.login = (req, res, next) => {
  const emailCryptojs = cryptoJs
    .HmacSHA256(req.body.email, process.env.EMAIL_CRYPTO_KEY)
    .toString();
  // Utilisation de la méthode .findOne de notre class User. On lui passe un objet qui va servir de filtre (selecteur)
  // Un champ "e-mail" qui correspondra à la valeur transmise par le client
  User.findOne({ email: emailCryptojs })
    // Si la requete est bien passée, il faut récupérer l'enregistrement :
    .then((user) => {
      // On va interroger la bdd pour savoir SI cette adresse email est existante ou non grâce à la promesse
      // Si c'est false et donc que l'user n'existe pas car pas d'email existant : on retourne l'erreur
      if (user === null) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      // pas besoin du else, il est sous entendu ici apparemment (mais comment ??????????)
      // Si c'est true et donc que l'adresse email existe, on compare les mdp (celui fourni pas le clt et celui dans la bdd retourné par la promesse "user")
      // avec la méthode .compare de bcrypt. C'est également une promesse qui va vérifier et prendre du temps
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // S'il n y a pas concordance de mdp avec la BDD, on retourne une erreur
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          // Si oui on renvoie une réponse 200 contenant l'id et le token
          // userId correspond a l'une des clés du schema User ???????? et user._Id est ce l'id crée par mdb pour identifié un user mais ne faisant pas partie du schema User ?????? car on ne veut pas l'userid renseigné par le client qui pourrait etre modifié par lui meme ?
          // Ce sont des informations nécessaires à l'authentification des req qui seront émises
          // par la suite par notre client
          res.status(200).json({
            userId: user._id,
            // Token qui sera envoyé et vérifié a chaque req émise par le front-end afin de vérifier la bonne authentification auprés de l' API
            // Appel de la méthode .sign du package jwt pour chiffrer un nouveau token
            // 1er argument = les données que l'on veut encoder (le payload / charge utile) : l'user._id pour être sûr que la req correspond bien au bon userID (plus haut) s'il veut par ex modifier ses obj a vendre...
            token: jwt.sign(
              { userId: user._id },
              // 2eme : la chaîne (clé) secrète pour l'encodage du token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production)
              process.env.TOKEN_CRYPTO_KEY,
              // 3eme : argument de configuration pour appliquer une expiration pour le token de 24h. L'user doit se reconnecter au bout de 24h
              { expiresIn: "24h" }
            ),
          });
        })
        // Ici il s'agit d'une erreur de traitement et non pas d'un mdp invalide
        .catch((error) => res.status(500).json({ error }));
    })
    // Ici pour la 1ere promesse, il s'agit d'une erreur d'exécution de requête dans la BDD
    // et non pas d'une erreur concernant un champ non trouvé dans la BDD lorsque l'user n'existe pas
    // Erreur serveur (500)
    .catch((error) => res.status(500).json({ error }));
};
