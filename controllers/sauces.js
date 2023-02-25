const dbDebugger = require("debug")("app:db");

const Sauce = require("../models/Sauce");

/**
 * Get all sauces
 */
exports.index = async (req, res) => {
  const sauces = await Sauce.find()
    .sort({ name: 1, manufacturer: 1 })
    //.select({ name: 1, heat: 1, manufacturer: 1, description: 1 })
    .catch((error) => dbDebugger("Database error:", error));
  //.then((sauces) => res.status(200).json(sauces));

  res.status(200).send(sauces);
};

/**
 * Get a sauce
 */
exports.show = async (req, res) => {
  const sauce = await Sauce.findById(req.params.id).catch((error) =>
    dbDebugger("Database error:", error)
  );

  if (!sauce) {
    return res.status(404).send("Sauce not found...");
  }

  res.status(200).send(sauce);
};

/**
 * Add a sauce
 */
exports.store = async (req, res) => {
  const newSauce = new Sauce({
    name: req.body.name,
    manufacturer: req.body.name,
    description: req.body.description,
    heat: req.body.heat,
    mainPepper: req.body.mainPepper,
    imageUrl: "",
    userId: "",
    usersLiked: [],
    usersDisliked: [],
  });

  const result = await newSauce
    .save()
    //.then(() => dbDebugger("Sauce added sucessfully..."))
    .catch((error) => res.status(400).send(error.message));

  res.status(200).send(result);
};

/**
 * Edit a sauce
 */
exports.update = async (req, res) => {
  // //Find the sauce
  // const sauce = await Sauce.findById(req.params.id).catch((error) =>
  //   dbDebugger("Database error:", error)
  // );
  // //If sauce not found, return 404
  // if (!sauce) {
  //   return res.status(404).send("Sauce not found...");
  // }
  // //If all is well - update properties and return the updated sauce
  // sauce.set({
  //   ...req.body,
  // });
  // const result = await sauce.save();
  // res.status(200).send(result);

  const sauce = await Sauce.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        ...req.body,
      },
    },
    { new: true }
  ).catch((error) => res.status(400).send(error.message));

  res.status(200).send(sauce);
};

/**
 * Delete a sauce
 */
exports.destroy = async (req, res) => {
  const sauce = await Sauce.findByIdAndDelete({ _id: req.params.id }).catch(
    (error) => res.status(400).send(error.message)
  );

  if (!sauce) {
    return res.status(404).send("Sauce not found.");
  }

  res.send(`Sauce "${sauce.name}" deleted.`);
};
