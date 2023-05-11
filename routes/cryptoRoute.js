const express = require("express");
const authController = require("../controllers/authController");
const cryptoController = require("../controllers/cryptoController");

const router = express.Router();

// Protect all routes middleware
router.use(authController.protectRoute);

// Crypto search route
router.get("/search", cryptoController.searchCrypto);

// Get prices for a batch of coins/tokens
router.get("/portfolio", cryptoController.getPortfolio);

// Get the current price
router.get("/current/:cId", cryptoController.getCurrentPrice);

// Cryptocurrency prices
router.get("/prices/:cId", cryptoController.getPricesOnInterval);

// Get coin/token data (description, market, social)
router.get("/data/:cId", cryptoController.getMetadata);

// Get cryptocurrency transaction history
router.get("/history", cryptoController.getTransactionHistory);

module.exports = router;
