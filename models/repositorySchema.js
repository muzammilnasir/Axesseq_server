// models/repository.js
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  description: { type: String },
  openedAt: Date, // Add the openedAt field
  createdAt: { type: Date, default: Date.now },
});

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;