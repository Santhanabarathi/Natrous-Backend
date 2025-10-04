const { default: mongoose } = require("mongoose");
const Booking = require("../models/bookingSchema");

exports.createBooking = async (req, res, next) => {
  try {
    const newBooking = await Booking.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        booking: newBooking,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();

    if (!bookings) return res.status(404).json({ message: "no tours booked" });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookedUserDetails = async (req, res) => {
  const { user } = req.query;

  const Book = await Booking.find({ user });

  res.status(200).json({
    status: "success",
    length: Book.length,
    data: Book,
  });
};

exports.deleteBookingTour = async (req, res, next) => {
  await Booking.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "deleted the booking tour",
  });
};
