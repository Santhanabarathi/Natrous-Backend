const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadAllFiles } = require("../services/multer-s3");
const { verifyToken } = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(uploadAllFiles, authController.createUser);
router.route("/login").post(authController.loginUser);

router
  .route("/")
  .get(verifyToken, userController.getAllUser)
  .delete(verifyToken, userController.deleteManyUser);

router
  .route("/delete-photo/:id")
  .delete(verifyToken, userController.deletePhoto);
router
  .route("/forgotPassword")
  .post(verifyToken, authController.forgotPassword);
router.route("/verify-otp").post(verifyToken, authController.verifyOtp);

router.route("/resetPassword").put(verifyToken, authController.resetPassword);

router.route("/guides").get(userController.getAllGuide);

router.route("/refreshToken").post(authController.refreshToken);

router
  .route("/:id")
  .get(verifyToken, userController.getOneUser)
  .put(verifyToken, uploadAllFiles, userController.updateUser)
  .delete(verifyToken, userController.deleteUser);

module.exports = router;
