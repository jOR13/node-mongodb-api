const router = require("express").Router();
const Pets = require("../models/Pets");
const jwt = require("jsonwebtoken");

// validation
const Joi = require("@hapi/joi");

const schemaCreate = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    type: Joi.string().min(3).max(255).required(),
    race: Joi.string().min(3).max(255).required(),
    address: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(255).required(),
    contact: Joi.string().min(5).max(255).required(),
    reward: Joi.number().min(0).max(255).required(),
    
});



router.post("/createPet", async (req, res) => {
  // validate user
  const { error } = schemaCreate.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const pet = new Pets({
      name: req.body.name,
      type: req.body.type,
      race: req.body.race,
      address: req.body.address,
      description: req.body.description,
      contact: req.body.contact,
      reward: req.body.reward,
});
  try {
    const savedPet = await pet.save();
    res.json({
      error: null,
      data: savedPet,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
