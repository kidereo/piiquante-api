const winston = require("winston");
const express = require("express");
const app = express();

module.exports = function (err, req, res, next) {
  if (app.get("env") !== "test") winston.error(err.message, err);
  return res.status(500).send({ error: err.message });
};
