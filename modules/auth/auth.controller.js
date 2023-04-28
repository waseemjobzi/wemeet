const UserModel = require("../user/user.model");

const { generateOTP } = require("../../utils/auth");
const { sendSuccess, sendError } = require("../../utils/response");
const { generateJWT } = require("../../utils/jwt");
const request = require('request');

class Controller {
  async sendOTP(req, res, next) {
    const { phone_number } = req.body;

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
    request(
      ` https://api2.growwsaas.com/fe/api/v1/send?username=jobzi&password=Jobzi@$123&unicode=false&from=JOBZII&to=${phone_number}&text=${otp}%20is%20the%20OTP%20for%20your%20mobile%20number%20verification%20from%20JOBZII%20(Please%20do%20not%20disclose%20the%20OTP%20to%20anyone.)%0ACall%20%26%20Chat%20with%20nearby%20Candidates%20%26%20Freelancers%20in%20seconds%0APlease%20write%20us%20at%20-%20${`support@jobzi.in`}%20for%20any%20queries%20or%20suggestions.%0APlease%20visit%20-%20${`www.jobzi.in`}%20for%20more%20details.%0A&dltContentId=1507166368857575940`,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
      }
    );
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
