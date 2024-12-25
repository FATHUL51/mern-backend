const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  bubble: {
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
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "file",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const Form = mongoose.model("form", FormSchema);
module.exports = Form;