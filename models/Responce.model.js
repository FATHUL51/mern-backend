// MongoDB Schema using Mongoose
const mongoose = require("mongoose");

const bubbleTextSchema = new mongoose.Schema({
  content: { type: String },
  answer: { type: String },
});

const imageSchema = new mongoose.Schema({
  content: { type: String },
  answer: { type: String },
});

const postSchema = new mongoose.Schema({
  bubble_text: { type: [bubbleTextSchema] },
  image: { type: [imageSchema] },
  text: { type: String },
  number: { type: String },
  email: { type: String },
  phone: { type: String },
  rating: { type: String },
  fileId: { type: String },
  timestamp: { type: Date },
  status: { type: String },
});

module.exports = mongoose.model("Response", postSchema);
