const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./utils/errorHandler");
// routers
const tourRouter = require("./routers/tourRouter");
const userRouter = require("./routers/userRouter");
const reviewRouter = require("./routers/reivewRouter");
const bookingRouter = require("./routers/bookinRouter");

const app = express();

//  show the image in browsers

const folder = path.join(__dirname, "upload-Images");
app.use("/", express.static(folder));
// or
// app.use("/upload", express.static("upload-Images"));

app.use("/", (req, res) => {
  res.send("API working");
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/review", reviewRouter);
app.use("/api/user", bookingRouter);

app.use(errorHandler);

module.exports = app;
