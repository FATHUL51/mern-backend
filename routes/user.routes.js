const express = require("express");
const router = express.Router();
const User = require("../models/userCredentials.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const isUserExists = await User.findOne({ email });

  if (isUserExists) {
    return res.status(400).json({ message: "user already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(200).json({ message: "user created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
    return res.status(400).json({ message: "user or password is incorrect" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "user or password is incorrect" });
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  res.cookie("token", token);
  res.status(200).json({ token });
});
router.get("/logout", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.clearCookie("token");
  res.status(200).json({ message: "logout successful" });
});
router.get("/setting/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  res.status(200).json({ user });
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findByIdAndUpdate(
    id,
    { username, email, password: hashedPassword },
    { new: true }
  );
  res.status(200).json({ user });
});
module.exports = router;
