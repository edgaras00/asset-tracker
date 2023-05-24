const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// User signup
router.post("/signup", authController.signup);

// User login
router.post("/login", authController.login);

// User logout
router.get("/logout", authController.logout);

// Protect routes
router.use(authController.protectRoute);

// Buy asset
router.put("/buy", userController.userBuy);

// Sell asset
router.put("/sell", userController.userSell);

module.exports = router;
