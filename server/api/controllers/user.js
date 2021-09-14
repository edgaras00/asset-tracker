const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const handleErrors = (error) => {
  console.log(error.message);

  const err = {};

  // Duplicate user email
  if (error.code === 11000) {
    err.email = "User with this email already exists.";
    return err;
  }

  // User email sign up validation
  if (error.message.includes("User validation failed")) {
    Object.values(error.errors).forEach(({ properties }) => {
      err[properties.path] = properties.message;
    });
  }

  // Password sign up validation
  if (error.message.includes("data and salt arguments required")) {
    err["passwordError"] = "Please enter a valid password.";
  }

  // User authorization
  if (error.message === "Wrong email and / or password.") {
    err["authorizationError"] = error.message;
  }
  console.log(err);
  return err;
};

// const MAX_AGE = 60 * 120;
// const createToken = (id) => {
//   return jwt.sign({ id }, process.env.TOKEN_SECRET, {
//     expiresIn: MAX_AGE,
//   });
// };

exports.user_signup = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await User.create({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id);
    // res.cookie("jwt", token, { httpOnly: true, maxAge: MAX_AGE * 1000 });
    res.status(201).json({
      message: "Created new user.",
      user: newUser,
      // token: token,
    });
  } catch (error) {
    // console.log(error);
    const errors = handleErrors(error);
    res.status(500).json({ errors });
  }
};

exports.user_login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw Error("Wrong email and / or password.");
      // return res.status(400).json({ message: "Wrong email or password." });
    }

    const authorized = await bcrypt.compare(req.body.password, user.password);
    if (!authorized) {
      throw Error("Wrong email and / or password.");
      // return res.status(400).json({message: "Wrong email or password."})
    }

    // const token = createToken(user._id);
    // res.cookie("jwt", token, { httpOnly: true, maxAge: MAX_AGE * 1000 });

    res.status(200).json({
      message: "Successful login",
      user,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

exports.user_logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ message: "User was successfully logged out." });
};

exports.user_update = async (req, res) => {
  if (req.body._id === req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        console.log(error);
        res.status(500).json({ err });
      }
    }
    const result = req.body.result;
    res.status(200).json({ result });
  }
};

exports.user_sell = (req, res) => {
  const result = req.body.result;
  res.status(200).json({ result });
};