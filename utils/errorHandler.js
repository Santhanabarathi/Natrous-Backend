const AppError = require("./appError");

function handleCasteError(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

function handleValidationError(err) {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${error.join(". ")}`;
  return new AppError(message, 400);
}

function handleDuplicate(err) {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}" for "${field}". Please use another value!`;
  return new AppError(message, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = err;

  error.message = err.message;

  if (error.name === "CastError") error = handleCasteError(err);
  if (error.name === "ValidationError") error = handleValidationError(err);
  if (error.code === 11000) error = handleDuplicate(err);

  res.status(error.statusCode).json({
    status: error.statusCode,
    error: err.name,
    message: error.message,
  });
};
