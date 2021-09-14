const express = require('express');
const router = express.Router();
const NewsController = require("../controllers/news");


// Get top business news for overall market data
// router.get('/', authorize, NewsController.news_all);
router.get("/", NewsController.news_all);


// router.get('/:asset', authorize, NewsController.news_asset);
router.get("/:asset", NewsController.news_asset);

module.exports = router;