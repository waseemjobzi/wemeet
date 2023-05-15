const { Router } = require("express");
const { checkAuth } = require("../../middlewares/authorization");
const { memUpload, localUpload } = require("../../middlewares/upload");
const controller = require("./user.controller");
const router = Router();

router.route("/create").put(checkAuth, controller.updateOne);
router
  .route("/image")
  .post(checkAuth, memUpload.array("files"), controller.uploadImage)
  .put(checkAuth, controller.removeImage);
router.route("/updateImage").post(checkAuth, memUpload.array("files"), controller.updateImage)

router.route("/find/:id").get(checkAuth, controller.findById);
router.route("/uploadVideo").post(checkAuth, memUpload.single("file"), controller.uploadVideo).put(checkAuth, controller.removeVedio);

router.route("/recommendation").post(checkAuth,controller.getRecommendation)
router.route("/like/:id").get(checkAuth, controller.Like)
router.route("/deleteLike/:id").get(checkAuth, controller.DeleteLike)
router.route("/uploadUser").post(memUpload.array("files"), controller.uploadUser);
router.put("/update_location", checkAuth, controller.update_location);
router.post("/showLikes", checkAuth, controller.showLikes)
router.get("/whoLikesMe", checkAuth, controller.whoLikesMe)
router.post("/filter",checkAuth,controller.filter)
router.get("/userActiveTrue/:channelName",checkAuth,controller.userActiveTrue)
router.get("/userActiveFalse",checkAuth,controller.userActiveFalse)
router.get("/speedDatingRecommendation",checkAuth,controller.speedDatingRecommendation)
router.get("/connects",checkAuth,controller.connects)
router.get("/getConnection",checkAuth,controller.getConnection)
router.get("/deleteConnection/:id",checkAuth,controller.deleteConnection)
router.get("/getNotification/:id",checkAuth,controller.getNotification)
router.route("/excelUploadUser").post(localUpload.single("file"), controller.excelUploadUser);
router.route("/getallUsers").get(controller.getallUsers)





module.exports = router;
