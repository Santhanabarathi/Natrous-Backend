const Review = require("../models/ReviewSchema");
const { catchAsync } = require("../utils/catchAsync");

exports.createReview = catchAsync(async (req, res, next) => {
  const data = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data,
  });
});

exports.getAllReview = catchAsync(async (req, res, next) => {
  const review = await Review.find()
    .populate("user", "name photo")
    .populate("tour", "name");

  const cleanReview = review.map((r) => {
    const obj = r.toObject();

    if (obj?.tour?.id) {
      delete obj?.tour?.id;
    }
    return obj;
  });

  res.status(200).json({
    status: "success",
    result: review.length,
    data: {
      cleanReview,
    },
  });
});

exports.getOneReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name email")
    .populate("tour", "name ");

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    msg: "deleted",
  });
});
