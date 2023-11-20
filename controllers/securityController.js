const SecurityQuestion = require("../models/securitySchema");

// app.post("/api/security-questions/submit", async (req, res) => {
const securityForm = async (req, res) => {
  try {
    // Extract data from the request body
    const { question1, answer1, question2, answer2, question3, answer3 } =
      req.body;

    // Delete all existing security questions and answers
    await SecurityQuestion.deleteMany({});

    // Create a new SecurityQuestion document
    const securityQuestion = new SecurityQuestion({
      question1,
      answer1,
      question2,
      answer2,
      question3,
      answer3,
    });

    // Save the new document to the database
    await securityQuestion.save();

    // Respond with a success message
    res
      .status(200)
      .json({ message: "Security questions and answers stored successfully." });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error storing security questions and answers:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

// app.get("/security-question", async (req, res) => {
const getSecurityQuestions = async (req, res) => {
    try {
      const securityQuestion = await SecurityQuestion.find();
      res.status(200).json({securityQuestion});
    } catch (error) {
      console.error("Error fetching security questions:", error);
      res
        .status(500)
        .json({ message: "Internal server error. Please try again later." });
    }
  };
  

module.exports = {
  securityForm,
  getSecurityQuestions,
};
