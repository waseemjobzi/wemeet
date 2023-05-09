const { pick } = require("lodash");
const userModel = require("./user.model");
const uploadModel = require("./upload.model");

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
    uploadUserdata = async (data) => {
        const users = [];
        for (let user of data) {
            let account;
            let phone_number = user["phone_number"];
            let name = user["name"];
            let age = user["age"];
            let gender = user["gender"];
            let preferedGender = user["preferedGender"];
            let bio = user["bio"];
            let profession = user["profession"];
            let images = user["file"];
            let movies = user["movies"];
            let food = user["food"];
            movies = movies.split(",")
            food = food.split(",")
            try {
                account = await userModel.create({ phone_number, name, age, gender, preferedGender, bio, movies, food, profession });
                users.push(account)
            } catch (err) {
                console.log('err :>> ', err);
            }
            if (!account) {
                console.log('account :>> ', account);
            } else {
                let newUpload;
                try {
                    newUpload = await uploadModel.create({ originalname: images, bucket: process.env.AWS_S3_BUCKET, key: images, location: images });
                } catch (err) {
                    console.log('err :>> ', err);
                }
                try {
                    await userModel.findByIdAndUpdate(account._id, {
                        image: newUpload._id,
                    })
                } catch (err) {
                    console.log('err :>> ', err);
                }
            }
        }
        return users;
    };
}
module.exports = new UserService();
