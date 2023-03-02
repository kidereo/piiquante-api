const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

/**
 * List users.
 */
router.get("/", [auth, admin], userController.index);

/**
 * Get a currently authenticated user.
 */
router.get("/me", auth, userController.show);

module.exports = router;
