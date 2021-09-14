const express = require("express");
const router = express.Router();
const {sellAsset, buyAsset} = require('../middleware/user');
const UserController = require('../controllers/user');


// User signup
router.post("/signup", UserController.user_signup);

// User login
router.post("/login", UserController.user_login);

// User logout
router.get('/logout', UserController.user_logout);

// Update user
router.put("/:id", buyAsset, UserController.user_update);

router.put("/sell/:id", sellAsset, UserController.user_sell);

module.exports = router;
