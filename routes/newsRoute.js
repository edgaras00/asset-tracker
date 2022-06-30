const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const authController = require("../controllers/authController");

// Get top business news for overall market data
// router.get('/', authorize, NewsController.news_all);
router.get("/", authController.protectRoute, newsController.getAllNews);

// router.get('/:asset', authorize, NewsController.news_asset);
router.get("/:asset", authController.protectRoute, newsController.getAssetNews);

module.exports = router;
