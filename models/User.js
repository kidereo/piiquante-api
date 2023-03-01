const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const saltFactor = parseInt(process.env.SALT_WORK_FACTOR);

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  dateAdded: { type: Date, default: Date.now },
});

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

userSchema.pre("save", async function save(next) {
  try {
    const salt = await bcrypt.genSalt(saltFactor);
    this.password = await bcrypt.hash(this.password, salt);
    return next;
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validateUser = validateUser;
