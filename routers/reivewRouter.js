const express = require("express");

const reviewController = require("../controllers/reviewController");

const router = express.Router();

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(reviewController.createReview);

router
  .route("/:id")
  .get(reviewController.getOneReview)
  .put(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
