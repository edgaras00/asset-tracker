const express = require("express");
const CryptoController = require('../controllers/crypto');
const router = express.Router();

// Crypto search route
router.get("/search", CryptoController.crypto_search);

// Get prices for a batch of coins/tokens
router.get("/current_batch/", CryptoController.crypto_batch);

// Get the current price
router.get("/current/:cId", CryptoController.crypto_current);

// Cryptocurrency prices
router.get("/prices/:cId", CryptoController.crypto_prices);

// Get coin/token data (description, market, social)
router.get("/data/:cId", CryptoController.crypto_data);

module.exports = router;
