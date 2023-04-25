const { sendSuccess, sendError } = require("../../utils/response");
const packageModel = require("./package.model");

class Controller {


    showPackage = async (req, res, next) => {
        try {
            // let data = await packageModel.create({
            //     packageName: "Horizon",
            //     description: ["Unlimited connect per day", "get discount coupon on connects","Speed Dating"]
            //     , price: 399
            // })
            let data=await packageModel.find({})
        sendSuccess(res, data)
        } catch (error) {
            sendError(next, "somthing is wrong", 401)
        }
    }
}

module.exports = new Controller();
