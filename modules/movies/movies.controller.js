const { sendSuccess, sendError } = require("../../utils/response");
const moviesModel = require("./movies.model");
const { uploadS3Wrapper } = require("../user/upload.service");

class Controller {

  addMovie = async (req, res, next) => {
    try {
      if (!req.file) {
        return sendError(next, "Payload not found", 400);
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
        newUpload = await moviesModel.create({
          originalname: uploadRes.originalname, bucket: uploadRes.Bucket,
          key: uploadRes.key, location: uploadRes.location, type: req.body.type, name: req.body.name
        });
      } catch (err) {
        return next(err);
      }
      sendSuccess(res, newUpload);
    } catch (error) {
      return sendError(
        next,
        "something is wrong", 401
      );
    }
  }
  showMovies = async (req, res, next) => {
    try {
      let data = await moviesModel.find({ type: "Movie" }).select("name location")
      sendSuccess(res, data)
    } catch (error) {
      return sendError(
        next,
        "movie not found", 401
      );
    }
  }
  showFoods = async (req, res, next) => {
    try {
      let data = await moviesModel.find({ type: "Food" }).select("name location")
      sendSuccess(res, data)
    } catch (error) {
      sendError(next, "Food not found", 401)
    }
  }
}

module.exports = new Controller();
