const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const multer = require("multer");
const AdmZip = require("adm-zip");
const JSZip = require("jszip");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 5000;
const Repository = require("./models/repositorySchema");
const File = require("./models/fileSchema");
const Folder = require("./models/folderSchema");
const SecurityQuestion = require('./models/securitySchema');
const Language = require("./models/languageSchema");
const Commit = require("./models/commitSchema");
const Contributor = require("./models/contributorSchema");
const Collaborator = require("./models/collaboratorSchema");
const CodeFrequencyModel = require("./models/codeFrequencySchema");

require("dotenv").config();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://saadshaikh0316:Catdog0316@cluster0.pl3tgtp.mongodb.net/Axesseq?retryWrites=true&w=majority",
      {}
    );
    console.log("DB is Connected ");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
connectToDatabase();

//////////////////////
const authRoutes = require("./routes/auth");
const securityRoutes = require("./routes/security");
const initialRoutes = require("./routes/initialData");
const repositoryRoutes = require("./routes/repository.routes");
const folderRoutes = require("./routes/folder");
app.use("/user", authRoutes);
app.use("/api", securityRoutes);
app.use("/", initialRoutes);
app.use("/api", repositoryRoutes);
app.use("/", folderRoutes);
///////////////////////

app.use(express.urlencoded({ extended: true }));

// Recursive function to create a zip file with the hierarchical data
function createZipFileRecursive(data, parentEntry) {
  for (const name in data) {
    const entryData = data[name];

    if (typeof entryData === "object") {
      const entry = parentEntry.addFolder(name);
      createZipFileRecursive(entryData, entry);
    } else {
      parentEntry.addFile(name, Buffer.alloc(0));
    }
  }
}


