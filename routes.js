const { Router } = require("express");
const router = Router();
const authRouter = require("./modules/auth/auth.route");
const userRouter = require("./modules/user/user.route");
const moviesRouter = require("./modules/movies/movies.route");
const packageRouter = require("./modules/package/package.route");
const transactionRouter = require("./modules/transaction/transaction.route");




router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/movies", moviesRouter)
router.use("/package", packageRouter)
router.use("/transaction",transactionRouter)


module.exports = router;
