const { promisify } = require("util");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Models
const User = require("../models/userModel");

// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
  // Function that creates a JWT
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createAndSendToken = (user, statusCode, res) => {
  // Function that creates a token and sends it to client as a cookie

  const token = signToken(user.id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  // Make it secure only in production
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // Send JWT as a cookie
  res.cookie("jwt", token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Handle new user registration

  const newUser = await User.create({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: req.body.password,
  });

  // Hide password
  newUser.password = undefined;

  // New user info that will be sent to client in response
  const user = {
    email: newUser.email,
    lastUpdated: newUser.lastUpdated,
    id: newUser._id,
  };
  createAndSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Handle user login
  const { email, password } = req.body;

  // Check for missing email / password
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Get user
  const user = await User.findOne({ email }).select("+password");

  // Throw error if user does not exist or password is incorrect
  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Email or password is incorrect", 401));
  }

  user.password = undefined;

  const userData = {
    email: user.email,
    lastUpdated: user.lastUpdated,
    id: user._id,
  };

  createAndSendToken(userData, 200, res);
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  // Check for token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);

  if (!token) {
    return next(new AppError("Please log in to gain access", 401));
  }

  // Verify token
  const decodedData = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user with this token still exists
  const user = await User.findById(decodedData.id);

  if (!user) {
    return next(
      new AppError("User who the token belongs to does not exist", 404)
    );
  }
  req.user = user;
  next();
});

exports.logout = catchAsync(async (req, res, next) => {
  // Log out user
  // "Delete" JWT cookie
  res.cookie("jwt", "", { maxAge: 1 });
  res
    .status(200)
    .json({ status: "Success", message: "User logged out successfully" });
});
