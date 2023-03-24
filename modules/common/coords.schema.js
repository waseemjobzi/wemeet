const mongoose = require("mongoose");

const coordsSchema = new mongoose.Schema(
  {
    type: {
      type: "String",
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
  }
);

module.exports = coordsSchema;
