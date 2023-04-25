const mongoose = require("mongoose");
const PackageSchema = new mongoose.Schema(
    {
        packageName: {
            type: String,
            required: true,
        },
        description: {
            type: [String],
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("Package", PackageSchema);
