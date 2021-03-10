const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const multer = require("multer");

// constraseña
const bcrypt = require("bcrypt");

// validation
const Joi = require("@hapi/joi");

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

const schemaRegister = Joi.object({
  fullName: Joi.string().min(5).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  address: Joi.string().min(6).max(255).required(),
  phone: Joi.string().min(6).max(255).required(),
  password: Joi.string().min(6).max(1024).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

//ingresa usuario, devuelve token autorizado
router.post("/login", async (req, res) => {
  // validaciones
  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "contraseña no válida" });

  // create token
  const token = jwt.sign(
    {
      fullName: user.fullName,
      id: user._id,
    },
    process.env.TOKEN_SECRET
  );

  res.header("auth-token", token).json({
    user,
    jwt: { token },
    error: null,
  });
});

//crea un nuevo usuario
router.post("/register", upload.single("image"), async (req, res) => {
  // validate user
  const { error } = schemaRegister.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist) {
    return res.status(400).json({ error: "Email ya registrado" });
  }

  // hash contraseña
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    password: password,
    image: req.file.filename,
  });
  try {
    const savedUser = await user.save();
    res.json({
      error: null,
      data: savedUser,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//devuelve todos los usuarios
router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.json({
      error: null,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//devuelve solo el usuario especifico
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findOne({ _id: id });
    res.json({
      error: null,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});
module.exports = router;
