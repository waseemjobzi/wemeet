const mongoose = require("mongoose");
const ConnectSchema = new mongoose.Schema(
    {
        count: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("Connect", ConnectSchema);
