const mongoose = require("mongoose");
const interactionTypeList = ["LIKE", "DISLIKE", "CONNECT", "CALL", "CHAT"];

const NotificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: interactionTypeList,
        },
        message: {
            type: String,
        },
        createdDate: {
            type: String,
            default: new Date().toDateString(),
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("Notification", NotificationSchema);
