// Middleware qui verifie le token des req entrantes pour les authentifier et passer la suite aux middlewares suivants

// Importation de jsonwebtoken pour utiliser la méthode .verify à présent
const jwt = require("jsonwebtoken");

// Exportation de notre middleware pour l'importer sur les routes par la suite
module.exports = (req, res, next) => {
  // Récuperation du token envoyé par le clt lors de requetes. Il est composé de 2 parties (le bearer et le token lui même)
  // On enleve la 1ere partie (le bearer) et on utilise un try and catch pour gerer des erreurs eventuelles
  try {
    // 1. On récupére donc le token en recupérant le header "authorization" de la req entrante
    // Il contiendra également le mot-clé Bearer comme dit précedement. Nous utilisons alors la fonction split pour diviser la chaine de caractères
    // en 1 tableau autour de l'espace qui se trouve entre notre mot clé bearer et le token
    // le 1 signifie le souhait de prendre le 2eme position car on commence à 0
    const token = req.headers.authorization.split(" ")[1];
    // 2. il faut décoder le token avec la méthode .verify de jwt en lui passant le token récupéré en 1er argument et la clé secrete en 2eme
    const decodedToken = jwt.verify(token, process.env.TOKEN_CRYPTO_KEY);
    // Récuperation de la propriété userId aprés le décodage du token pour authentifié correctement les req (attention diff de crypté, il s'agit du payload)
    const userId = decodedToken.userId;
    // 3. Et ajout de la valeur de l'userId à l'objet req.auth qui est transmis aux routes qui vont être appelées par la suite
    req.auth = {
      userId: userId,
    };
    // C'est pour transmettre le token et créer un lien. Sinon les middlewares dans les routes s'executent à la chaine sans forcément mettre next
    // ou pour dire que si auth est ok on fait next sinon cela ne passe pas au middleware suivant ????? le 2eme je pense
    next();
    // En cas d'erreur pour décoder le token, on se retrouve dans le catch et on renvoie une erreur
  } catch (error) {
    res.status(403).json({ error });
  }
};
