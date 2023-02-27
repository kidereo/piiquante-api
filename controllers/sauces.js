const dbDebugger = require("debug")("app:db");

const Sauce = require("../models/Sauce");
const { User } = require("../models/User");

/**
 * Get all sauces
 */
exports.index = async (req, res) => {
  try {
    const sauces = await Sauce.find().sort("name");
    //.select({ name: 1, heat: 1, manufacturer: 1, description: 1 })
    //.then((sauces) => res.status(200).json(sauces));

    return res.status(200).send(sauces);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

/**
 * Get a sauce
 */
exports.show = async (req, res) => {
  try {
    const sauce = await Sauce.findById(req.params.id);
    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    return res.status(200).send(sauce);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

/**
 * Add a sauce
 */
exports.store = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);

    if (!user) {
      return res
        .status(400)
        .send({ error: "No user suplied or no such user exists." });
    }

    const newSauce = new Sauce({
      ...req.body,
    });
    const result = await newSauce.save();

    return res.status(200).send(result);
  } catch (error) {
    for (field in error.errors) {
      dbDebugger(error.errors[field].message);
    }

    return res.status(400).send(error.errors);
  }
};

/**
 * Edit a sauce
 */
exports.update = async (req, res) => {
  try {
    const sauce = await Sauce.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
        },
      },
      { new: true, runValidators: true }
    );

    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    return res.status(200).send(sauce);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

/**
 * Delete a sauce
 */
exports.destroy = async (req, res) => {
  try {
    const sauce = await Sauce.findByIdAndDelete({ _id: req.params.id });

    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    return res.send({ message: `Sauce ${sauce.name} deleted.` });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

/**
 * Like or dislike a sauce
 */
exports.like = async (req, res) => {
  const like = parseInt(req.body.like);
  let sauce = await Sauce.findById(req.params.id).select({
    usersLiked: 1,
    usersDisliked: 1,
  });
  const hasLiked = sauce.usersLiked.indexOf(req.body.userId); //"63fb05579c38e415a111d560" //req.body.userId
  const hasDisliked = sauce.usersDisliked.indexOf(req.body.userId);

  if (like === 1 && hasLiked === -1 && hasDisliked === -1) {
    try {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } },
        { new: true }
      );
      return res.status(200).send({ likes: sauce.likes });
    } catch (error) {
      return res.status(400).send(error.message);
    }
  } else if (like === -1 && hasDisliked === -1 && hasLiked === -1) {
    try {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } },
        { new: true }
      );
      return res.status(200).send({ dislikes: sauce.dislikes });
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }
  return res
    .status(400)
    .send({ error: "This user has already liked or disliked this sauce." });
};
