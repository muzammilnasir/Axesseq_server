const Repository = require("../models/repositorySchema");
const Folder = require("../models/folderSchema");
const Commit = require("../models/commitSchema");
const Contributor = require("../models/contributorSchema");
const Collaborator = require("../models/collaboratorSchema");
const CodeFrequencyModel = require("../models/codeFrequencySchema");
const Language = require("../models/languageSchema");

// const Order = require("../models/orderSchema");


exports.initialData = async (req, res) => {
  const repositories = await Repository.find();

  const topLevelFolders = await Folder.find({ parentFolder: null });

  // Function to recursively populate subfolders with files
  const populateSubfoldersWithFiles = async (folder) => {
    const populatedFolder = await Folder.findById(folder._id)
      .populate('subFolders')
      .populate('files')
      .exec();

    return {
      _id: populatedFolder._id,
      folderName: populatedFolder.folderName,
      parentFolder: populatedFolder.parentFolder,
      subFolders: await Promise.all(
        populatedFolder.subFolders.map((subFolder) =>
          populateSubfoldersWithFiles(subFolder)
        )
      ),
      files: populatedFolder.files,
    };
  };

  // Populate the top-level folders data recursively
  const contents = await Promise.all(
    topLevelFolders.map((folder) => populateSubfoldersWithFiles(folder))
  );

  const commits = await Commit.find().exec();
  const collaborators = await Collaborator.find();
  const contributors = await Contributor.find();
  const codeFrequencyData = await CodeFrequencyModel.find();

  res.status(200).json({
    repositories,
    contents,
    commits,
    collaborators,
    contributors,
    codeFrequencyData

  });
};

exports.codeFrequency =  async (req, res) => {
  try {
    // Fetch data from your MongoDB collection (CodeFrequencyModel)
    const codeFrequencyData = await CodeFrequencyModel.find();

    // Send the data as a JSON response to the frontend
    res.status(200).json({ codeFrequencyData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// app.get("/frequency", async (req, res) => {
exports.frequency = async (req, res) => {
  try {
    // Perform aggregation using Mongoose
    const aggregatedData = await CodeFrequencyModel.aggregate([
      {
        $group: {
          _id: null,
          data: { $push: "$data" }, // Push all 'data' fields into an array
        },
      },
    ]);

    // Check if there's any data
    if (!aggregatedData.length) {
      return res.status(404).json({ message: "No data found" });
    }

    // Send the aggregated data
    res.status(200).json(aggregatedData[0]); // Send the first result (should be the only one)
  } catch (error) {
    console.error("Error fetching code frequency data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.languages = async (req, res) => {
  try {
    // Fetch language data for all repositories
    const allLanguageData = await Language.find({});
    // Combine and calculate language totals across all repositories
    const totalLanguageData = {};
    for (const repoData of allLanguageData) {
      for (const language in repoData.languages) {
        const linesOfCode = repoData.languages[language];
        if (!totalLanguageData[language]) {
          totalLanguageData[language] = 0;
        }
        totalLanguageData[language] += linesOfCode;
      }
    }

    // Calculate the language percentages
    const totalLinesOfCode = Object.values(totalLanguageData).reduce(
      (acc, value) => acc + value,
      0
    );
    const languagePercentages = {};

    for (const language in totalLanguageData) {
      const linesOfCode = totalLanguageData[language];
      const percentage = (linesOfCode / totalLinesOfCode) * 100;
      languagePercentages[language] = percentage.toFixed(2); // Round to 2 decimal places
    }

    // Send the language percentages to the frontend
    res.json({ languagePercentages });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Define an API endpoint to calculate language percentages across all repositories
// app.get("/calculateAllLanguagesPercentages", 