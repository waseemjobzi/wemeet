const { sendSuccess, sendError } = require("../../utils/response");
const UserModel = require("../user/user.model");
const uploadModel = require("./upload.model");
const uploadService = require("./upload.service");
const { uploadS3Wrapper } = require("./upload.service");
const userService = require("./user.service");

class Controller {
  async updateOne(req, res, next) {
    const { _id } = req.user;
    console.log(req.body, '_id', _id)
    let account;
    try {
      account = await UserModel.findByIdAndUpdate(_id, req.body, { new: true }).populate("image");
    } catch (err) {
      return next(err);
    }
    return sendSuccess(res, { account });
  }
  uploadImage = async (req, res, next) => {
    if (!req.files.length > 0) {
      return sendError(next, "Payload not found", 400);
    }
    const { _id } = req.user;
    let associatedUser = await UserModel.findOne({ _id }).lean();

    if (!associatedUser) {
      return sendError(next, "user does not exist");
    }
    let uploadRes;
    let keys = []
    let locations = []
    let originalnames = []
    for (let file of req.files) {
      try {
        uploadRes = await uploadS3Wrapper(file);
        keys.push(uploadRes.key)
        locations.push(uploadRes.location)
        originalnames.push(uploadRes.originalname)
        console.log(uploadRes, "originalname")
      } catch (err) {
        return next(err);
      }
    }
    let newUpload;
    try {
      newUpload = await uploadModel.create({ originalname: originalnames, bucket: uploadRes.Bucket, key: keys, location: locations });
    } catch (err) {
      return next(err);
    }

    let prevApplicant;
    try {
      prevApplicant = await UserModel.findByIdAndUpdate(associatedUser._id, {
        image: newUpload._id,
      })
        .populate("image")
        .lean();
    } catch (err) {
      return next(err);
    }

    // if (prevApplicant.image) {
    //   try {
    //     await uploadService.deleteFiles(prevApplicant.image._id);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    sendSuccess(res, newUpload);


  };
  removeImage = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { url } = req.body;
    const associatedApplicant = await UserModel.findById({ _id: userId })
      .lean()
      .exec();
    if (!associatedApplicant) {
      return sendError(next, "User does not exist", 401);
    }
    try {
      await uploadModel.updateOne(
        { _id: associatedApplicant.image },
        { $pull: { location: url } }
      );
    } catch (err) {
      return next(err);
    }
    sendSuccess(res, { message: "image removed" });
  };
  removeVedio = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { url } = req.body;
    const associatedApplicant = await UserModel.findById({ _id: userId })
      .lean()
      .exec();
    if (!associatedApplicant) {
      return sendError(next, "User does not exist", 401);
    }
    try {
      let pic = await uploadModel.updateOne(
        { _id: associatedApplicant.video },
        { $pull: { location: url } }
      );
    } catch (err) {
      return next(err);
    }
    sendSuccess(res, { message: "vedio removed" });
  };
  updateImage = async (req, res, next) => {

    if (!req.files.length > 0) {
      return sendError(next, "Payload not found", 400);
    }
    const { _id } = req.user;
    let associatedUser = await UserModel.findOne({ _id }).lean().populate("image");
    console.log('associatedUser', associatedUser)
    if (!associatedUser) {
      return sendError(next, "user does not exist");
    }
    let uploadRes;
    let keys = []
    let locations = []
    let originalnames = []
    for (let file of req.files) {
      try {
        uploadRes = await uploadS3Wrapper(file);
        keys.push(uploadRes.key)
        locations.push(uploadRes.location)
        originalnames.push(uploadRes.originalname)
      } catch (err) {
        return next(err);
      }
    }
    let keysum = [...keys, ...associatedUser?.image?.key]
    let locationsum = [...locations, ...associatedUser?.image?.location]
    let originalnamesum = [...originalnames, ...associatedUser?.image?.originalname]
    let newUpload;
    try {
      newUpload = await uploadModel.create({ originalname: originalnamesum, bucket: uploadRes.Bucket, key: keysum, location: locationsum });
    } catch (err) {
      return next(err);
    }

    let prevApplicant;
    try {
      prevApplicant = await UserModel.findByIdAndUpdate(associatedUser._id, {
        image: newUpload._id,
      })
        .populate("image")
        .lean();
    } catch (err) {
      return next(err);
    }

    if (prevApplicant.image) {
      try {
        await uploadModel.deleteOne({ _id: prevApplicant.image._id });
      } catch (err) {
        console.log(err);
      }
    }
    sendSuccess(res, newUpload);
  }
  findById = async (req, res, next) => {
    try {
      let data = await UserModel.findById({ _id: req.params.id }).populate("image video")
      sendSuccess(res, data)
    } catch (error) {
      sendError(next, "user not found")
    }
  }
  uploadVideo = async (req, res, next) => {
    try {
      if (!req.file) {
        return sendError(next, "Payload not found", 400);
      }
      const { _id } = req.user;
      let associatedUser = await UserModel.findOne({ _id }).lean();

      if (!associatedUser) {
        return sendError(next, "user does not exist");
      }
      let uploadRes;

      try {
        uploadRes = await uploadS3Wrapper(req.file);
        console.log('uploadRes', uploadRes)
      } catch (err) {
        return next(err);
      }
      let newUpload;
      try {
        newUpload = await uploadModel.create({
          originalname: uploadRes.originalname, bucket: uploadRes.Bucket,
          key: uploadRes.key, location: uploadRes.location
        });
      } catch (err) {
        return next(err);
      }

      let prevApplicant;
      try {
        prevApplicant = await UserModel.findByIdAndUpdate(associatedUser._id, {
          video: newUpload._id,
        })
          .populate("video")
          .lean();
      } catch (err) {
        return next(err);
      }


      sendSuccess(res, newUpload);
    } catch { }
  }
  getRecommendation = async (req, res, next) => {
    const { preferedGender } = req.user
    try {
      let populates = [
        { path: "image", select: "location" },
        { path: "video", select: "location" },
      ];
      const user = await UserModel.find({
        gender: { $in: preferedGender },
        _id: { $ne: req.user._id },
        age: {
          $lte: 50,
          $gte: 15
        },
      }).populate(populates)
      sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }
  Like = async (req, res, next) => {
    try {
      const { _id } = req.user;
      let user = await UserModel.findById(_id).select("likes")
      let likes = [...user.likes || 0, req.params.id]
      const userLikes = await UserModel.findByIdAndUpdate(_id, { likes })
      sendSuccess(res, userLikes)
    } catch (error) {
      sendError(next, "you have exceed you connects limit Please recharge", 400)
    }
  }
  uploadUser = async (req, res, next) => {
    let account;
    const { phone_number, name, age, gender, preferedGender, bio, profession } = req.body
    let movies = req.body.movies.split(",")
    let food = req.body.food.split(",")
    try {
      account = await UserModel.create({ phone_number, name, age, gender, preferedGender, bio, movies, food, profession });
    } catch (err) {
      return next(err);
    }
    if (!req.files.length > 0) {
      return sendError(next, "Payload not found", 400);
    }

    if (!account) {
      return sendError(next, "user does not exist");
    }
    let uploadRes;
    let keys = []
    let locations = []
    let originalnames = []
    for (let file of req.files) {
      try {
        uploadRes = await uploadS3Wrapper(file);
        keys.push(uploadRes.key)
        locations.push(uploadRes.location)
        originalnames.push(uploadRes.originalname)
      } catch (err) {
        return next(err);
      }
    }
    let newUpload;
    try {
      newUpload = await uploadModel.create({ originalname: originalnames, bucket: uploadRes.Bucket, key: keys, location: locations });
    } catch (err) {
      return next(err);
    }
    try {
      await UserModel.findByIdAndUpdate(account._id, {
        image: newUpload._id,
      })
        .populate("image")
        .lean();
    } catch (err) {
      return next(err);
    }
    return sendSuccess(res, { account });
  }
  async update_location(req, res, next) {
    const { _id: userId } = req.user;
    try {
      await userService.updateUserDeviceDetails(
        userId,
        req.body,
      );
    } catch (err) {
      return next(err);
    }

    return sendSuccess(res, { message: "Device details updated" });
  }
  async showLikes(req, res, next) {
    const { _id } = req.user;
    let populates = [
      { path: "image", select: "location" },
      { path: "video", select: "location" },
    ];
    try {
      let likes = await UserModel.findById(_id).select("likes")
      let users = []
      for (let data of likes.likes) {
        let likes = await UserModel.findById(data).populate(populates)
        users.push(likes)
      }
      sendSuccess(res, users)
    } catch (error) {
      sendError(next, "not likes", 400)
    }
  }
  async whoLikesMe(req, res, next) {
    const { _id } = req.user;
    let populates = [
      { path: "image", select: "location" },
      { path: "video", select: "location" },
    ];
    try {
      let likes = await UserModel.find({ "likes": { $in: _id } }).populate(populates)
      sendSuccess(res, likes)
    } catch (error) {
      sendError(next, "not likes", 400)
    }
  }
  async filter(req, res, next) {
    const { preferedGender, max_age, min_age } = req.body
    try {
      let populates = [
        { path: "image", select: "location" },
        { path: "video", select: "location" },
      ];
      const user = await UserModel.find({
        gender: { $in: preferedGender },
        _id: { $ne: req.user._id },
        age: {
          $lte: max_age,
          $gte: min_age
        },
      }).populate(populates)
      sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }
  async userActiveTrue(req, res, next) {
    const { _id } = req.user
    try {
      let user = await UserModel.findByIdAndUpdate(_id, { active: true })
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  }
  async userActiveFalse(req, res, next) {
    const { _id } = req.user
    try {
      let user = await UserModel.findByIdAndUpdate(_id, { active: false })
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  }
  speedDatingRecommendation = async (req, res, next) => {
    const { preferedGender } = req.user
    try {
      let populates = [
        { path: "image", select: "location" },
        { path: "video", select: "location" },
      ];
      const user = await UserModel.find({
        gender: { $in: preferedGender },
        _id: { $ne: req.user._id },
        active:true
      }).populate(populates)
      sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new Controller();