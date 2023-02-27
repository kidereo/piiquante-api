const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true, minlength: 5, maxlength: 50 },
  manufacturer: { type: String, required: true, minlength: 5, maxlength: 50 },
  description: { type: String, required: true, minlength: 5, maxlength: 255 },
  mainPepper: { type: String, required: true, minlength: 3, maxlength: 30 },
  imageUrl: { type: String, default: "" },
  heat: { type: Number, min: 1, max: 10, default: 5 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: [{ type: String, default: "" }],
  usersDisliked: [{ type: String, default: "" }],
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sauce", sauceSchema);
