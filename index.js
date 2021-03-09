const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
// import routes
const authRoutes = require("./routes/users");
const Pets = require("./routes/pets");
const Qrs = require("./routes/qrs");
const dashboadRoutes = require("./routes/dashboard");
const verifyToken = require("./routes/validate-token");
// cors
const cors = require("cors");

require("dotenv").config();

const app = express();

var corsOptions = {
  origin: "http://localhost:3000", // Reemplazar con dominio
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.achiw.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Base de datos conectada"))
  .catch((e) => console.log("error db:", e));

// import routes

// route middlewares
app.use("/api/user", authRoutes);
app.use("/api/pets", Pets);
app.use("/api/qrs", Qrs);

app.use("/api/dashboard", verifyToken, dashboadRoutes);
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({
    estado: true,
    mensaje: "Api funcionando",
  });
});

// iniciar server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`servidor andando en: ${PORT}`);
});
