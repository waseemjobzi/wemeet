const jwt = require("jsonwebtoken");
const UserModel = require("../modules/user/user.model")

async function checkAuth(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    const err = new Error("Auth token missing.");
    err.status = 401;
    return next(err);
  }

  token = token.split(" ")[1];

  const decoded = jwt.decode(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }

  let user;
  try {
    user = await UserModel.findById(decoded.id)
      .select(
        "_id email name phone_number role blocked confirmed last_location active_plan gender preferedGender bio"
      )
      .lean()
      .exec();
      console.log('user', user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }



    if (user.blocked) {
      return res.status(401).json({
        success: false,
        blocked: true,
        message:
          "You have been reported by other users. Please contact: support@jobzi.in",
      });
    }
  } catch (err) {
    return next(err);
  }

  req.user = user;
  next();
}



module.exports = {
  checkAuth,
};
