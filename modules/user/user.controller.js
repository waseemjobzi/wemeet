const { sendSuccess, sendError } = require("../../utils/response");
const { getFields, s3DeleteObjects } = require("../../utils/upload");
const UserModel = require("../user/user.model");
const uploadModel = require("./upload.model");
const uploadService = require("./upload.service");
const { uploadS3Wrapper } = require("./upload.service");

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
    const { image_key: location } = req.body;
    const associatedApplicant = await UserModel.findById({ _id: userId }).populate("image")
      .lean()
      .exec();
    console.log(location, 'associatedApplicant', associatedApplicant)
    if (!associatedApplicant) {
      return sendError(next, "User does not exist",401);
    }
    try {
      let pic = await uploadModel.updateOne(
        { _id: userId },
        { $pull: { location:location } }, { new: true }
      );
      // await s3DeleteObjects([{ Key: key }]);
    } catch (err) {
      return next(err);
    }

    // try {
    //   await uploadModel.deleteOne({ key });
    // } catch (err) {
    //   return next(err);
    // }

    // try {
    //   await UserModel.updateOne(
    //     { _id: associatedApplicant._id },
    //     {
    //       image: null,
    //       image_url: null,
    //     }
    //   );
    // } catch (err) {
    //   return next(err);
    // }

    sendSuccess(res, { message: "image removed" });
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
}

module.exports = new Controller();
