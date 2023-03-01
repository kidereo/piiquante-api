const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtKey = process.env.JWT_PRIVATE_KEY;

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decodedPayload = jwt.verify(token, jwtKey);
    req.user = decodedPayload;
    next();
  } catch (error) {
    return res.status(400).send({ error: "Invalid token." });
  }
}
module.exports = auth;
