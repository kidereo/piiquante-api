const config = require("config");

/**
 * API entrypoint
 */
exports.index = (req, res) => {
  return res.send({ message: config.get("app-name") });
};
