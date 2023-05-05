const mongoose = require("mongoose");
const ConnectionSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("Connection", ConnectionSchema);
