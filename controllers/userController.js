const { catchAsync } = require("../utils/catchAsync");
const User = require("../models/userSchema");
const { generatePresignedUrl } = require("../services/multer-s3");

exports.getAllUser = catchAsync(async (req, res, next) => {
  // const filter = {};

  // if (req.query.role) {
  //   filter.role = req.query.role;
  // }

  const user = await User.find().select("name email role").populate({
    path: "tour",
    select: "_id name",
  });

  res.status(200).json({
    status: "success",
    result: user.length,
    user,
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: "tour",
    select: "name",
  });

  let photoUrl = null;

  if (user.photo) {
    photoUrl = await generatePresignedUrl(user.photo);
  }

  const userDetails = {
    name: user.name,
    email: user.email,
    password: user.password,
    photo: photoUrl,
    tour: user.tour,
    _id: user._id,
  };

  res.status(200).json({
    status: "success",
    data: userDetails,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.key;
  }

  const users = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const user = { name: users.name, email: users.email, photo: users.photo };

  res.status(200).json({
    status: "Update success",
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(201).json({
    status: "success",
    message: "deleted ",
  });
});

exports.deletePhoto = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.params.id,
    { $set: { photo: null } },
    { new: true }
  );

  res.status(201).json({
    status: "success",
    message: "Photo deleted",
  });
});

exports.deleteManyUser = catchAsync(async (req, res, next) => {
  await User.deleteMany();

  res.status(200).json({
    status: "success",
    msg: "delete all users",
  });
});

exports.getAllGuide = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  const guide = await User.find(filter);

  res.status(200).json({
    status: "success",
    result: guide.length,
    data: guide,
  });
});
