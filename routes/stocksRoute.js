const express = require("express");
const stocksController = require("../controllers/stocksController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes
router.use(authController.protectRoute);

// Search stocks
router.get("/search", stocksController.searchStocks);

// Get price data of a particular stock (current and historical)
router.get("/prices/:symbol", stocksController.getPrices);

// Get user stock portfolio
router.get("/portfolio", stocksController.getPortfolio);

// Get user stock transaction history
router.get("/history", stocksController.getTransactionHistory);

// Get company overview data
router.get("/overview/:symbol", stocksController.getOverview);

// Get company income statement data
router.get("/income/:symbol", stocksController.getIncome);

// Get balance sheet for a company
router.get("/balance/:symbol", stocksController.getBalance);

// Get company cash flow data
router.get("/cash/:symbol", stocksController.getCash);

module.exports = router;
