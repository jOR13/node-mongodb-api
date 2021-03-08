const router = require("express").Router();
const Pets = require("../models/Pets");
const User = require("../models/User");
const Qrs = require("../models/Qrs");
const jwt = require("jsonwebtoken");

// validation
const Joi = require("@hapi/joi");

const schemaCreate = Joi.object({
  status: Joi.string().min(3).max(255).required(),

  // longitude: Joi.string().min(3).max(255).required(),
  // latitude: Joi.string().min(3).max(255).required(),
  // lastScan: Joi.string().min(3).max(255).required(),
  // userID: Joi.string().min(3).max(255).required(),
  // mascotaID: Joi.string().min(3).max(255).required(),
  // date: Joi.string().min(3).max(255).required(),
});

router.post("/createQR", async (req, res) => {
  // validate user
  const { error } = schemaCreate.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const qrs = new Qrs({
    status: req.body.status,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
    lastScan: req.body.lastScan,
    userID: req.body.userID,
    mascotaID: req.body.mascotaID,
  });
  try {
    const savedQr = await qrs.save();
    res.json({
      error: null,
      data: savedQr,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});
//obtiene todos los qrs
router.get("/", async (req, res) => {
  try {
    const qrs = await Qrs.find();
    res.json({
      error: null,
      data: qrs,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//obtiene el qr que solicitas por parametro
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const qrs = await Qrs.findOne({ _id: id });

    // if (mascotaDB.userID) {
    //   const user = await User.findOne({ _id: mascotaDB.userID });
    //   mascotaDB.userID = user;
    // }

    res.json({
      error: null,
      data: qrs,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//actualiza los datos del qr
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    await Qrs.findByIdAndUpdate(id, body, { useFindAndModify: false });
    res.json({
      estado: true,
      mensaje: "Se ha editado con exito",
    });
  } catch (error) {
    console.log(error);
    res.json({
      estado: false,
      mensaje: "Edicion fallo",
    });
  }
});

//borra el registro del qr
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  console.log("id desde backend", id);
  try {
    const qrs = await Qrs.findByIdAndDelete({ _id: id });

    // https://stackoverflow.com/questions/27202075/expressjs-res-redirect-not-working-as-expected
    // res.redirect('/mascotas')
    if (!qrs) {
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
