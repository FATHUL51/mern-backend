// models/ShareableProfile.model.js

const mongoose = require("mongoose");

const ShareableProfileSchema = new mongoose.Schema({
  SharebtEmail: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["editor", "viewer"],
        default: "viewer",
      },
      accessType: {
        type: String,
        enum: ["email", "link"],
        default: "email",
      },
    },
  ],
  sharebyLinks: [
    {
      linkId: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["editor", "viewer"],
        required: true,
      },
    },
  ],
});

const ShareableProfile = mongoose.model(
  "ShareableProfile",
  ShareableProfileSchema
);
module.exports = ShareableProfile;
