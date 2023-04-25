const { Router } = require("express");
const { checkAuth } = require("../../middlewares/authorization");
const controller = require("./transaction.controller");
const router = Router();
router.route("/initiate").post(checkAuth, controller.initPayment);
router.route("/success").post(checkAuth,controller.callback);
// router.route("/simulation").get(controller.orderSuccessSimulation);

module.exports = router;
