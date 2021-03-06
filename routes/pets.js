const router = require("express").Router();
const Pets = require("../models/Pets");
const User = require("../models/User");
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
  userID: Joi.string().min(0).max(255),
  imageID: Joi.string().min(0).max(255),
  qrID: Joi.string().min(0).max(255),
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
    userID: req.body.userID,
    imageID: req.body.imageID,
    qrID: req.body.qrID,
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

router.get("/", async (req, res) => {
  try {
    const pets = await Pets.find();
    res.json({
      error: null,
      data: pets,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const mascotaDB = await Pets.findOne({ _id: id });

    if (mascotaDB.userID) {
      const user = await User.findOne({ _id: mascotaDB.userID });
      mascotaDB.userID = user;
    }

    res.json({
      error: null,
      data: mascotaDB,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
