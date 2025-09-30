const express = require("express");
const tourController = require("../controllers/tourController");
const { upload } = require("../upload");
const { verifyToken } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAlltour)
  .post(
    verifyToken,
    upload.fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 3 },
    ]),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .put(
    verifyToken,
    upload.fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 3 },
    ]),
    tourController.updateTour
  )
  .delete(verifyToken, tourController.deleteTour);

module.exports = router;
