const Repository = require("../models/repositorySchema");
const mongoose = require("mongoose"); // Import mongoose

// Route to fetch repositories
// app.get("/get-repositories", async (req, res) => {
const getRepository = async (req, res) => {
  try {
    const repositories = await Repository.find(); // Fetch all repositories from the database

    res.status(200).json( {repositories} );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching repositories." });
  }
};

// app.get("/get/recently-repos", async (req, res) => {
const getRecently = async (req, res) => {
  try {
    // Find repositories, sort them by openedAt in descending order (most recent first), and limit to 6
    const recentlyOpenedRepos = await Repository.find()
      .sort({ openedAt: -1 })
      .limit(6);

    res.status(200).json( {recentlyOpenedRepos} );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// app.post("/api/create-repository", async (req, res) => {
const createRepo = async (req, res) => {
  console.log(req.body);
  try {
    const { name, owner } = req.body;

    // Convert the name to lowercase to ensure case insensitivity
    const lowercaseName = name.toLowerCase();

    // Check if a repository with the lowercase name already exists
    const existingRepository = await Repository.findOne({
      name: lowercaseName,
    });

    if (existingRepository) {
      return res
        .status(400)
        .json({ error: "Repository with this name already exists." });
    }

    const newRepository = await Repository.create({
      _id: new mongoose.Types.ObjectId(),
      name: lowercaseName,
      owner,
    });
    res.status(200).send();
    console.log("created succesffuly");
  } catch (error) {
    console.error(error);
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the repository." });
  }
};

// POST route for opening a repository
const recentlyOpen = async (req, res) => {
  try {
    const { repoId } = req.params;
    console.log(repoId);
    // Find the repository by ID
    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Set the openedAt field to the current date and time
    repository.openedAt = new Date();

    // Save the repository
    await repository.save();

    res.status(200).send()
    console.log({ message: "Repository opened successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// app.delete("/repositories/:repositoryId", async (req, res) => {
const deleteRepo = async (req, res) => {
  try {
    const repositoryId = req.params.repoId;
    console.log(repositoryId);

    // Delete the repository and its associated data
    await Repository.findByIdAndDelete(repositoryId);

    // You can also delete associated content, languages, and collaborators here if needed

    res.status(200).send(); // Respond with a 204 No Content status upon successful deletion
    console.log("delete successfuly "); // Respond with a 204 No Content status upon successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getRepository,
  getRecently,
  createRepo,
  recentlyOpen,
  deleteRepo,
};
