const AppError = require("../utils/appError");

// Handle errors

const handleDuplicateFieldsDB = () => {
  const message = `Duplicate field value`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    sendErrorProd(error, res);
  }
};
