const express = require("express");
const tourController = require("../controllers/tourController");
const { verifyToken } = require("../controllers/authController");
const { uploadAllFiles } = require("../services/multer-s3");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAlltour)
  .post(verifyToken, uploadAllFiles, tourController.createTour);

router.route("/guideUpdate/:id").put(tourController.bulkUpdateGuides);

router
  .route("/:id")
  .get(tourController.getTour)
  .put(verifyToken, uploadAllFiles, tourController.updateTour)
  .delete(verifyToken, tourController.deleteTour);

module.exports = router;
