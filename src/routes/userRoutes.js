const express = require("express");
const multer = require("multer");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const router = express.Router();
const userController = require("../controllers/userController");
const ensureAuth = require("../middlewares/ensureAuth");

let upload = multer();
let cpUpload = upload.fields([]);


/**
 * GET /home
 * Shows the user's home page with current score, heal, etc.
 */
router.get("/home", csrfProtection, ensureAuth, userController.getHome);

/**
 * GET /game
 * Displays a page to play the game
 */
router.get("/game", csrfProtection, ensureAuth, userController.getGamePage);

/**
 * POST /submitScore
 * Submits a score and updates the user's profile.score
 */
router.post(
  "/submitScore/:score",
  ensureAuth,
  cpUpload,
  userController.submitScore
);

router.post("/loseScore", ensureAuth, cpUpload, userController.loseScore);

/**
 * POST /addHeal
 * add Heal and updates the user's profile.type
 */
router.post("/addHeal/:type", ensureAuth, cpUpload, userController.addHeal);

/**
 * POST /sendSmsScore
 * Sends an SMS to inform about a new score (or any logic you want)
 */
// router.post("/sendSmsScore", ensureAuth, userController.sendSmsScore);

/**
 * POST /gameEnd
 * Any final logic at the end of the game, then redirect to /home
 */
// router.post("/gameEnd", ensureAuth, userController.gameEnd);

module.exports = router;
