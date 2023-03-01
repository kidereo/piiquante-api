const dbDebugger = require("debug")("app:db");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const Sauce = require("../models/Sauce");
const { User } = require("../models/User");

/**
 * Get all sauces.
 */
exports.index = async (req, res) => {
  try {
    const sauces = await Sauce.find().sort("name");
    //.select({ name: 1, heat: 1, manufacturer: 1, description: 1 })
    //.then((sauces) => res.status(200).json(sauces));

    return res.status(200).send(sauces);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

/**
 * Get one sauce.
 */
exports.show = async (req, res) => {
  try {
    const paramId = validateParamId(req.params);
    if (paramId.error) {
      return res.status(400).send({ error: paramId.error.details[0].message });
    }
    const sauceId = paramId.value.id;

    const sauce = await Sauce.findById(sauceId);
    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    return res.status(200).send(sauce);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

/**
 * Add a sauce.
 */
exports.store = async (req, res) => {
  try {
    const currentUser = jwt.decode(req.header("x-auth-token"));
    const currentUserId = currentUser._id;

    const { error } = validateStoreReqBody(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res
        .status(400)
        .send({ error: "No user suplied or no such user exists." });
    }

    const newSauce = new Sauce({
      ...req.body,
      userId: currentUserId,
    });
    const result = await newSauce.save();

    return res.status(200).send(result);
  } catch (error) {
    for (field in error.errors) {
      dbDebugger(error.errors[field].message);
    }

    return res.status(400).send({ error: error.message });
  }
};

/**
 * Edit a sauce.
 */
exports.update = async (req, res) => {
  try {
    const { error } = validateParamId(req.params);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const sauce = await Sauce.findById(req.params.id);
    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    // const sauce = await Sauce.findByIdAndUpdate(
    //   { _id: req.params.id },
    //   {
    //     $set: {
    //       ...req.body,
    //     },
    //   },
    //   { new: true, runValidators: true }
    // );
    // if (!sauce) {
    //   return res.status(404).send({ error: "Sauce not found." });
    // }

    const currentUser = jwt.decode(req.header("x-auth-token"));
    const currentUserId = currentUser._id;
    if (sauce.userId !== currentUserId) {
      return res
        .status(401)
        .send({ error: "Access denied. This user cannot delete this sauce." });
    }

    sauce.set({ ...req.body });
    sauce.update();

    return res.status(200).send(sauce);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

/**
 * Delete a sauce.
 */
exports.destroy = async (req, res) => {
  try {
    const { error } = validateParamId(req.params);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const sauce = await Sauce.findById(req.params.id);
    if (!sauce) {
      return res.status(404).send({ error: "Sauce not found." });
    }

    const currentUser = jwt.decode(req.header("x-auth-token"));
    const currentUserId = currentUser._id;
    if (sauce.userId !== currentUserId) {
      return res
        .status(401)
        .send({ error: "Access denied. This user cannot delete this sauce." });
    }

    sauce.delete();

    return res.status(200).send({ message: `Sauce ${sauce.name} deleted.` });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

/**
 * Like or dislike a sauce.
 */
exports.like = async (req, res) => {
  //Validate request body and store its values separately
  const reqBody = validateLikeReqBody(req.body);
  if (reqBody.error) {
    return res.status(400).send({ error: reqBody.error.details[0].message });
  }
  const userId = reqBody.value.userId;
  const like = reqBody.value.like;

  //Check the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(400)
      .send({ error: "No user suplied or no such user exists." });
  }

  //Check the param :id is valid and store its values separately
  const paramId = validateParamId(req.params);
  if (paramId.error) {
    return res.status(400).send({ error: paramId.error.details[0].message });
  }
  const sauceId = paramId.value.id;

  //Find the sauce to like/dislike and get relevant properties
  let sauce = await Sauce.findById(sauceId).select({
    usersLiked: 1,
    usersDisliked: 1,
  });
  if (!sauce) {
    return res.status(400).send({ error: "No such sauce exists." });
  }

  //Check if the user already liked or disliked the sauce in question
  const hasLiked = sauce.usersLiked.indexOf(userId);
  const hasDisliked = sauce.usersDisliked.indexOf(userId);

  //Do what needs to be done
  if (like === 1 && hasLiked === -1 && hasDisliked === -1) {
    try {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: sauceId },
        { $inc: { likes: 1 }, $push: { usersLiked: userId } },
        { new: true }
      );

      return res.status(200).send({ likes: sauce.likes });
    } catch (error) {
      return res.status(400).send(error.message);
    }
  } else if (like === -1 && hasDisliked === -1 && hasLiked === -1) {
    try {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: sauceId },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } },
        { new: true }
      );

      return res.status(200).send({ dislikes: sauce.dislikes });
    } catch (error) {
      return res.status(400).send(error.message);
    }
  } else if (like === 0) {
    if (hasLiked !== -1) {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: sauceId },
        { $inc: { likes: -1 }, $pull: { usersLiked: userId } },
        { new: true }
      );

      return res.status(200).send({ likes: sauce.likes });
    } else if (hasDisliked !== -1) {
      const sauce = await Sauce.findByIdAndUpdate(
        { _id: sauceId },
        { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } },
        { new: true }
      );

      return res.status(200).send({ dislikes: sauce.dislikes });
    }
  }

  return res.status(200).send({
    error:
      "This user has already liked or disliked this sauce, or has cleared previous choice.",
  });
};

/**
 * Body validation functions.
 */
function validateStoreReqBody(req) {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24),
    heat: Joi.number().min(1).max(10).default(5),
    name: Joi.string().min(5).max(50).required(),
    manufacturer: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    mainPepper: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(req);
}

function validateLikeReqBody(req) {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    like: Joi.number().min(-1).max(1).required(),
  });
  return schema.validate(req);
}

/**
 * Param :id validation function.
 */
function validateParamId(id) {
  const schema = Joi.object({
    id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(id);
}
