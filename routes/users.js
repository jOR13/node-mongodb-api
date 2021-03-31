const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const webpush = require("../webpush.js");

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

router.post("/subscription", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Test" });

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
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
  password: Joi.string().min(6).max(1024).required(),
  SignUpType: Joi.string().min(1).max(1024).required(),
  address: Joi.string().min(0).max(255),
  phone: Joi.string().min(0).max(255),
  // filename: Joi.string().max(1024).required(),
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
  if (user === null) {
    console.log(res);
    return res.json({ error: "Usuario no encontrado" });
  }
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

let transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.PASSWORD_MAIL // generated ethereal password
  },
});
//send pw recovery
router.post("/resetPw", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user === null) {
    console.log(res);
    return res.json({ error: "Usuario no encontrado" });
  }

  const newPass = generatePasswordRand(8, "alf");

  // hash contraseña
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(newPass, salt);

  const userUpdate = await User.findByIdAndUpdate(
    user._id,
    { password: password },
    {
      useFindAndModify: false,
    }
  );

  console.log(userUpdate);

  let info = await transporter.sendMail({
    from: "jesus.ochoa@hiper-gas.com", // sender address
    to: req.body.email, // list of receivers
    subject: "Solicitud de cambio de contraseña", // Subject line
    text: "Hello world?", // plain text body
    html: `<h1 style="text-align: center;"><strong>Hola ${user.fullName}, tu contrase&ntilde;a temporal de HOPPAS es: <em>${newPass}</em> </strong></h1>`, // html body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  res.json({
    error: null,
    newPass: newPass,
    update: userUpdate,
  });
});

//crea un nuevo usuario
router.post("/register", upload.single("image"), async (req, res) => {
  // validate user
  const { error } = schemaRegister.validate(req.body);

  if (error) {
    console.log(error);
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
    SignUpType: req.body.SignUpType,
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
//crea un nuevo usuario
router.post("/registerExternal", async (req, res) => {
  // validate user
  // const { error } = schemaRegister.validate(req.body);

  // if (error) {
  //   console.log(error);
  //   return res.status(400).json({ error: error.details[0].message });
  // }

  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist) {
    return res.json({ error: "Email ya registrado" });
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
    image: req.body.image,
    SignUpType: req.body.SignUpType,
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

function generatePasswordRand(length, type) {
  let characters;
  switch (type) {
    case "num":
      characters = "0123456789";
      break;
    case "alf":
      characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
    case "rand":
      //FOR ↓
      break;
    default:
      characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      break;
  }
  var pass = "";
  for (let i = 0; i < length; i++) {
    if (type == "rand") {
      pass += String.fromCharCode((Math.floor(Math.random() * 100) % 94) + 33);
    } else {
      pass += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  return pass;
}

module.exports = router;
