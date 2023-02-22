const express = require("express");
const router = express.Router();

const sauces = require("../services/datamock-sauces");
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

module.exports = router;
