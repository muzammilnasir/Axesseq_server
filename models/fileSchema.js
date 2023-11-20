// models/file.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String },
  parentFolder: { type: String }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
