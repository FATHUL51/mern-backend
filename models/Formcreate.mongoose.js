const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema(
  {
    file: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
    formname: { type: String }, // name of the form

    bubble_text: [{ type: String }], // Array to store multiple bubble_text values
    text: [{ type: String }], // Array for text inputs
    image: [{ type: String }], // Array for image inputs
    number: [{ type: String }], // Array for number inputs
    email: [{ type: String }],
    phone: [{ type: String }],
    rating: [{ type: String }],
    date: [{ type: String }],
    button: [{ type: String }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Form = mongoose.model("form", FormSchema);
module.exports = Form;
