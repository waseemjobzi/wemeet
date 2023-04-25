const { default: axios } = require("axios");
const Transaction = require("./transcation.model");
const packageModel = require("../package/package.model");
const userModel = require("../user/user.model");

class TransactionService {
  initiateTransaction = async (planId, amount, { payeeId, payeephone_number }) => {
    const paymentParams = {
      amount: amount * 100,
      currency: "INR",
      receipt: Date.now().toString(),
      notes: {
        planId,
      },
    };

    const { data } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      paymentParams,
      {
        auth: {
          username: process.env.RZP_KEY,
          password: process.env.RZP_SECRET,
        },
      }
    );
    console.log('data', data)
    const newTransaction = await Transaction.create({
      receipt_id: data.receipt,
      amount,
      payee: payeeId,
      status: "PENDING",
      customer_phone_number: payeephone_number,
      order_id: data.id,
      package_id: planId,
    });

    return newTransaction;
  };

  handlePaymentSuccess = async (orderId, payment_id, method) => {
    let order = await Transaction.findOne({ order_id: orderId }).lean();
    if (!order) {
      throw new Error("Invalid Order");
    }

    const targetPlan = await packageModel.findById(order.package_id)
      .select("name expiry")
      .lean();

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const user = await userModel.findByIdAndUpdate(order.payee, {
      wallet: order.amount.value,
      active_plan: {
        plan: targetPlan._id,
        start: new Date(),
        end: expiry,
        active: true,
        trialing: false,
      },
    })
      .select("name phone_number")
      .lean();
    order = await Transaction.findOneAndUpdate(
      { order_id: orderId },
      {
        status: "SUCCESS",
        payment_id,
        method,
      }
    );

    await userModel.updateOne(
      { _id: order.payee },
      { last_transaction: order._id, }
    );

    return { user, plan: targetPlan, order, expiry };
  };

  // sendPaymentConfimatioMail = async (
  //   targetUserDetails,
  //   orderDetails,
  //   planDetails,
  //   expiry
  // ) => {
  //   const { email, name } = targetUserDetails;
  //   const { order_id, method, amount, payment_id } = orderDetails;
  //   const { name: pName } = planDetails;

  //   const pMrp = amount.value * 3.5;
  //   const pDiscount = amount.value * 2.5 + amount.value * 0.18;
  //   const pGST = amount.value * 0.18;
  //   const pAmount = pMrp - pDiscount;

  //   await mailService.sendMailWithTemplate(
  //     email,
  //     getMailSubjects(mailTemplateName.PAYMENT_CONFIRMATION),
  //     mailTemplateName.PAYMENT_CONFIRMATION,
  //     {
  //       targetName: name,
  //       orderId: order_id,
  //       pName,
  //       orderStart: new Date().toDateString(),
  //       orderEnd: expiry.toDateString(),
  //       pMrp: `₹${pMrp}`,
  //       pDiscount: `₹${pDiscount}`,
  //       pAmount: `₹${pAmount}`,
  //       pGST: `₹${pGST}`,
  //       pTotal: `₹${amount.value}`,
  //       paymentMode: method,
  //       txnid: payment_id,
  //     }
  //   );
  // };
}

module.exports = new TransactionService();
