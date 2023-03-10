const dbDebugger = require("debug")("app:db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");

/**
 * Login user.
 */
exports.login = async (req, res) => {
  //Validate request body
  const { error } = validateReqBody(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  //Get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send({ error: "Invalid email or password." });
  }

  //Validate password
  const password = await bcrypt.compare(req.body.password, user.password);
  if (!password) {
    return res.status(400).send({ error: "Invalid email or password." });
  }

  //Generate token
  const token = user.generateAuthToken();

  return res
    .header("x-auth-token", token)
    .status(200)
    .send({ value: jwt.decode(token), token: token });
};

/**
 * Validate request's body.
 */
function validateReqBody(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}
