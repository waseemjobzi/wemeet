// const { Router } = require("express");
// const { checkAuth } = require("../../middlewares/authorization");
// const { memUpload } = require("../../middlewares/upload");
// const controller = require("./user.controller");
// const router = Router();

// router
//   .route("/")
//   .get(checkAuth, controller.findByQuery)
//   .put(checkAuth, controller.updateOne);

// router.put("/update_device_details", checkAuth, controller.updateDeviceDetails);

// router.route("/me").get(checkAuth, controller.me);

// router
//   .route("/settings")
//   .get(checkAuth, controller.getSettings)
//   .put(checkAuth, controller.updateSettings);

// router.route("/plan").get(checkAuth, controller.getMyPlan);

// router
//   .route("/block_company")
//   .get(checkAuth, controller.findBlockedCompanies)
//   .put(checkAuth, controller.blockCompany);

// router.route("/:id").get(checkAuth, controller.findById);

// router.post("/email_resume", checkAuth, controller.emailCandidateResume);

// router.post(
//   "/email_resume_tomany",
//   checkAuth,
//   controller.emailCandidateResumeToAll
// );
// router.post("/findByUsername", checkAuth, controller.findByUsername);
// router.post("/showUsername", checkAuth, controller.showUsernames);
// router.post("/showCities", controller.showCities);
// router.route("/find").post(controller.findByuserId);
// router.route("/nonItCandidate").put(checkAuth, controller.nonItCandidate);
// router
//   .route("/find_candidate_by_skills")
//   .post(checkAuth, controller.findCandidateBySkills);
// router
//   .route("/find_jobs_by_skills")
//   .post(checkAuth, controller.findJobsBySkills);
// router.route("/saveNonItSkills").post(checkAuth, controller.saveNonItSkills);
// router.route("/filterJobs").post(checkAuth, controller.filterJobs);
// router.route("/filterCandidate").post(checkAuth, controller.filterCandidate);
// router.route("/findBankCandidate").post(checkAuth, controller.findBankCandidate);
// router.route("/findSavedBankCandidate").post(checkAuth,controller.findSavedBankCandidate)
// router
//   .route("/image")
//   .post(checkAuth, memUpload.single("file"), controller.uploadImage)
//   .put(checkAuth, controller.removeImage);



// module.exports = router;
