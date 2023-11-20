// controllers/fileController.js
const File = require('../models/file');

// Create a new file
const createFile = async (req, res) => {
  try {
    const { name, type, content, parentFolder } = req.body;
    const file = new File({ name, type, content, parentFolder });
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create file' });
  }
};

// Get a file by ID
const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get file' });
  }
};

// Update a file by ID
const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name, type, content } = req.body;
    const file = await File.findByIdAndUpdate(fileId, { name, type, content }, { new: true });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update file' });
  }
};

// Delete a file by ID
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findByIdAndDelete(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

module.exports = {
  createFile,
  getFile,
  updateFile,
  deleteFile,
};
