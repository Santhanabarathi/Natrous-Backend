const express = require("express");

const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, reviewController.getAllReview)
  .post(verifyToken, reviewController.createReview);

router
  .route("/:id")
  .get(verifyToken, reviewController.getOneReview)
  .put(verifyToken, reviewController.updateReview)
  .delete(verifyToken, reviewController.deleteReview);

module.exports = router;
