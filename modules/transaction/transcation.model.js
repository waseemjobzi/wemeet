const mongoose = require("mongoose");
const transactionStatusList = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"];
const TransactionSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
    },
    receipt_id: {
      type: String,
    },
    payment_id: {
      type: String,
    },
    method: {
      type: String,
    },
    amount: {
      type: Number,
    },
    customer_phone_number: {
      type: String,
    },
    status: {
      type: String,
      enum: transactionStatusList,
      default: transactionStatusList[0],
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({
  order_id: 1,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
