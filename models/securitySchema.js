// models/repository.js
const mongoose = require('mongoose');


// Define the SecurityQuestion schema
const securityQuestionSchema = new mongoose.Schema({
    question1: {
      type: String,
      required: true,
    },
    answer1: {
      type: String,
      required: true,
    },
    question2: {
      type: String,
      required: true,
    },
    answer2: {
      type: String,
      required: true,
    },
    question3: {
      type: String,
      required: true,
    },
    answer3: {
      type: String,
      required: true,
    },
  });
  
  // Create the SecurityQuestion model
  const SecurityQuestion = mongoose.model(
    "SecurityQuestion",
    securityQuestionSchema
  );

  module.exports = SecurityQuestion;