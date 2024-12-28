// models/ShareableProfile.model.js

const mongoose = require("mongoose");

const ShareableProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folder",
    },
  ],
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "file",
    },
  ],
  isPublic: { type: Boolean, default: false }, // Whether the profile is shareable
  profileName: { type: String, required: true },
});

const ShareableProfile = mongoose.model(
  "ShareableProfile",
  ShareableProfileSchema
);
module.exports = ShareableProfile;
