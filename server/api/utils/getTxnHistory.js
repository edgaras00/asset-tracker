const catchAsync = require("./catchAsync");

// Function to handle asset transaction history requests
module.exports = (assetType) =>
  catchAsync(async (req, res, next) => {
    const transactionHistory = req.user.txnHistory[assetType];
    res.status(200).json({
      status: "Success",
      results: transactionHistory.length,
      data: {
        txnHistory: transactionHistory,
      },
    });
  });
