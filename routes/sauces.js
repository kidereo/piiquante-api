const express = require("express");
const router = express.Router();

const saucesController = require("../controllers/sauces");

/**
 * Get all sauces
 */
router.get("/", saucesController.index);

/**
 * Get a sauce
 */
router.get("/:id", saucesController.show);

/**
 * Add a sauce
 */
router.post("/", saucesController.store);

/**
 * Edit a sauce
 */
router.put("/:id", saucesController.update);

/**
 * Delete a sauce
 */
router.delete("/:id", saucesController.destroy);

/**
 * Like or dislike a sauce
 */
router.post("/:id/like", saucesController.like);

module.exports = router;
