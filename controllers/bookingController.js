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

exports.deleteBooking = async (req, res, next) => {
  try {
    const { userId, tourId } = req.params;

    await Booking.findOneAndDelete({ user: userId, tour: tourId });

    res.status(200).json({ status: "success", message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
};
