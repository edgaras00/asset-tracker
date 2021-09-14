const express = require("express");
const router = express.Router();
const StocksController = require('../controllers/stocks');

// Search stocks
router.get("/search", StocksController.stocks_search);

// Get the current price of a particular stock
router.get("/current/:symbol", StocksController.stocks_current);

router.get("/current_batch", StocksController.stocks_batch);

// Get market price data for a stock
router.get("/prices/:symbol", StocksController.stocks_prices);

// Get company overview data
router.get("/overview/:symbol", StocksController.stocks_overview);

// Get company income statement data
router.get("/income/:symbol", StocksController.stocks_income);

router.get("/balance_sheet/:symbol", StocksController.stocks_balance);

// Get company cash flow data
router.get("/cash_flow/:symbol", StocksController.stocks_cash);

module.exports = router;