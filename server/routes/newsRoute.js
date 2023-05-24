const express = require("express");
const newsController = require("../controllers/newsController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes
router.use(authController.protectRoute);

// Get top business news for overall market data
router.get("/", newsController.getAllNews);

// Get news about a particular asset
router.get("/:asset", newsController.getAssetNews);

module.exports = router;
