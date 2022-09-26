// Import d'express pour créer des routeurs avec sa méthode
const express = require("express");
// Appel du routeur
const router = express.Router();
// Importation du controleur sauce
const sauceCtrl = require("../controllers/sauce");
// Importation du middleware auth
const auth = require("../middlewares/authorize");
// Importation du middleware multer
const multer = require("../middlewares/multer-config");

// post
router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

// get
router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);

// put
router.put("/:id", auth, multer, sauceCtrl.modifySauce);

// delete
router.delete("/:id", auth, sauceCtrl.deleteSauce);

// Exportation pour l'utiliser dans l'app car contient le segment final avec les middlewares à appliquer
// qui eux se situent ailleurs
module.exports = router;
