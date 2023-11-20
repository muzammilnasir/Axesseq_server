// models/folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  folderName: { type: String, },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  subFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }]
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;

  // parentFolder: { type: String },