const express = require("express");
const router = express.Router();

/**
 * API entrypoint
 */
router.get("/", (req, res) => {
  res.send("Piiquante Api.");
});

module.exports = router;
