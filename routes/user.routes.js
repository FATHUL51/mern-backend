const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const Folder = require("../models/Folder.model");
const File = require("../models/FileCreate.model");
const Form = require("../models/Formcreate.mongoose");
const User = require("../models/userCredentials.model");
const ShareableProfile = require("../models/ShareableProfile.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
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

router.post("/folder/:file/form", authMiddleware, async (req, res) => {
  const {
    formname,
    bubble_text,
    text,
    image,
    number,
    email,
    phone,
    rating,
    button,
  } = req.body;
  const { file } = req.params;

  try {
    // Validate the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the file
    const fileRecord = await File.findOne({ _id: file, user: req.user.id });
    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    // Create a new form and associate it with the file
    const form = await Form.create({
      formname,
      bubble_text,
      text,
      image,
      number,
      email,
      phone,
      rating,
      button,
      user: req.user.id,
      file: fileRecord._id, // Linking form to file by file ID
    });

    res.status(201).json({ message: "Form created successfully", form });
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

router.get("/folders/:fileId/form", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Fetch forms sorted by creation time (latest first)
    const forms = await Form.find({ file: fileId }).sort({ createdAt: -1 });

    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "No form found for this file." });
    }

    // Get the latest form
    const latestForm = forms[0];

    // Delete all older forms
    const oldForms = forms.slice(1); // Exclude the latest form
    for (const form of oldForms) {
      await Form.findByIdAndDelete(form._id);
    }

    // Return the latest form
    res.status(200).json({ form: latestForm });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Internal server error." });
  }
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

router.delete("/folders/:fileId/form/:componentName", async (req, res) => {
  try {
    const { fileId, componentName } = req.params;

    // Find the form associated with the fileId
    const form = await Form.findOne({ file: fileId });
    if (!form) {
      return res.status(404).json({ message: "Form not found for this file." });
    }

    // Check if the component exists as a field in the form
    if (!(componentName in form)) {
      return res
        .status(404)
        .json({ message: "Component not found in the form." });
    }

    // Clear the value of the component
    form[componentName] = undefined; // or set it to null if needed
    await form.save();

    res.status(200).json({ message: "Component deleted successfully.", form });
  } catch (error) {
    console.error("Error deleting component:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a file by ID
router.delete("/file/:fileId", authMiddleware, async (req, res) => {
  const { fileId } = req.params;

  try {
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).json({ message: "File not found!" });
    }

    res.status(200).json({ message: "File deleted successfully!" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// routes/shareableProfile.routes.js

// Create a shareable profile
router.post("/:dashBoardId/shareLink", authMiddleware, async (req, res) => {
  const { dashBoardId } = req.params;
  const { role } = req.body;

  if (!["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const dashBoard = await Dashboard.findById(dashBoardId);

    if (!dashBoard) {
      return res.status(404).json({ message: "Dashboard not found!" });
    }

    const linkId = crypto.randomBytes(16).toString("hex");
    const payload = { dashBoardId, role, linkId, userId: req.user.id };
    const secureLink = jwt.sign(payload, process.env.JWT_SECRET);

    dashBoard.shareLinks.push({ linkId, secureLink, used: false, role });
    await dashBoard.save();

    const sharingLink = `http://localhost:5173/dashBoard/${dashBoardId}/access/${linkId}/${secureLink}`;

    return res.status(201).json({
      message: "Share link created successfully",
      sharingLink,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// Update a shareable profile (add folders/files)
router.post("/:dashBoardId/shareEmail", authMiddleware, async (req, res) => {
  const { dashBoardId } = req.params;
  const { email, role } = req.body;

  if (!email || !["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const dashBoard = await Dashboard.findById(dashBoardId);

    if (!dashBoard) {
      return res.status(404).json({ message: "Dashboard not found!" });
    }

    const existingCollaborator = dashBoard.collaborators.find(
      (collab) =>
        collab.user.toString() === user._id.toString() && collab.role === role
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: "User already has this role!" });
    }

    dashBoard.collaborators.push({ user: user._id, role, accessType: "email" });
    await dashBoard.save();

    return res.status(200).json({ message: "Email shared successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// View a shareable profile (read-only)
router.get("/view/:profileId", async (req, res) => {
  const { profileId } = req.params;

  try {
    // Find the shareable profile
    const profile = await ShareableProfile.findById(profileId)
      .populate("folders")
      .populate("files");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (!profile.isPublic) {
      return res.status(403).json({ message: "This profile is not shareable" });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Delete a shareable profile
router.delete("/delete/:profileId", authMiddleware, async (req, res) => {
  const { profileId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find and delete the shareable profile
    const profile = await ShareableProfile.findById(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Ensure that the profile belongs to the current user
    if (profile.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this profile" });
    }

    await profile.remove();
    res.status(200).json({ message: "Shareable profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
