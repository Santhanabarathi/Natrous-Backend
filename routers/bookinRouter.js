const express = require("express");
const bookingController = require("../controllers/bookingController");
const { verifyToken } = require("../controllers/authController");

const router = express.Router();

router
  .route("/book-tour")
  .get(verifyToken, bookingController.getAllBookings)
  .post(verifyToken, bookingController.createBooking);

router
  .route("/getBooked-tour")
  .get(verifyToken, bookingController.getBookedUserDetails);

router
  .route("/book-tour/:userId/:tourId")
  .delete(verifyToken, bookingController.deleteBooking);

module.exports = router;
