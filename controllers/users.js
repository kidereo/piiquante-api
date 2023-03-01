const dbDebugger = require("debug")("app:db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const { User, validateUser } = require("../models/User");

/**
 * Get all users
 */
exports.index = async (req, res) => {
  try {
    const users = await User.find().sort("email");

    return res.status(200).send(users);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

/**
 * Add a user
 */
exports.store = async (req, res) => {
  //Validate request's body with Joi
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  //Check if this user already exists
  let currentUser = await User.findOne({ email: req.body.email });
  if (currentUser) {
    return res
      .status(400)
      .send({ error: "A user with this email already exists." });
  }

  //Proceed with creating new user
  const newUser = new User({
    ...req.body,
  });

  try {
    //Password is now hashed in the User model on save.
    //const salt = await bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR));
    //newUser.password = await bcrypt.hash(newUser.password, salt);
    await newUser.save();
    const token = newUser.generateAuthToken();

    return res
      .header("x-auth-token", token)
      .status(200)
      .send({ value: jwt.decode(token), token: token });
  } catch (error) {
    for (field in error.errors) {
      dbDebugger(error.errors[field].message);
    }
    //Check if the error is due to duplicates in the database.
    let errorMessage;
    error.code === 11000
      ? (errorMessage =
          "This '" + Object.keys(error.keyValue)[0] + "' already exists.")
      : (errorMessage = error.errors);

    return res.status(400).send({ error: errorMessage });
  }
};
