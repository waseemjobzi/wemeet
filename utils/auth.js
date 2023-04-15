
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
module.exports = {
  generateOTP,
  generateRandomPassword,
  // isAdmin,
};
