const config = require("config");

/**
 * API entrypoint
 */
exports.index = (req, res) => {
  return res.send(config.get("app-name"));
};