app.get("/", async (req, res) => {
  try {
    const securityQuestionData = "baseurl is working now";
    res.status(200).json(securityQuestionData);
  } catch (error) {
    console.error("Error fetching security questions:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});


// Define a function to validate the user's answers
const validateAnswers = async (answers) => {
  try {
    // Fetch the stored security questions and answers from the database
    const storedSecurityQuestions = await SecurityQuestion.findOne();

    // Compare the user's answers with the stored answers
    const isMatch =
      answers.answer1 === storedSecurityQuestions.answer1 &&
      answers.answer2 === storedSecurityQuestions.answer2 &&
      answers.answer3 === storedSecurityQuestions.answer3;

    return isMatch
      ? { success: true } // Return success message
      : { success: false, message: "Incorrect answers. Please try again." }; // Return error message
  } catch (error) {
    console.error("Error validating answers:", error);
    return {
      success: false,
      message: "Internal server error. Please try again later.",
    }; // Return error message in case of any error
  }
};

app.post("/api/security-questions/validate-answers", async (req, res) => {
  try {
    const { answers } = req.body; // The user's answers
    // console.log( { answers } )
    // Validate the answers against the stored answers in the database
    const validationResponse = await validateAnswers(answers);

    if (validationResponse.success) {
      // If answers are correct, send a success response
      res.status(200).json(validationResponse);
    } else {
      // If answers are incorrect, send a failure response with an error message
      console.log("Validation failed:", validationResponse.message);
      // res.status(401).json(validationResponse.message);
      res.status(401).json({ message: "Incorrect answers. Please try again." });
    }
  } catch (error) {
    console.error("Error validating answers:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

const User = require("./models/userSchema");

// Define your API endpoint
app.post("/fetch-repo-contents", async (req, res) => {
  const { repositoryId, repositoryNames } = req.body;
  console.log(repositoryId, repositoryNames);
  try {
    // Call the main function with the provided data
    repoContentsURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/contents`;
    repoLanguageURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/languages`;
    repoCollaboratorURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/collaborators`;
    repoCommitsURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/commits`;
    repoContributorsURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/stats/contributors`;
    repoFrequencyURL = `${baseURL}/repos/${repositoryOwner}/${repositoryNames}/stats/code_frequency`;
    await main(repositoryId);
    res.status(200).send("Repository contents fetched and stored.");
  } catch (error) {
    console.error("Error fetching repository contents:", error.message);
    res.status(500).send("Error fetching repository contents.");
  }
});

const githubAccessToken = "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";
const repositoryOwner = "saad-shaikh01";
let repositoryNames = "";
const baseURL = "https://api.github.com";
let repoContentsURL = "";
let repoLanguageURL = "";
let repoCollaboratorURL = "";
let repoCommitsURL = "";
let repoContributorsURL = "";
let repoFrequencyURL = "";



async function main(repositoryId) {
  try {
    // Fetch and store the contents of the repository
    // const topLevelContents = await fetchRepositoryContents("", repositoryId);

    // Fetch repository languages data
    const languagesData = await fetchRepositoryLanguages(repositoryId);

    // Save languages data to MongoDB
    await saveLanguagesToMongoDB(repositoryId, languagesData);

    // Fetch and store collaborators data
    // const collaboratorsData = await fetchRepositoryCollaborators(repositoryId);
    // await saveCollaboratorsToMongoDB(repositoryId, collaboratorsData);

    // Fetch and store user commits data
    await fetchAndStoreUserCommits(repositoryId);

    // Fetch and store Contributors data
    await fetchAndstoreContributors(repositoryId);
    // Fetch and store Frequency data
    await fetchFrequencyDataAndStore(repositoryId);
    console.log(
      "Repository contents and collaborators fetched and stored in MongoDB."
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function fetchRepositoryCollaborators(repositoryId) {
  try {
    const response = await axios.get(repoCollaboratorURL, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    });

    if (response.status === 200) {
      const collaboratorsData = response.data;
      return collaboratorsData;
    } else {
      console.error(
        `Failed to fetch collaborators. Status code: ${response.status}`
      );
      throw new Error(
        `Failed to fetch collaborators. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

async function saveCollaboratorsToMongoDB(repositoryId, collaboratorsData) {
  try {
    for (const collaborator of collaboratorsData) {
      const { login, permissions } = collaborator;

      // Check if a collaborator with the same username and repositoryId exists
      const existingCollaborator = await Collaborator.findOne({
        repositoryId,
        username: login,
      });

      if (existingCollaborator) {
        // Collaborator already exists, update the accessLevel
        await Collaborator.updateOne(
          { _id: existingCollaborator._id },
          { $set: { accessLevel: permissions.push } }
        );
        console.log(`Updated collaborator ${login} in MongoDB.`);
      } else {
        // Collaborator doesn't exist, insert a new collaborator
        await Collaborator.create({
          repositoryId,
          username: login,
          accessLevel: permissions.push,
        });
        console.log(`Inserted new collaborator ${login} to MongoDB.`);
      }
    }

    console.log("Collaborators saved to MongoDB.");
  } catch (error) {
    console.error("Error saving collaborators to MongoDB:", error.message);
  }
}

async function fetchAndStoreUserCommits(repositoryId) {
  // const repoCommitsURL = `https://api.github.com/repos/saad-shaikh01/Calculator/commits/main`;

  try {
    const response = await axios.get(repoCommitsURL);

    if (response.status === 200) {
      const commitsData = response.data;
      const commitsToSave = commitsData.map((commit) => ({
        repositoryId: repositoryId,
        sha: commit.sha,
        message: commit.commit.message,
        timestamp: commit.commit.author.date,
        authorName: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        verification: commit.commit.verification.verified,
      }));

      for (const commitData of commitsToSave) {
        // Use updateOne with upsert option to update or insert the document
        await Commit.updateOne(
          { repositoryId: commitData.repositoryId, sha: commitData.sha },
          { $set: commitData },
          { upsert: true }
        );
      }

      console.log("Repository commits saved to MongoDB.");
    } else {
      console.error(
        `Failed to fetch repository commits. Status code: ${response.status}`
      );
      throw new Error(
        `Failed to fetch repository commits. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Errorss: ${error.message}`);
    throw error;
  }
}
// "https://api.github.com/repos/AhsanDT/Drivetech---Bestie-BE/stats/contributors"

async function fetchAndstoreContributors(repositoryId) {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/Ajaypetwal/axesseq/stats/contributors"
      // repoContributorsURL
    );

    if (response.data && Array.isArray(response.data)) {
      for (const contributorData of response.data) {
        const { total, weeks, author } = contributorData;

        // Check if a contributor with the same repositoryId and author exists
        const existingContributor = await Contributor.findOne({
          repositoryId,
          author,
        });

        if (existingContributor) {
          // Contributor already exists, update the data
          await Contributor.updateOne(
            { _id: existingContributor._id },
            { $set: { total, weeks } }
          );
          console.log(`Updated contributor ${author} in MongoDB.`);
        } else {
          // Contributor doesn't exist, insert a new contributor
          const contributor = new Contributor({
            repositoryId,
            total,
            weeks,
            author,
          });
          await contributor.save();
          console.log(`Inserted new contributor ${author} to MongoDB.`);
        }
      }

      console.log("Data imported successfully.");
    } else {
      console.error("No data received from the GitHub API.");
    }
  } catch (error) {
    console.error("Error fetching or updating data:", error.message);
  }
}

async function fetchFrequencyDataAndStore(repositoryId) {
  try {
    // Fetch data from the GitHub API
    const response = await axios.get(
      "https://api.github.com/repos/AhsanDT/drivetechnology/stats/code_frequency"
      // repoFrequencyURL
    );

    if (response.status === 200) {
      const codeFrequencyData = response.data;
      console.log(codeFrequencyData);

      // Check if code frequency data for the given repository already exists
      const existingData = await CodeFrequencyModel.findOne({ repositoryId });

      if (existingData) {
        // Data already exists, update it
        await CodeFrequencyModel.updateOne(
          { repositoryId },
          { $set: { data: codeFrequencyData } }
        );
        console.log("Data updated successfully.");
      } else {
        // Data doesn't exist, save it as a new document
        await saveCodeFrequencyData(codeFrequencyData, repositoryId);
        console.log("Data saved successfully.");
      }
    } else {
      console.error("Error fetching data from GitHub API:", response.status);
    }
  } catch (error) {
    console.error("Error fetching or saving data:", error);
  }
}

async function saveCodeFrequencyData(data, repositoryId) {
  // Loop through the data array and save each entry as a document
  const codeFrequencyData = new CodeFrequencyModel({
    repositoryId,
    data: data,
  });

  await codeFrequencyData.save();
}

async function fetchRepositoryLanguages(repositoryId) {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/AhsanDT/Drivetech---Bestie-BE/languages"
      // repoLanguageURL

      // {
      //   headers: {
      //     Authorization: `Bearer ${githubAccessToken}`,
      //   },
      //   timeout: 900000,
      // }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching languages data:", error.message);
    return {}; // Return an empty object in case of an error
  }
}

async function saveLanguagesToMongoDB(repositoryId, languagesData) {
  try {
    const existingLanguagesData = await Language.findOne({ repositoryId });

    if (existingLanguagesData) {
      // Languages data for the repository already exists, update it
      existingLanguagesData.languages = languagesData;
      await existingLanguagesData.save();
    } else {
      // Languages data doesn't exist, create a new entry
      const newLanguagesData = new Language({
        repositoryId,
        languages: languagesData,
      });
      await newLanguagesData.save();
    }
  } catch (error) {
    console.error("Error saving languages data to MongoDB:", error.message);
  }
}

// Define an API endpoint to calculate language percentages
app.get("/calculateLanguagePercentages/:repositoryId", async (req, res) => {
  const repositoryId = req.params.repositoryId;

  try {
    // Fetch the language data for the specified repositoryId
    const languageData = await Language.findOne({ repositoryId });

    if (!languageData) {
      return res
        .status(404)
        .json({ message: "Language data not found for the repositoryId" });
    }

    // Calculate the language percentages
    const totalLinesOfCode = Object.values(languageData.languages).reduce(
      (acc, value) => acc + value,
      0
    );
    const languagePercentages = {};

    for (const language in languageData.languages) {
      const linesOfCode = languageData.languages[language];
      const percentage = (linesOfCode / totalLinesOfCode) * 100;
      languagePercentages[language] = percentage.toFixed(2); // Round to 2 decimal places
    }

    // Send the language percentages to the frontend
    res.json({ languagePercentages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Define a route to get commit history by repositoryId
app.get("/api/commits/:repositoryId", async (req, res) => {
  const repositoryId = req.params.repositoryId;

  console.log(repositoryId);
  try {
    const commits = await Commit.find({ repositoryId }).exec();

    if (!commits) {
      return res.status(404).json({ error: "Commit history not found" });
    }

    return res.status(200).json({ commits });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/commits", async (req, res) => {
  // const repositoryId = req.params.repositoryId;

  try {
    const commits = await Commit.find().exec();

    // if (!commits) {
    //   return res.status(404).json({ error: "Commit history not found" });
    // }

    return res.status(200).json(commits);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/collaborators", async (req, res) => {
  try {
    // const repositoryId = req.params.repositoryId;

    // Find all collaborators for the given repositoryId
    const collaborators = await Collaborator.find();

    res.status(200).json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

app.get("/contributors", async (req, res) => {
  // const repositoryId = req.params.repositoryId;
  try {
    const contributors = await Contributor.find();
    res.status(200).json({ contributors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/code-frequency", async (req, res) => {
  try {
    // Fetch data from your MongoDB collection (CodeFrequencyModel)
    const codeFrequencyData = await CodeFrequencyModel.find();

    // Send the data as a JSON response to the frontend
    res.status(200).json({ codeFrequencyData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to fetch data for all collaborators with unique usernames
app.get("/api/collaborators", async (req, res) => {
  try {
    // Fetch all collaborators from the database
    const collaborators = await Collaborator.find();

    // Extract unique usernames from the list of collaborators
    const uniqueUsernames = [
      ...new Set(collaborators.map((collaborator) => collaborator.username)),
    ];

    // Create an array of unique collaborators
    const uniqueCollaborators = uniqueUsernames.map((username) => {
      const collaborator = collaborators.find((c) => c.username === username);
      return {
        username: collaborator.username,
        accessLevel: collaborator.accessLevel,
      };
    });

    // Send the unique collaborators data as a response
    res.status(200).json(uniqueCollaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

app.get("/api/collaborators/:repositoryId", async (req, res) => {
  try {
    const repositoryId = req.params.repositoryId;

    // Find all collaborators for the given repositoryId
    const collaborators = await Collaborator.find({ repositoryId });

    res.status(200).json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

app.get("/contributors/aggregated", async (req, res) => {
  try {
    const contributors = await Contributor.aggregate([
      {
        $group: {
          _id: "$author.login", // Group by the 'login' field (GitHub username)
          total: { $sum: "$total" }, // Calculate the sum of 'total'
          weeks: {
            $push: "$weeks", // Push all 'weeks' arrays into an array
          },
          authorDetails: { $first: "$author" }, // Keep the author details for the first entry
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          "authorDetails.login": "$_id", // Rename _id to 'login' in the 'authorDetails' object
          total: 1, // Include the 'total' field
          weeks: {
            $reduce: {
              input: "$weeks",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          }, // Concatenate all 'weeks' arrays
          author: "$authorDetails", // Rename 'authorDetails' back to 'author'
        },
      },
    ]);

    res.json(contributors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/contributors/:repositoryId", async (req, res) => {
  const repositoryId = req.params.repositoryId;
  try {
    const contributors = await Contributor.find({ repositoryId });
    res.status(200).json({ contributors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/code-frequency/:repositoryId", async (req, res) => {
  const repositoryId = req.params.repositoryId;
  try {
    // Fetch data from your MongoDB collection (CodeFrequencyModel)
    const codeFrequencyData = await CodeFrequencyModel.find({ repositoryId });

    // Send the data as a JSON response to the frontend
    res.status(200).json({ codeFrequencyData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/download-zip/:repositoryId", async (req, res) => {
  try {
    const repositoryId = req.params.repositoryId;
    console.log(repositoryId);
    // Fetch data from MongoDB
    const jsonData = await Content.find({ repositoryId }).populate("children");

    const zip = new JSZip();

    // Function to recursively add files and folders to the zip
    const addFilesToZip = async (folderPath, items) => {
      for (const item of items) {
        const itemPath = folderPath + "/" + item.name;

        if (item.type === "file") {
          console.log("Adding file:", itemPath);
          // If it's a file, fetch the content separately as it might be a reference
          const fileData = await Content.findById(item._id);
          zip.file(fileData.path, fileData.content);
        } else if (item.type === "dir") {
          console.log("Adding directory:", itemPath);
          // Recursively add files in subdirectories
          const subDirectory = await Content.findById(item._id);
          await addFilesToZip(subDirectory.path, subDirectory.children);

          // Include subfolder contents in the zip
          for (const child of subDirectory.children) {
            const childFileData = await Content.findById(child);
            if (childFileData.type === "file") {
              zip.file(childFileData.path, childFileData.content);
            } else if (childFileData.type === "dir") {
              zip.folder(childFileData.path, childFileData.content);
            }
          }
        }
      }
    };

    // Start with the root directory
    await addFilesToZip("", jsonData);

    // Generate the zip file asynchronously
    const zipData = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=my-zip-file.zip"
    );
    res.setHeader("Content-Type", "application/zip");
    res.status(200).send(zipData);
  } catch (error) {
    console.error("Error creating zip:", error);
    res.status(500).send("Internal Server Error");
  }
});


// async function deleteAllContent() {
//   try {
//     // Delete all documents in the 'contents' collection
//     await Content.deleteMany({});
//     // await Repository.deleteMany({});
//     await Language.deleteMany({});
//     await Collaborator.deleteMany({});
//     await Commit.deleteMany({});
//     await Contributor.deleteMany({});
//     await CodeFrequencyModel.deleteMany({});
//     await File.deleteMany({});
//     await Folder.deleteMany({});
//     console.log('All content deleted successfully.');
//   } catch (error) {
//     console.error('Error deleting content:', error);
//   }
// }

// // Call the deleteAllContent function to initiate the deletion
// deleteAllContent();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
