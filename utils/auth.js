
function generateOTP() {
  let otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

const charset =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateRandomPassword(length = 8) {
  let retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

// function isAdmin(req, res, next) {
//   if (req.user.role !== roles[4]) {
//     return res.status(401).json({
//       message: "Unauthorized",
//     });
//   }

//   next();
// }

module.exports = {
  generateOTP,
  generateRandomPassword,
  // isAdmin,
};
