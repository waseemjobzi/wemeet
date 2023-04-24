const { Router } = require("express");
const { memUpload } = require("../../middlewares/upload");
const controller = require("./movies.controller");
const { checkAuth } = require("../../middlewares/authorization");
const router = Router();
router.route("/showMovies").get(controller.showMovies);
router.route("/connects").get(controller.connectCount);
router.route("/showFoods").get(controller.showFoods);
router.route("/addMovie").post(checkAuth, memUpload.single("file"), controller.addMovie);

module.exports = router;
