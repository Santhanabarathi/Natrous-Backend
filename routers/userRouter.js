const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadAllFiles } = require("../services/multer-s3");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUser)
  .delete(userController.deleteManyUser);

router.route("/signup").post(authController.createUser);

router.route("/login").post(authController.loginUser);

router.route("/refresh-token").post(authController.refreshToken);

router.route("/delete-photo/:id").delete(userController.deletePhoto);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/verify-otp").post(authController.verifyOtp);

router.route("/resetPassword").put(authController.resetPassword);

router.route("/guides").get(userController.getAllGuide);

router
  .route("/:id")
  .get(userController.getOneUser)
  .put(uploadAllFiles, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
