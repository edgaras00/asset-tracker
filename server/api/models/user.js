const mongoose = require("mongoose");
const {isEmail} = require('validator');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: [true, 'Please enter your email address.'],
    unique: true,
    validate: [isEmail, 'Please enter a valid email address.']
    // match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    minLength: [6, 'Minimum password length is 6 characters.'],
    required: [true, 'Please enter your password'],
  },
  assets: {
    cost: Number,
    stockInfo: {
      cost: {type: Number, default: 0},
      stocks: [
        {
          name: String,
          symbol: String,
          amount: Number,
          cost: Number
        }
      ]
    },
    cryptoInfo: {
      cost: {type: Number, default: 0},
      crypto: [
        {
          name: String,
          symbol: String,
          cid: String,
          amount: Number,
          cost: Number
        }
      ]
    }
    // stocks: [
    //   {
    //     name: String,
    //     symbol: String,
    //     amount: Number,
    //     cost: Number
    //   },
    // ],
    // crypto: [
    //   {
    //     name: String,
    //     symbol: String,
    //     amount: Number,
    //     cost: Number
    //   },
    // ],
  },
  txnHistory: {
    stocks: [
      {
        date: Date,
        name: String,
        symbol: String,
        amount: Number,
        price: Number,
        action: String
      },
    ],
    crypto: [
      {
        date: Date,
        name:String,
        symbol: String,
        amount: Number,
        price: Number,
        action: String
      }
    ]
  },
});

module.exports = mongoose.model("User", userSchema);
