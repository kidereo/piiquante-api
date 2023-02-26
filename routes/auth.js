const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");

/**
 * List users
 */
router.get("/", userController.index);

/**
 * Add a user
 */
router.post("/signup", userController.store);

/**
 * Login user
 */
router.post("/login", userController.login);

module.exports = router;
