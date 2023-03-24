const { Router } = require("express");
const router = Router();
const controller = require("./auth.controller");
// router.route("/logout").post(controller.logout);

router
  .route("/sendOTP")
  .post(controller.sendOTP);
router
  .route("/verifyOTP")
  .post( controller.verifyOTP);

router
  .route("/loginMobile")
  .post(controller.loginMobile);


router.route("/add_user_role").post(controller.addUserRole);

module.exports = router;
