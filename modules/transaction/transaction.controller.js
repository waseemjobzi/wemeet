const { sendSuccess, sendError } = require("../../utils/response");
const packageModel = require("../package/package.model");
const transactionService = require("./transaction.service");
const Transaction = require("./transcation.model");

class Controller {
  initPayment = async (req, res, next) => {
    const { packageId } = req.body;
    const { _id: userId, Phone_number } = req.user;
    const plan = await packageModel.findById(packageId).lean();
    if (!plan) {
      return sendError(next, "Invalid plan");
    }
    let transaction;
    try {
      transaction = await transactionService.initiateTransaction(
        packageId,
        plan.price,
        {
          payeeId: userId,
          payeePhoneNumber: Phone_number,
        }
      );
    } catch (err) {
      return next(err);
    }

    transaction = transaction.toJSON();
    transaction.merchant_key = process.env.RZP_KEY;
    return sendSuccess(res, transaction);
  };

  orderSuccessSimulation = async (req, res, next) => {
    const { orderId } = req.query;

    let paymentSuccesResponse;
    try {
      paymentSuccesResponse = await transactionService.handlePaymentSuccess({
        order_id: orderId,
        id: 1234,
        method: "TEST",
      });
      console.log("Payment success", "Plan of user changed");
    } catch (err) {
      return next(err);
    }

    try {
      const { user, plan, order, expiry } = paymentSuccesResponse;
      await transactionService.sendPaymentConfimatioMail(
        user,
        order,
        plan,
        expiry
      );
    } catch (err) {
      return next(err);
    }

    res.end();
  };

  callback = async (req, res) => {
    const { orderId, payment_id, method = "upi" } = req.body;
    let paymentSuccesResponse;
    console.log('req.body', req.body)
    try {
      paymentSuccesResponse = await transactionService.handlePaymentSuccess(
        orderId,
        payment_id,
        method
      );
      
    } catch (err) {
      console.log(err);
    }

    // try {
    //   const { user, plan, order, expiry } = paymentSuccesResponse;
    //   await transactionService.sendPaymentConfimatioMail(
    //     user,
    //     order,
    //     plan,
    //     expiry
    //   );
    // } catch (err) {
    //   console.log(err);
    // }

    res.send({ success: true ,paymentSuccesResponse});
  };

  findMy = async (req, res, next) => {
    const { _id: userID } = req.user;

    let transactions;
    try {
      transactions = await Transaction.find({
        payee: userID,
      }).sort("-createdAt");
    } catch (err) {
      return next(err);
    }

    return sendSuccess(res, transactions);
  };
}

module.exports = new Controller();
