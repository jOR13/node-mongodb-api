const router = require("express").Router();
const Pets = require("../models/Pets");
const User = require("../models/User");
const Posts = require("../models/Posts");
const jwt = require("jsonwebtoken");

const multer = require("multer");

//define storage for the images

const storage = multer.diskStorage({
    //destination for files
    destination: function (request, file, callback) {
      callback(null, "./uploads/images/posts");
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
    userID: Joi.string().min(3).max(255).required(),
    message: Joi.string().min(3).max(9999).required(),
});

router.post("/createPost",upload.single("image"), async (req, res) => {
  // validate user
  const { error } = schemaCreate.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const post = new Posts({
    userID: req.body.userID,
    message: req.body.message,
    image: req.body.image,
  });
  try {
    const savedQr = await post.save();
    res.json({
      error: null,
      data: savedQr,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});
//obtiene todos los post
router.get("/", async (req, res) => {
  try {
    const post = await Posts.find();
    res.json({
      error: null,
      data: post,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//obtiene el qr que solicitas por parametro
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Qrs.findOne({ _id: id });

    // if (mascotaDB.userID) {
    //   const user = await User.findOne({ _id: mascotaDB.userID });
    //   mascotaDB.userID = user;
    // }

    res.json({
      error: null,
      data: post,
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
    await Posts.findByIdAndUpdate(id, body, { useFindAndModify: false });
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
    const posts = await Qrs.findByIdAndDelete({ _id: id });

    // https://stackoverflow.com/questions/27202075/expressjs-res-redirect-not-working-as-expected
    // res.redirect('/mascotas')
    if (!posts) {
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
