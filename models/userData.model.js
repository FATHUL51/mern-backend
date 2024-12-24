const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
  foldername: {
    type: String,
  },
  filename: {
    type: String,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  number: {
    type: Number,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  },
  button: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const Folder = mongoose.model("folder", FolderSchema);
module.exports = Folder;
