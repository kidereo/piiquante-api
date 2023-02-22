const express = require("express");
const router = express.Router();
const Joi = require("joi");

const sauces = require("../data/sauces");

/**
 * Get all sauces
 */
router.get("/", (req, res) => {
  res.send(sauces);
});

/**
 * Get a sauce
 */
router.get("/:id", (req, res) => {
  //Find the sauce
  const sauce = sauces.find((sauce) => sauce.id === parseInt(req.params.id));
  //If sause not found, return 404
  if (!sauce) {
    return res.status(404).send("Sauce not found.");
  }
  //If all is well return the sauce
  res.send(sauce);
});

/**
 * Add a sauce
 */
router.post("/", (req, res) => {
  //Validation request
  const validatedResult = validateSauce(req.body);
  //If validation fails return 400 with error
  if (validatedResult.error) {
    return res.status(400).send(validatedResult.error.details[0].message);
  }
  //If all is well add and return the sauce
  const newSauce = {
    id: sauces.length + 1,
    name: validatedResult.value.name,
    manufacturer: validatedResult.value.manufacturer,
  };
  sauces.push(newSauce);
  res.send(newSauce);
});

/**
 * Edit a sauce
 */
router.put("/:id", (req, res) => {
  //Find the sauce
  const sauce = sauces.find((sauce) => sauce.id === parseInt(req.params.id));
  //If sause not found, return 404
  if (!sauce) {
    return res.status(404).send("Sauce not found.");
  }
  //Validate request
  const validatedResult = validateSauce(req.body);

  //If validation fails return 400 with error
  if (validatedResult.error) {
    return res.status(400).send(validatedResult.error.details[0].message);
  }
  //If all is well - update properties and return the updated sauce
  sauce.name = req.body.name;
  sauce.manufacturer = req.body.manufacturer;
  res.send(sauce);
});

/**
 * Delete a sauce
 */
router.delete("/:id", (req, res) => {
  //Find the sauce
  const sauce = sauces.find((sauce) => sauce.id === parseInt(req.params.id));
  //If sause not found, return 404
  if (!sauce) {
    return res.status(404).send("Sauce not found.");
  }
  //If the sauce exists - delete it
  const sauceIndex = sauces.indexOf(sauce);
  sauces.splice(sauceIndex, 1);
  res.send(`Sauce "${sauce.name}" deleted.`);
});

//Validation function
function validateSauce(sauce) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    manufacturer: Joi.string().required(),
  });
  return schema.validate(sauce);
}

module.exports = router;
