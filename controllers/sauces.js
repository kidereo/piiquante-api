const dbDebugger = require("debug")("app:db");

const Sauce = require("../models/Sauce");

/**
 * Get all sauces
 */
exports.index = async (req, res) => {
  try {
    const sauces = await Sauce.find().sort("name");
    //.select({ name: 1, heat: 1, manufacturer: 1, description: 1 })
    //.then((sauces) => res.status(200).json(sauces));

    res.status(200).send(sauces);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Get a sauce
 */
exports.show = async (req, res) => {
  try {
    const sauce = await Sauce.findById(req.params.id);
    if (!sauce) {
      res.status(404).send("Sauce not found...");
    }

    res.status(200).send(sauce);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Add a sauce
 */
exports.store = async (req, res) => {
  const newSauce = new Sauce({
    ...req.body,
  });

  try {
    const result = await newSauce.save();

    res.status(200).send(result);
  } catch (error) {
    for (field in error.errors) {
      dbDebugger(error.errors[field].message);
    }

    res.status(400).send(error.errors);
  }
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
      res.status(404).send("Sauce not found...");
    }

    res.status(200).send(sauce);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 * Delete a sauce
 */
exports.destroy = async (req, res) => {
  try {
    const sauce = await Sauce.findByIdAndDelete({ _id: req.params.id });

    if (!sauce) {
      return res.status(404).send("Sauce not found.");
    }

    res.send(`Sauce "${sauce.name}" deleted.`);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
