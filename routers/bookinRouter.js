const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();
router.route("/booked-tours").get(bookingController.getAllBookings);
router.route("/book-tour").post(bookingController.createBooking);
router.route("/getBooked-tour").get(bookingController.getBookedUserDetails);

module.exports = router;
