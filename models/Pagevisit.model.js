const mongoose = require("mongoose");

// PageVisit schema
const pageVisitSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  status: { type: String, enum: ["1view"], required: true },
  timestamp: { type: Date, required: true },
});

const PageVisit = mongoose.model("PageVisit", pageVisitSchema);

// FormStatus schema
const formStatusSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  status: { type: String, enum: ["incomplete"], required: true },
  timestamp: { type: Date, required: true },
});

const FormStatus = mongoose.model("FormStatus", formStatusSchema);

module.exports = { PageVisit, FormStatus };
