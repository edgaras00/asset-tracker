const { promisify } = require("util");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  // Function that creates a JWT
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const setUpCookie = () => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  return cookieOptions;
};

exports.signup = catchAsync(async (req, res, next) => {
  // Handle new user registration

  const newUser = await User.create({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: req.body.password,
  });

  newUser.password = undefined;

  // Create JWT
  const token = signToken(newUser._id);

  // Cookie options for JWT cookie
  const cookieOptions = setUpCookie();

  // New user info that will be sent to client in response
  const user = { email: newUser.email, lastUpdated: newUser.lastUpdated };

  res.cookie("jwt", token, cookieOptions);
  res.status(201).json({
    status: "Success",
    message: "Created new user",
    token,
    data: {
      user,
    },
  });
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
  // JWT
  const token = signToken(user._id);

  const userData = { email: user.email, lastUpdated: user.lastUpdated };

  // Option for JWT cookie
  const cookieOptions = setUpCookie();

  res.cookie("jwt", token, cookieOptions);
  res.status(200).json({
    status: "Success",
    token,
    data: {
      user: userData,
    },
  });
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
