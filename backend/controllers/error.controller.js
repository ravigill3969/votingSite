// Global error handler
import AppError from "../utils/AppError.js";
export default function globalErrorHandler(error, req, res, next) {
  console.log("we are in global error handler");
  // console.error(error);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...error };
    err.message = error.message;

    if (error.name === "CastError") err = handleCastErrorDB(err);
    if (error.code === 11000) err = handleDuplicateFieldsDB(err);
    if (error.name === "ValidationError") err = handleValidationErrorDB(err);
    if (error.name === "JsonWebTokenError") err = handleJWTError();
    if (error.name === "TokenExpiredError") err = handleJWTExpiredError();

    sendErrorProd(err, res);
  }
}

// Helper functions for error responses
function sendErrorDev(err, res) {
  // console.error("ERROR 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // logger.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
}

// Error handlers for specific scenarios
function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError("Invalid token. Please log in again!", 401);
}

function handleJWTExpiredError() {
  return new AppError("Your token has expired! Please log in again.", 401);
}
