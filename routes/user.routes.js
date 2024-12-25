const express = require("express");
const router = express.Router();
const User = require("../models/userCredentials.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authMiddleware = require("../middlewares/auth.middleware");
const Folder = require("../models/Folder.model");
const File = require("../models/FileCreate.model");
const Form = require("../models/Formcreate.mongoose");
const { header } = require("express-validator");

dotenv.config();
router.use(express.json());

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: `${error}` });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Secure cookie options
    res.cookie("token", token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout a user
router.get("/logout", authMiddleware, (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user settings
router.get("/setting", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user details

// Update user settings
router.put("/update", authMiddleware, async (req, res) => {
  const { username, email, oldpassword, password } = req.body;

  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) return res.status(404).send("User not found");

    // Check if the old password matches
    if (oldpassword && password) {
      const isMatch = await bcrypt.compare(oldpassword, user.password);
      if (!isMatch) return res.status(400).send("Old password is incorrect");

      // Hash new password if it's provided
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update username and email
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res
      .status(200)
      .send({ message: "User settings updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ...existing code...

router.post("/folder", authMiddleware, async (req, res) => {
  const { foldername } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a folder with the same name already exists for the user
    const existingFolder = await Folder.findOne({
      foldername,
      user: req.user.id,
    });
    if (existingFolder) {
      return res.status(400).json({
        message: "Folder name already exists. Please choose another name.",
      });
    }

    // Create a new folder
    const newFolder = await Folder.create({
      foldername,
      user: req.user.id,
    });

    res
      .status(201)
      .json({ message: "Folder created successfully", folder: newFolder });
  } catch (error) {
    console.error(error);

    // Return a generic error message with error details during development
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/folder/file", authMiddleware, async (req, res) => {
  const { filename } = req.body;

  try {
    // Check if filename already exists
    const existingFile = await File.findOne({ filename });
    if (existingFile) {
      return res.status(400).json({
        message: "Filename already exists. Please choose another name.",
      });
    }

    // Check if the user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new file entry
    const newFile = await File.create({
      filename,
      user: req.user.id,
    });

    res
      .status(201)
      .json({ message: "File created successfully", file: newFile });
  } catch (error) {
    console.error(error);

    // Return detailed error for debugging during development
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/folder/file/form", authMiddleware, async (req, res) => {
  const { bubble, text, image, number, email, phone, rating, button } =
    req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Create a new folder
    const form = await Form.create({
      bubble,
      text,
      image,
      number,
      email,
      phone,
      rating,
      button,
      user: req.user.id,
    });

    res.status(201).json({ message: "Folder created successfully", form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/folders", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const folders = await Folder.find({ user: req.user.id });

    res.status(200).json({ folders });
  } catch (error) {}
});
router.get("/folders/file", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const file = await File.find({ user: req.user.id });

    res.status(200).json({ file });
  } catch (error) {}
});
router.get("/folders/file/form", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const form = await Folder.find({ user: req.user.id });

    res.status(200).json({ form });
  } catch (error) {}
});
router.delete("/folder/:id", authMiddleware, async (req, res) => {
  try {
    const folderId = req.params.id;

    const deletedFolder = await Folder.findByIdAndDelete(folderId);

    if (!deletedFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res
      .status(200)
      .json({ message: "Folder deleted successfully", deletedFolder });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Delete a file by ID
router.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const fileId = req.params.id;

    const deletedFile = await File.findOneAndDelete(fileId);

    if (!deletedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "File deleted successfully", deletedFile });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
