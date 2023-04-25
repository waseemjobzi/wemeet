const { pick } = require("lodash");
const userModel = require("./user.model");

class UserService {
    updateUserDeviceDetails = async (userId, body) => {
        const updateBody = pick(body, ["last_location"]);
        if (updateBody.last_location.coords) {
            updateBody.last_location.coords = {
                coordinates: updateBody.last_location.coords,
            };
        }
        await userModel.findByIdAndUpdate(userId, updateBody, {
            new: true,
        }).lean();
    };
}
module.exports = new UserService();
