const express = require("express");
const router = express.Router();

const saucesController = require("../controllers/sauces");
const auth = require("../middleware/auth");

/**
 * Get all sauces.
 */
router.get("/", saucesController.index);

/**
 * Get a sauce.
 */
router.get("/:id", saucesController.show);

/**
 * Add a sauce.
 */
router.post("/", auth, saucesController.store);

/**
 * Edit a sauce.
 */
router.put("/:id", auth, saucesController.update);

/**
 * Delete a sauce.
 */
router.delete("/:id", auth, saucesController.destroy);

/**
 * Like or dislike a sauce.
 */
router.post("/:id/like", auth, saucesController.like);

module.exports = router;
