const express = require("express");
const router = express.Router();
const multer = require("multer");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const Folder = require("../models/folderSchema");
const File = require("../models/fileSchema");
const Repository = require("../models/repositorySchema");
const Language = require('../models/languageSchema')
const Collaborator = require('../models/collaboratorSchema')
const Commit = require('../models/commitSchema')
const Contributor = require('../models/contributorSchema')
const CodeFrequencyModel = require('../models/codeFrequencySchema')

const upload = multer({ dest: "uploads/" });
// Route to handle the file upload
// app.post('/upload/:repositoryId', upload.single('zipFile'), async (req, res) => {
router.post(
  "/upload/:repositoryId",
  upload.single("zipFile"),
  async (req, res) => {
    try {
      const { repositoryId } = req.params;
      const filePath = req.file.path;
      console.log(filePath);

      // Load the zip file
      const zip = new AdmZip(filePath);
      // Extract the entries from the zip file
      const zipEntries = zip.getEntries();

      // Get the root folder of the repository
      // const rootFolder = await Folder.findOne({ _id: repositoryId });

      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          const fileName = entry.entryName;
          var fileContent = entry.getData();
          // const fileContent = entry.getData().toString("utf8");
          const parentFolder = path.dirname(fileName);


          let contentType = 'file'; // Default content type
          let imagePath = '';
          // Check if it's an image
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']; // Add more extensions if needed
          const ext = path.extname(fileName).toLowerCase();
          if (imageExtensions.includes(ext)) {
            // Save the file to the "images" folder
            const imageFolder = path.join(__dirname, 'images', path.dirname(fileName));
            ensureDirectoryExists(imageFolder); // Create directory if it doesn't exist

            const imagePath = path.join(path.basename(fileName));
            fs.writeFileSync(imagePath, fileContent);

            // Update content type and content field to store image URL in the database
            contentType = 'image';
            fileContent = imagePath;
          }
          // Create a new file entity
          let file = new File({
            fileName: fileName,
            type: "file",
            content:  fileContent,
            parentFolder: parentFolder,
          });

          // Save the file to the database
         await file.save();
          // Find the parent folder in the database
          let parent = await Folder.findOne({ folderName: parentFolder });

          // If the parent folder doesn't exist, create it
          if (!parent) {
            parent = new Folder({
              _id: repositoryId,
              folderName: parentFolder,
              parentFolder: null,
              files: [],
              subFolders: [],
            });
            await parent.save();
          }

          // Add the file to the parent folder's files array
          parent.files.push(file._id);

          // Save the parent folder to the database
          await parent.save();
        } else {
          const folderName = entry.entryName;
          const parentFolder = path.dirname(folderName);

          // Normalize the folder names
          const normalizedFolderName = folderName.endsWith("/")
            ? folderName.slice(0, -1)
            : folderName;

          // Find the parent folder in the database
          let parent = await Folder.findOne({ folderName: parentFolder });

          // If the parent folder doesn't exist, create it
          if (!parent) {
            parent = new Folder({
              _id: repositoryId,
              // folderName: "here is parent folder",
              folderName: parentFolder,
              parentFolder: null,
              files: [],
              subFolders: [],
            });
            await parent.save();
          }

          // Check if the subfolder already exists
          let subFolder = await Folder.findOne({
            folderName: normalizedFolderName,
            parentFolder: parent._id,
          });

          if (!subFolder) {
            // Create a new folder entity
            subFolder = new Folder({
              folderName: normalizedFolderName,
              parentFolder: parent._id,
              files: [],
              subFolders: [],
            });

            // Save the subfolder to the database
            await subFolder.save();

            // Add the subfolder to the parent folder's subFolders array
            parent.subFolders.push(subFolder._id);

            // Save the parent folder to the database
            await parent.save();
          }
        }
      }

      res
        .status(200)
        .json({ message: "Files extracted, stored, and sent successfully" });
      console.log({
        message: "Files extracted, stored, and sent successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
);
// Function to check if a file has an image extension
function isImageFile(fileName) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']; // Add more extensions if needed
  const ext = path.extname(fileName).toLowerCase();
  return imageExtensions.includes(ext);
}
// Function to ensure directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}



router.get("/hierarchy", async (req, res) => {
  try {
    // Find top-level folders with parent ID null
    const topLevelFolders = await Folder.find({ parentFolder: null });

    // Function to recursively populate subfolders with files
    const populateSubfoldersWithFiles = async (folder) => {
      const populatedFolder = await Folder.findById(folder._id)
        .populate("subFolders")
        .populate("files")
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

    res.status(200).json({ contents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});


router.get("/hierarchy/:repositoryId", async (req, res) => {
  try {
    // Find top-level folders with parent ID null
    const {repositoryId} = req.params;
    // console.log("here is id", repositoryId)
    const topLevelFolders = await Folder.find({ _id: repositoryId });
    console.log(topLevelFolders)

    // Function to recursively populate subfolders with file  s
    const populateSubfoldersWithFiles = async (folder) => {
      const populatedFolder = await Folder.findById(folder._id)
        .populate("subFolders")
        .populate("files")
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
    console.log("here is content final ",  contents)
    res.status(200).json({ contents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});


// router.get("/hierarchy", async (req, res) => {
//   try {
//     const populateSubfoldersWithFiles = async (folderId) => {
//       const folder = await Folder.findById(folderId);
//       const subFolders = await Folder.find({ parentFolder: folderId });
//       const files = await File.find({ folder: folderId });

//       const subFoldersWithFiles = await Promise.all(
//         subFolders.map(async (subFolder) => {
//           const subFolderData = await populateSubfoldersWithFiles(subFolder._id);
//           return subFolderData;
//         })
//       );

//       const folderData = {
//         _id: folder._id,
//         folderName: folder.folderName,
//         parentFolder: folder.parentFolder,
//         subFolders: subFoldersWithFiles,
//         files: files,
//       };

//       if (subFoldersWithFiles.length === subFolders.length) {
//         return folderData;
//       } else {
//         return null;
//       }
//     };

//     const topLevelFolders = await Folder.find({ parentFolder: null });

//     const contents = [];
//     for (const folder of topLevelFolders) {
//       const folderData = await populateSubfoldersWithFiles(folder._id);
//       if (folderData) {
//         contents.push(folderData);
//       }
//     }

//     res.status(200).json({ contents });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "An error occurred" });
//   }
// });




router.delete("/repositories/:repositoryId/content", async (req, res) => {
  try {
    const { repositoryId } = req.params;
    console.log( repositoryId)

    // Find the folder by its ID and populate the subFolders field
    const folder = await Folder.findById(repositoryId)
      .populate('subFolders')
      .lean()
      .exec();

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Function to recursively delete subfolders and files
    const deleteFolderAndContents = async (folder) => {
      // Delete the folder's files (if any)
      if (folder.files && folder.files.length > 0) {
        await File.deleteMany({ _id: { $in: folder.files } });
      }

      // Recursively delete subfolders and their contents
      if (folder.subFolders && folder.subFolders.length > 0) {
        for (const subFolder of folder.subFolders) {
          await deleteFolderAndContents(subFolder);
        }
      }

      // Delete the folder itself
      await Folder.findByIdAndDelete(folder._id);
    };

    // Start the recursive deletion process
    await deleteFolderAndContents(folder);

    // Delete all content associated with the specified repository
    await Language.deleteMany({ repositoryId });
    await Collaborator.deleteMany({ repositoryId });
    await Commit.deleteMany({ repositoryId });
    await Contributor.deleteMany({ repositoryId });
    await CodeFrequencyModel.deleteMany({ repositoryId });

    res.status(200).send(); // Respond with a 204 No Content status upon successful deletion
    console.log("deleted succesfuly"); // Respond with a 204 No Content status upon successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





module.exports = router;
