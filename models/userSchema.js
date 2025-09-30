const mongoose = require("mongoose");
const Tour = require("./tourSchema");
const { stringify } = require("uuid");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    requied: [true, "user must have a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "user must have a email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "must have  password"],
  },

  role: {
    type: String,
    default: "user",
    enum: ["user", "guide", "lead-guide", "admin"],
  },
  photo: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  resetOtp: String,
  otpExpiresAt: Date,

  tour: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
