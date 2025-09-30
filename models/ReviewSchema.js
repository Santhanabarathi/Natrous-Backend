const mongoose = require("mongoose");
const User = require("./userSchema");
const Tour = require("./tourSchema");

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
  },
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
