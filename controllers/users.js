const dbDebugger = require("debug")("app:db");

const User = require("../models/User");

/**
 * Get all users
 */
exports.index = async (req, res) => {
  try {
    const users = await User.find().sort("email");

    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Add a user
 */
exports.store = async (req, res) => {
  const newUser = new User({
    ...req.body,
  });

  try {
    const result = await newUser.save();

    res.status(200).send(result);
  } catch (error) {
    for (field in error.errors) {
      dbDebugger(error.errors[field].message);
    }
    //Check for duplicates in the database.
    let errorMessage;
    error.code === 11000
      ? (errorMessage =
          "Path '" + Object.keys(error.keyValue)[0] + "' already exists.")
      : (errorMessage = error.errors);

    res.status(400).send({ error: errorMessage });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  res.status(200).send("Work in progress...");
};
