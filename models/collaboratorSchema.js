const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema({
  repositoryId: mongoose.Schema.Types.ObjectId,
  username: String,
  accessLevel: String, // Access level can be "pull", "push", "admin", etc.
});

const Collaborator = mongoose.model("Collaborator", collaboratorSchema);
module.exports = Collaborator;
