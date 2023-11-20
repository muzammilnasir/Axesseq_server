// const User = require("../models/userSchema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const shortid = require("shortid");

// const generateJwtToken = (_id, role) => {
//   return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });
// };

// exports.signup = (req, res) => {
//   User.findOne({ email: req.body.email }).exec(async (error, user) => {
//     if (user)
//       return res.status(400).json({
//         error: "User already registered",
//       });

//     const { firstName, lastName, email, password } = req.body;
//     const hash_password = await bcrypt.hash(password, 10);
//     const _user = new User({
//       firstName,
//       lastName,
//       email,
//       hash_password,
//       username: shortid.generate(),
//     });

//     _user.save((error, user) => {
//       if (error) {
//         return res.status(400).json({
//           message: "Something went wrong",
//         });
//       }

//       if (user) {
//         const token = generateJwtToken(user._id, user.role);
//         const { _id, firstName, lastName, email, role, fullName } = user;
//         return res.status(201).json({
//           token,
//           user: { _id, firstName, lastName, email, role, fullName },
//         });
//       }
//     });
//   });
// };

// exports.signin = (req, res) => {
//   User.findOne({ email: req.body.email }).exec(async (error, user) => {
//     if (error) return res.status(400).json({ error });
//     if (user) {
//       const isPassword = await user.authenticate(req.body.password);
//       if (isPassword && user.role === "user") {
//         // const token = jwt.sign(
//         //   { _id: user._id, role: user.role },
//         //   process.env.JWT_SECRET,
//         //   { expiresIn: "1d" }
//         // );
//         const token = generateJwtToken(user._id, user.role);
//         const { _id, firstName, lastName, email, role, fullName } = user;
//         res.status(200).json({
//           token,
//           user: { _id, firstName, lastName, email, role, fullName },
//         });
//       } else {
//         return res.status(400).json({
//           message: "Something went wrong",
//         });
//       }
//     } else {
//       return res.status(400).json({ message: "Something went wrong" });
//     }
//   });
// };

const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = async (req, res) => {
  console.log(req.body)
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(existingUser)
    if (existingUser) {
      return res.status(406).json({
        error: "User already registered",
      });
    }

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username: shortid.generate(),
    });

    const user = await _user.save();
    if (user) {
      const token = generateJwtToken(user._id, user.role);
      const { _id, firstName, lastName, email, role, fullName } = user;
      return res.status(201).json({
        token,
        user: { _id, firstName, lastName, email, role, fullName },
      });
    }
  } catch (error) {
     
    console.log(error)
    res.status(450).json({
      message: "Something went wrong",
    });
    // return res.status(400).json({
    //   message: "Something went wrong",
    // });
  }
};

exports.signin = async (req, res) => {
  console.log(req.body)
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(450).json({ message: "User not found" });
    }

    const isPasswordValid = await user.authenticate(req.body.password);
    if (isPasswordValid && user.role === "user") {
      const token = generateJwtToken(user._id, user.role);
      const { _id, firstName, lastName, email, role, fullName } = user;
      return res.status(200).json({
        token,
        user: { _id, firstName, lastName, email, role, fullName },
      });
    } else {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error)
     res.status(400).json({
      message: "Something went wrong",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    console.log(newPassword)
    const user = await User.findOne({ });
    console.log("here is user", user)

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hash_password = await bcrypt.hash(newPassword, 10);
    user.hash_password = hash_password;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};