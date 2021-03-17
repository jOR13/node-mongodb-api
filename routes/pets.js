const router = require("express").Router();
const Pets = require("../models/Pets");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");

//define storage for the images

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "./uploads/images");
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

// validation
const Joi = require("@hapi/joi");

const schemaCreate = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  type: Joi.string().min(3).max(255).required(),
  race: Joi.string().min(3).max(255).required(),
  address: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(5).max(255).required(),
  contact: Joi.string().min(5).max(255).required(),
  reward: Joi.number().min(0).max(999999).required(),
  userID: Joi.string().min(0).max(255),
  imageID: Joi.string().min(0).max(255),
  qrID: Joi.string().min(0).max(255),
});

//crea una nueva mascota
router.post("/createPet", upload.single("imageID"), async (req, res) => {
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
    imageID: req.file.filename,
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

//retrive all the pets
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
//retrive only one pet
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
//actualiza los registros de la mascota
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const body = req.body;
  
    try {
        await Pets.findByIdAndUpdate(
            id, body, { useFindAndModify: false }
        )
        
        res.json({
            estado: true,
            mensaje: 'Se ha editado con exito'
        })
    } catch (error) {
        console.log(error)
        res.json({
            estado: false,
            mensaje: 'Edicion fallo'
        })
    }
  })

  //borra el registro de la mascotaDB
router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    console.log("id desde backend", id);
    try {
      const mascotaDB = await Pets.findByIdAndDelete({ _id: id });
  
      // https://stackoverflow.com/questions/27202075/expressjs-res-redirect-not-working-as-expected
      // res.redirect('/mascotas')
      if (!mascotaDB) {
        res.json({
          estado: false,
          mensaje: "No se puede eliminar",
        });
      } else {
        res.json({
          estado: true,
          mensaje: "eliminado!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
