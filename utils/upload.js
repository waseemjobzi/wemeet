const libre = require("libreoffice-convert");
const aws = require("aws-sdk");
const { pick } = require("lodash");
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_BUCKET_REGION,
});

const S3 = new aws.S3();
libre.convertAsync = require("util").promisify(libre.convert);

function getFields(data) {
  if (!data) return null;
  return pick(data, ["originalname", "bucket", "key", "location"]);
}

async function s3UploadObject(
  filestream,
  key,
  bucket = process.env.AWS_S3_BUCKET
) {
  return S3.upload({
    Key: key,
    Bucket: bucket,
    Body: filestream,
  }).promise();
}

async function s3DeleteObjects(key, bucket = process.env.AWS_S3_BUCKET) {
  if (typeof key === "string") {
    key = { Key: key };
  }

  return new Promise((resolve, reject) => {
    S3.deleteObjects(
      { Bucket: bucket, Delete: { Objects: key } },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('data', data)
          resolve(data);
        }
      }
    );
  });
}


async function convertFile(fileBuffer, ext = ".pdf") {
  const convertedBuf = await libre.convertAsync(fileBuffer, ext, undefined);
  return convertedBuf;
}

const docMimeTypes = [".dot", ".doc", ".docx", ".dotx", ".dotm", ".docm"];
const allowedMimeTypes = [
  ...docMimeTypes,
  ".pdf",
  ".jpg",
  ".png",
  ".jpeg",
  ".xlsx",
];

module.exports = {
  S3,
  getFields,
  s3UploadObject,
  s3DeleteObjects,
  convertFile,
  docMimeTypes,
  allowedMimeTypes,
};
