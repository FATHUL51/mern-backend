const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
  foldername: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const Folder = mongoose.model("folder", FolderSchema);
module.exports = Folder;
