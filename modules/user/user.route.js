const { Router } = require("express");
const { checkAuth } = require("../../middlewares/authorization");
const { memUpload } = require("../../middlewares/upload");
const controller = require("./user.controller");
const router = Router();

router
  .route("/create")
  .put(checkAuth, controller.updateOne);
router
  .route("/image")
  .post(checkAuth, memUpload.array("files"), controller.uploadImage)
  .put(checkAuth, controller.removeImage);
router.route("/updateImage").post(checkAuth, memUpload.array("files"), controller.updateImage)
router.route("/:id").get(checkAuth, controller.findById);
router.route("/uploadVideo").post(checkAuth, memUpload.single("file"), controller.uploadVideo)




module.exports = router;
