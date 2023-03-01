const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");
const authController = require("../controllers/auth");

/**
 * Add a user
 */
router.post("/signup", userController.store);

/**
 * Login user
 */
router.post("/login", authController.login);

module.exports = router;
