const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AddressSchema = require("../common/address.schema");

const UserSchema = new mongoose.Schema(
  {
    // email: {
    //   type: String,
    //   unique: true,
    //   lowercase: true,
    //   sparse: true,
    // },
    // password: {
    //   type: String,
    //   minlength: 0,
    //   maxlength: 128,
    // },
    phone_number: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    preferedGender: {
      type: [String],
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    bio: {
      type: String,
    },
    profession: {
      type: String,
    },
    movies: {
      type: [String],
    },

    food: {
      type: [String],
    },

    // blocked: {
    //   type: Boolean,
    //   default: false,
    // },
    confirmed: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    otp: Number,
    otp_verified: {
      type: Boolean,
      default: false,
    },
    // device: {
    //   type: DeviceSchema,
    // },
    last_location: {
      type: AddressSchema,
    },
    // branch_location: {
    //   type: AddressSchema,
    // },
    user_city: {
      type: String,
    },

    isAppDownloaded: {
      type: Boolean,
      default: false,
    },

    username: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({
  email: 1,
});

UserSchema.methods = {
  passwordMatches(password) {
    if (!password || !this.password) return false;
    return bcrypt.compareSync(password, this.password);
  },
};


UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.virtual("last_location_coords").get(function () {
  if (!this.last_location || !this.last_location.coords) return undefined;
  return this.last_location.coords.coordinates;
});

module.exports = mongoose.model("User", UserSchema);
