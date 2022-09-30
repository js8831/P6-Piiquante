// Importation du pkg
const passwordValidator = require("password-validator");

// Creation d'un schema de validation pour le password
const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(6)
  .is()
  .max(20)
  .has()
  .not()
  .spaces()
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits();

module.exports = passwordSchema;
