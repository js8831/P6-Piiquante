const passwordSchema = require("../models/password");

module.exports = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    res.status(400).json({
      message:
        "Le MDP doit contenir 6 à 20 caractères, avec au moins une maj, une min et un chiffre.",
    });
  } else {
    next();
  }
};
