// models/file.js
const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  repositoryId: mongoose.Schema.Types.ObjectId,
  sha: String, // Commit hash
  message: String, // Commit message
  timestamp: Date, // Commit timestamp
  authorName: String, // Commit timestamp
  authorEmail: String, // Commit timestamp
  verification: String, // Commit timestamp
});

const Commit = mongoose.model("Commit", commitSchema);
module.exports = Commit;
