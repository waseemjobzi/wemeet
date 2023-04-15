const mongoose = require("mongoose");
const UploadSchema = new mongoose.Schema(
  {
    originalname: {
      type: [String],
      required: true,
    },
    mimetype: {
      type: String,
    },
    bucket: {
      type: String,
      required: true,
    },
    key: {
      type: [String],
      required: true,
    },
    location: {
      type: [String],
      required: true,
    },
    deleted: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Upload", UploadSchema);
