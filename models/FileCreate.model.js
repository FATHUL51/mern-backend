const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    unique: true,
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "folder",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});
const File = mongoose.model("file", FileSchema);
module.exports = File;
