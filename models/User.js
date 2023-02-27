const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
  email: { type: String, required: true, match: /.+\@.+\..+/, unique: true },
  password: { type: String, required: true, minlength: 3, maxlength: 30 },
  dateAdded: { type: Date, default: Date.now },
});

userSchema.pre("save", async function save(next) {
  try {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next;
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.userSchema = userSchema;
