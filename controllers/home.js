const config = require("config");

/**
 * API entrypoint
 */
exports.index = (req, res) => {
  res.send(config.get("name"));
};
