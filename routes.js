const { Router } = require("express");
const router = Router();
const authRouter = require("./modules/auth/auth.route");
const userRouter = require("./modules/user/user.route");
const moviesRouter = require("./modules/movies/movies.route");




router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/movies",moviesRouter)




module.exports = router;
