const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(`.env.${process.env.NODE_ENV}`),
});

console.log(`${process.env.NODE_ENV} env variables set`);
