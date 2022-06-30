const express = require("express");
const router = express.Router();
const stocksController = require("../controllers/stocksController");
const authController = require("../controllers/authController");

// Search stocks
router.get(
  "/search",
  authController.protectRoute,
  stocksController.searchStocks
);

// Get the current price of a particular stock
router.get(
  "/current/:symbol",
  authController.protectRoute,
  stocksController.getCurrentPrice
);

// Get stock portfolio
router.get(
  "/portfolio",
  authController.protectRoute,
  stocksController.getPortfolio
);

// Get market price data for a stock
router.get(
  "/prices/:symbol",
  authController.protectRoute,
  stocksController.getPricesOnInterval
);

// Get stock transaction history
router.get(
  "/history",
  authController.protectRoute,
  stocksController.getTransactionHistory
);

// Get company overview data
router.get(
  "/overview/:symbol",
  authController.protectRoute,
  stocksController.getOverview
);

// Get company income statement data
router.get(
  "/income/:symbol",
  authController.protectRoute,
  stocksController.getIncome
);

// Get balance sheet for a company
router.get(
  "/balance/:symbol",
  authController.protectRoute,
  stocksController.getBalance
);

// Get company cash flow data
router.get(
  "/cash/:symbol",
  authController.protectRoute,
  stocksController.getCash
);

module.exports = router;
