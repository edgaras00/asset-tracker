const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: [true, "Please enter your email address."],
    unique: true,
    validate: [isEmail, "Please enter a valid email address."],
  },
  password: {
    type: String,
    minLength: [6, "Minimum password length is 6 characters."],
    required: [true, "Please enter your password"],
    select: false,
  },
  assets: {
    cost: Number,
    stockInfo: {
      cost: { type: Number, default: 0 },
      stocks: [
        {
          name: String,
          symbol: String,
          amount: Number,
          cost: Number,
        },
      ],
    },
    cryptoInfo: {
      cost: { type: Number, default: 0 },
      crypto: [
        {
          name: String,
          symbol: String,
          cid: String,
          amount: Number,
          cost: Number,
        },
      ],
    },
    amount: Number,
  },
  txnHistory: {
    stocks: [
      {
        savedTimestamp: Number,
        date: Date,
        name: String,
        symbol: String,
        amount: Number,
        price: Number,
        action: String,
      },
    ],
    crypto: [
      {
        savedTimestamp: Number,
        date: Date,
        name: String,
        symbol: String,
        amount: Number,
        price: Number,
        action: String,
      },
    ],
  },
  lastUpdated: {
    type: Number,
    default: 0,
  },
});

// Mongoose document pre-hook middleware to hash new user passwords
// Runs before the creation of new user
userSchema.pre("save", async function (next) {
  // Only run function if password was modified
  // if (!this.isModified("password")) return next();

  // Hash password
  const salt = await bcrypt.genSalt(10);
  // "this" points to currently processed document
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
