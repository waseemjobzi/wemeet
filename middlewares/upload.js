const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const { allowedMimeTypes } = require("../utils/upload");

if (!fs.existsSync(`${global.rootDir}/uploads`)) {
  fs.mkdir(`${global.rootDir}/uploads`, () => {});
}

function fileFilter(req, file, callback) {
  const extname = path.extname(file.originalname);
  if (!allowedMimeTypes.includes(extname)) {
    return callback(new Error("File type not allowed"));
  }
  callback(null, true);
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${global.rootDir}/uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuid()}${path.extname(file.originalname)}`);
  },
});
const localUpload = multer({
  storage: diskStorage,
  fileFilter,
});

const memStorage = multer.memoryStorage();
const memUpload = multer({
  storage: memStorage,
});

module.exports = {
  localUpload,
  memUpload,
};
