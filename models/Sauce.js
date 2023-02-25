const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  userId: String,
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  heat: { type: Number, min: 1, max: 10, default: 5 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: [{ type: String, default: "" }],
  usersDisliked: [{ type: String, default: "" }],
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sauce", sauceSchema);
