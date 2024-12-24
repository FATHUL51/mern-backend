const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("hello");
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/user", userRoute);
app.listen(PORT, () => {
  console.log("server started on port 3000");
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
    });
});
