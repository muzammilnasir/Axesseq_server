const mongoose = require("mongoose");

const codeFrequencySchema = new mongoose.Schema({
  repositoryId: mongoose.Schema.Types.ObjectId,
  data: [[Number, Number, Number]],
  // [timestamp, additions, deletions]
});

const CodeFrequencyModel = mongoose.model("CodeFrequency", codeFrequencySchema);

module.exports = CodeFrequencyModel;
