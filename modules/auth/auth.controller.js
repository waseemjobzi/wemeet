const UserModel = require("../user/user.model");

const { generateOTP } = require("../../utils/auth");
const { sendSuccess, sendError } = require("../../utils/response");
const { generateJWT } = require("../../utils/jwt");
let unirest = require("unirest");

class Controller {
  async sendOTP(reqe, res, next) {
    const { phone_number } = reqe.body;

    let otp = generateOTP();
    let user;
    try {
      user = await UserModel.findOneAndUpdate(
        {
          phone_number,
        },
        {
          phone_number,
          otp,
          provider: {
            name: "phone_number",
          },
        },
        { upsert: true, new: true }
      )
        .select("phone_number otp_verified role")
        .lean();
    } catch (err) {
      return next(err);
    }

    let req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

    req.query({
      "authorization": process.env.SMS_API_KEY,
      "sender_id": "TXTIND",
      "message": `Hi, ${otp} is your One-Time Password for Jobzi.`,
      "route": "v3",
      "numbers": phone_number
    });

    req.headers({
      "cache-control": "no-cache"
    });


    req.end(function (res) {
      if (res.error) throw new Error(res.error);

      console.log(res.body);
    });
    return sendSuccess(res, {
      message: "OTP has been sent!",
      otp: otp,
      userrole: user.role,
    });
  }

  async verifyOTP(req, res, next) {
    const { phone_number, otp, isAppDownloaded = false } = req.body;

    let user;
    try {
      user = await UserModel.findOne({ phone_number }).exec();
    } catch (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({
        message: "something is wrong ",
      });
    }
    if (parseInt(otp) !== user.otp) {
      return sendError(next, "Incorrect OTP", 401);
    }
    try {
      user = await UserModel.findByIdAndUpdate(
        user._id,
        { otp_verified: true, otp: null },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    if (isAppDownloaded) {
      try {
        await UserModel.findOneAndUpdate(
          { phone_number },
          { isAppDownloaded },
          { upsert: true, new: true }
        ).exec();
      } catch (err) {
        return next(err);
      }
    }
    const token = generateJWT({ id: user._id, role: user.role });

    return sendSuccess(res, {
      token,
      account: user,
    });
  }

  async loginMobile(req, res, next) {
    const { phone_number } = req.body;

    let user;
    try {
      user = await UserModel.findOne({ phone_number }).exec();
    } catch (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({
        message: "something is wrong ",
      });
    }
    const token = generateJWT({ id: user._id, gender: user.gender });

    return sendSuccess(res, {
      token,
      account: user,
    });
  }
  async addUserRole(req, res, next) {
    const { _id: userID } = req.user;
    const { role } = req.body;
    let account;
    try {
      account = await UserModel.findByIdAndUpdate(
        userID,
        {
          role,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    return sendSuccess(res, { account });
  }
}

module.exports = new Controller();
