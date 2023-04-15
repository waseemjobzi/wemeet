const { sendSuccess } = require("../../utils/response");
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
      account = await UserModel.findByIdAndUpdate(_id, req.body, { new: true });
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

    if (prevApplicant.image) {
      try {
        await uploadService.deleteFiles(prevApplicant.image._id);
      } catch (err) {
        console.log(err);
      }
    }
    sendSuccess(res, newUpload);


  };
  removeImage = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { image } = req.body;
    let img = await uploadModel.findById({ _id: image });
    let key = img.key;
    let ids;
    const associatedApplicant = await UserModel.findById({ _id: userId })
      .lean()
      .exec();
    if (!associatedApplicant) {
      return sendError(next, "hr does not exist");
    }

    try {
      await s3DeleteObjects([{ Key: key }]);
    } catch (err) {
      return next(err);
    }

    try {
      await uploadModel.deleteOne({ key });
    } catch (err) {
      return next(err);
    }

    try {
      await UserModel.updateOne(
        { _id: associatedApplicant._id },
        {
          image: null,
          image_url: null,
        }
      );
    } catch (err) {
      return next(err);
    }

    sendSuccess(res, { message: "image removed" });


  };
}

module.exports = new Controller();
