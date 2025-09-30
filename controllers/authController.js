const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

exports.verifyToken = (req, res, next) => {
  const authToken = req.headers["authorization"];

  if (!authToken) {
    return next(new AppError("Unauthorized: missing or invalid token", 401));
  }

  if (!authToken.startsWith("Bearer")) {
    return next(
      new AppError(
        "Invalid authorization format. Expected: Bearer <token>",
        400
      )
    );
  }

  const token = authToken.split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return next(new AppError("Forbidden : Invalid token", 403));
    }
    req.user = user;
    next();
  });
};

const generateToken = (user) => {
  const userName = { name: user.name };
  return jwt.sign(userName, process.env.SECRET_KEY, { expiresIn: "15m" });
};

const refreshToken = (user) => {
  const userId = { id: user._id };
  return jwt.sign(userId, process.env.REFRESH_KEY, { expiresIn: "1d" });
};

exports.createUser = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError("password are not same", 400));
  }

  const pas = await bcrypt.hash(password, 10);

  // photo comes from multer
  const photo = req.file ? `${process.env.DEV_URL}/${req.file.filename}` : null;

  const newUser = await User.create({
    name,
    email,
    password: pas,
    photo,
  });

  res.status(201).json({
    status: "success",
    message: "User created",
    userDetails: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      photo: newUser.photo,
    },
  });
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const getUser = await User.findOne({ email });

  if (!getUser) {
    return next(new AppError("email or password is wrong", 400));
  }

  const comparePassword = await bcrypt.compare(password, getUser.password);

  if (!comparePassword) {
    return next(new AppError("your password is wrong", 400));
  }

  const accessToken = generateToken(getUser);
  const refresh_Token = refreshToken(getUser);

  res.status(200).json({
    status: "success",
    data: "login successfully",
    accessToken,
    refreshToken: refresh_Token,
    userDetails: {
      _id: getUser._id,
      name: getUser.name,
      email: getUser.email,
      role: getUser.role,
      photo: getUser.photo,
    },
  });
};

exports.refreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return next(new AppError("Token invalid", 403));

    const token = generateToken(user);

    res.status(200).json({
      status: "succss",
      token,
    });
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ message: "User not found with this email address" });
  }

  // const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
  //   expiresIn: "5m",
  // });

  // (user.resetToken = resetToken),
  //   (user.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000);

  const otpGen = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    digits: true,
  });

  const hashOtp = await bcrypt.hash(otpGen, 10);

  user.resetOtp = hashOtp;
  user.otpExpiresAt = Date.now() + 2 * 60 * 1000;

  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  // const resetUrl = `http://127.0.0.1:30002/api/users/reset-password/${resetToken}`;

  const sendMailOption = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: "Password Reset",
    html: `<p>You requested a password reset</p>
           <p>Click here to reset: ${otpGen}</p>`,
  };
  try {
    await transporter.sendMail(sendMailOption);
    res
      .status(200)
      .json({ message: "Password reset send to your email address" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (!user.resetOtp || !user.otpExpiresAt) {
    return res.status(400).json({ message: "OTP not requested" });
  }

  if (Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isMatch = await bcrypt.compare(otp, user.resetOtp);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Clear OTP after verification
  user.resetOtp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.status(200).json({ message: "OTP verified successfully" });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (!confirmPassword) {
    return res.status(400).json({
      message: "confirm password is missing",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "password are not same" });
  }
  // Set new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};

// exports.resetPassword = async (req, res) => {
//   const { newPassword } = req.body;

//   try {
//     const decode = jwt.verify(token, process.env.SECRET_KEY);

//     const user = await User.findById(decode.id);
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     if (Date.now() > user.otpExpiresAt) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // hash new password
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOtp = undefined;
//     user.otpExpiresAt = undefined;

//     await user.save();

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }
// };
