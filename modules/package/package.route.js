const { Router } = require("express");
const controller = require("./package.controller");
const { checkAuth } = require("../../middlewares/authorization");
const router = Router();
router.route("/showPackage").get(controller.showPackage);
// router.route("/connects").get(controller.connectCount);

module.exports = router;
