const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  repositoryId: mongoose.Schema.Types.ObjectId,
  languages: Object, // Store languages data as an object
  createdAt: { type: Date, default: Date.now },
});

const Language = mongoose.model("Language", languageSchema);

module.exports = Language;
