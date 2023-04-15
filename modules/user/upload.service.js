const path = require("path");
const { v4: uuid } = require("uuid");
const {
  s3DeleteObjects,
  convertFile,
  s3UploadObject,
  docMimeTypes,
} = require("../../utils/upload");
const uploadModel = require("./upload.model");

class Service {
  deleteFiles = async (uploadIds) => {
    const files = await uploadModel.findOne({ _id: uploadIds }).select("key").lean();
    if (files.length === 0) {
      return;
    }
    const keys = files.key.map((item) => ({
      Key: item,
    }));
    for (let key of keys) {
      await s3DeleteObjects([{ Key: key.Key }]);
    }
    await uploadModel.deleteOne({ _id: uploadIds });
  };

  uploadS3Wrapper = async (file) => {
    let fileBuf = file.buffer;
    let extname = path.extname(file.originalname);

    if (docMimeTypes.includes(extname)) {
      try {
        fileBuf = await convertFile(fileBuf);
        extname = ".pdf";
      } catch (err) {
        console.log(err);
      }
    }

    let s3UploadResponse;
    const filename = `${uuid()}${extname}`;
    console.log('filename', filename)

    s3UploadResponse = await s3UploadObject(
      fileBuf,
      filename,
      process.env.AWS_S3_BUCKET
    );

    s3UploadResponse.originalname = file.originalname;
    s3UploadResponse.bucket = s3UploadResponse.Bucket;
    s3UploadResponse.location = s3UploadResponse.Location;

    return s3UploadResponse;
  };

}

module.exports = new Service();
