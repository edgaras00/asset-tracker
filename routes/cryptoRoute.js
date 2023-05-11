const express = require("express");
const authController = require("../controllers/authController");
const cryptoController = require("../controllers/cryptoController");
const router = express.Router();

// Crypto search route
router.get("/search", cryptoController.searchCrypto);

// Get prices for a batch of coins/tokens
router.get(
  "/portfolio",
  authController.protectRoute,
  cryptoController.getPortfolio
);

// Get the current price
router.get(
  "/current/:cId",
  authController.protectRoute,
  cryptoController.getCurrentPrice
);

// Cryptocurrency prices
router.get(
  "/prices/:cId",
  authController.protectRoute,
  cryptoController.getPricesOnInterval
);

// Get coin/token data (description, market, social)
router.get(
  "/data/:cId",
  authController.protectRoute,
  cryptoController.getMetadata
);

router.get(
  "/history",
  authController.protectRoute,
  cryptoController.getTransactionHistory
);

module.exports = router;
