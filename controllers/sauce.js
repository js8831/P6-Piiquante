// La logique métier : la logique de chaque fonction

// Importation du modele sauce pour l'utiliser dans les middlewares (les gestionnaires de routes) qu'on affectera aux routes
const Sauce = require("../models/sauce");

// Importation de fs pour l'utiliser plus bas
const fs = require("fs");

// POST
exports.createSauce = function (req, res, next) {
  // Pour signifier de parse le corp de la req qui contient un schema sauce sous forme de chaine
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    // On remplace l'userId par celui recupéré dans le token grace au payload
    userId: req.auth.userId,
    // Il faut générer l'url de l'image pour l'enregistrer car multer ne fourni que le filename,
    // ne pas oublier de gerer la req vers le repertoire images sur notre serveur (app.js)
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    // la méthode .save retourne une promise contenant une réponse (obligatoire) sinon c'est l'expiration de la requête
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    // error 1 fois uniquement : raccourci
    .catch((error) => res.status(400).json({ error: error }));
};

// DELETE
exports.deleteSauce = function (req, res, next) {
  //Il faut s'assurer que cela soit le bon utilisateur qui en demande la suppression
  // On commence par chercher l'objet/sauce dans la bdd
  Sauce.findOne({ _id: req.params.id })
    // Si on trouve l'obj,
    .then((sauce) => {
      // on verifie si c'est le bon proprio
      if (sauce.userId != req.auth.userId) {
        // Si non : erreur
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Si oui, on supprime l'image du systeme de fichier en récupérant le nom
        // en splittant autour du répertoire "images" et on prend la partie qui suit [1] (ici il n y pas multer qui donne le nom de fcihier, cme pour post)
        const filename = sauce.imageUrl.split("/images/")[1];
        // Avec la méthode .unlink de "fs" on suppr le fichier img, avec en argument le chemin
        fs.unlink(`images/${filename}`, () => {
          // et ensuite on gere la callback, fct qui sera appelé une fois que la suppression de l'img aura lieu
          // car cette suppr de la sauce dans la bdd est faite de maniere async
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimée !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// GET
exports.getOneSauce = function (req, res, next) {
  // la méthode .findOne permet de trouver la "sauce" qui a pour _id (celui generé par la BDD) le meme que celui en paramètre (on compare)
  Sauce.findOne({ _id: req.params.id })
    // cela retourne une promise que l'on capte dans l'argument sauce s'il existe un objet correspondant dans la bdd
    .then(function (sauce) {
      // Si c'est le cas on veut cette objet en réponse au format JSON et on renvoie le code 200
      res.status(200).json(sauce);
    })
    // code 404 : pour obj non trouvé
    .catch((error) => res.status(404).json({ error }));
  // Ne pas mettre de next car malgré que le prochain middleware concerne une requete get,
  // elles sont différentes et n'ont pas la meme route
};

// GET
exports.getAllSauces = (req, res, next) => {
  // Cette méthode permet de  récupérer la liste complète des Sauces
  // Si on ne met pas d'objet en argument pour récup un objet quelconque. Par exemple : un obj ayant tel description etc...
  Sauce.find()
    // La méthode .find dans notre modele mongoose, RETOURNE une promise qui contient le tableau complet
    // (en json) de tous les Sauces reçu par la bdd (en REPONSE) et un code 200
    // Faire un test sans le "s"
    .then((sauces) => res.status(200).json(sauces))
    // 400 : syntaxe invalide
    .catch((error) => res.status(400).json({ error }));
};

// PUT
exports.modifySauce = function (req, res, next) {
  // Nous interrogeons (?) la req pour savoir si elle contient un champ file car cela change le format de la req (form-data+fichier ou json-fichier)
  // Si c'est le cas on execute la fct : on récupere l'obj en parsant le string et on recrée l'url de l'image sinon (:) on récupére simplement l'objet dans le  corp de la req
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // Il faut chercher cet obj dans notre bdd pour vérif si c'est le proprio de l'obj qui cherche a le modifier
  Sauce.findOne({ _id: req.params.id })
    // Si on trouve l'objet :
    .then((sauce) => {
      // on verifie si l'useriD est diff de celui du payload et si oui : erreur, qqun essaie de modifier un obj qui lui appartient pas !
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
        // Si non et que cela concorde on utilise la :
      } else {
        // Méthode .updateOne dans notre modèle Sauce pour mettre à jour une sauce dans la bdd
        // Le 1er argument est l'objet de comparaison : celui dont l'_id est = à celui envoyé dans le paramètre de req et celui qu'on souhaite modifier
        // le 2 eme est la nelle version de l'objet : on utilise le "spread operator" pour récup l'obj modifié dans le corp de la req
        // Attention rajouter à nouveau que l'_id soit = à celui envoyé dans le paramètre de req pour le garder
        // car apparemment, il se pourrait que l'_id du corp de la req soit différent car c'est comme une création avec new thing et on attribuerai un nouveau id
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// POST
exports.likeSauce = function (req, res, next) {
  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;
  console.log(req.body);

  // Mise en place d'instructions
  switch (like) {
    case 1:
      Sauce.updateOne(
        { _id: sauceId },
        // Utilisation d'opérateur MDB
        { $push: { usersLiked: userId }, $inc: { likes: +1 } }
      )
        .then(() => res.status(200).json({ message: "Sauce aimée" }))
        .catch((error) => res.status(400).json({ error }));

      break;

    case 0:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Aucun vote" }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Aucun vote" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    case -1:
      Sauce.updateOne(
        { _id: sauceId },
        { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
      )
        .then(() => {
          res.status(200).json({ message: "Sauce non aimée" });
        })
        .catch((error) => res.status(400).json({ error }));
      break;

    default:
      console.log("Une erreur est survenue ", error);
      break;
  }
};
