const mongoose = require("mongoose");
const coordsSchema = require("./coords.schema");

const AddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    full_address: {
      type: String,
    },
    coords: {
      type: coordsSchema,
      index: "2dsphere",
    },
  },
  {
    _id: false,
  }
);

module.exports = AddressSchema;
