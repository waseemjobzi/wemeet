const { Router } = require("express");
const router = Router();
const authRouter = require("./modules/auth/auth.route");


router.use("/auth", authRouter);


module.exports = router;
