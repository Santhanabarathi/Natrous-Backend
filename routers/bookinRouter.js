const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router
  .route("/book-tour")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router.route("/getBooked-tour").get(bookingController.getBookedUserDetails);

router.route("/book-tour/:id").delete(bookingController.deleteBookingTour);

module.exports = router;
