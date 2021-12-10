const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// User signup
router.post("/signup", authController.signup);

// User login
router.post("/login", authController.login);

// Update user assets
// Buy
router.put("/buy", authController.protectRoute, userController.userBuy);
// Sell
router.put("/sell", authController.protectRoute, userController.userSell);

module.exports = router;
