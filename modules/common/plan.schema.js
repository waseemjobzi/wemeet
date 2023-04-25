const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    trialing: {
      type: Boolean,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    start: {
      type: Date,
      default: new Date(),
    },
    end: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: true,
  }
);

module.exports = PlanSchema;
