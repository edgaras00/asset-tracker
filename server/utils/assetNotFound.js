const AppError = require("./appError");

module.exports = (res, next) => {
  if (res.status === 404) {
    return next(new AppError("Asset not found", 404));
  }
};
