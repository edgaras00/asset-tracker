const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

// Handle asset buys
exports.userBuy = catchAsync(async (req, res, next) => {
  const stockMode = req.body.stock ? true : false;
  const assetObj = stockMode ? req.body.stock : req.body.crypto;
  const symbol = assetObj.symbol;
  const quantity = assetObj.amount;
  const cost = req.body.price * quantity;

  const user = req.user;
  const id = user._id;

  const userAssets = stockMode
    ? user.assets.stockInfo.stock
    : user.assets.cryptoInfo.crypto;

  const foundAsset = userAssets.find((asset) => asset.symbol === symbol);
  const txnField = stockMode ? "txnHistory.stock" : "txnHistory.crypto";
  const txnObject = {
    savedTimestamp: req.body.savedTimestamp,
    date: req.body.date,
    price: req.body.price,
    name: assetObj.name,
    symbol: symbol,
    amount: quantity,
    action: "Buy",
  };

  if (foundAsset) {
    const searchField = stockMode
      ? "assets.stockInfo.stock.symbol"
      : "assets.cryptoInfo.crypto.symbol";
    const updateField = stockMode
      ? "assets.stockInfo.stock.$.amount"
      : "assets.cryptoInfo.crypto.$.amount";
    const assetCostField = stockMode
      ? "assets.stockInfo.stock.$.cost"
      : "assets.cryptoInfo.crypto.$.cost";
    const assetTypeCostField = stockMode
      ? "assets.stockInfo.cost"
      : "assets.cryptoInfo.cost";

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, [searchField]: symbol },
      {
        $inc: {
          [updateField]: quantity,
          "assets.cost": cost,
          [assetCostField]: cost,
          [assetTypeCostField]: cost,
        },
        $push: { [txnField]: txnObject },
        lastUpdated: Date.now(),
      },
      { new: true }
    );
    const result = {
      message: `User ${req.user._id} data has been updated.`,
      action: `Add ${quantity} ${symbol}`,
      updatedUser,
    };
    return res.status(200).json({
      status: "Success",
      data: {
        data: result,
      },
    });
  }
  assetObj["cost"] = cost;
  const assetCostField = stockMode
    ? "assets.stockInfo.cost"
    : "assets.cryptoInfo.cost";
  const updateField = stockMode
    ? "assets.stockInfo.stock"
    : "assets.cryptoInfo.crypto";
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $push: { [updateField]: assetObj, [txnField]: txnObject },
      $inc: { "assets.cost": cost, [assetCostField]: cost },
      lastUpdated: Date.now(),
    },
    { new: true }
  );
  const result = {
    message: `User ${id} data has been updated.`,
    action: `Add ${quantity} ${symbol}`,
    updatedUser: {
      email: updatedUser.email,
      lastUpdated: updatedUser.lastUpdated,
    },
  };
  res.status(200).json({
    status: "Success",
    data: {
      data: result,
    },
  });
});

// Handle asset sales
exports.userSell = catchAsync(async (req, res, next) => {
  const stockMode = req.body.stock ? true : false;
  const assetObj = stockMode ? req.body.stock : req.body.crypto;
  const symbol = assetObj.symbol;
  const quantity = assetObj.amount;
  const cost = quantity * req.body.price;
  const sellingAll = req.body.sellingAll;
  const objectId = assetObj.objectId;

  const id = req.user._id;
  const txnField = stockMode ? "txnHistory.stock" : "txnHistory.crypto";
  const txnObject = {
    date: req.body.date,
    savedTimestamp: req.body.savedTimestamp,
    price: req.body.price,
    name: assetObj.name,
    symbol: symbol,
    amount: quantity,
    action: "Sell",
  };

  const searchField = stockMode
    ? "assets.stockInfo.stock.symbol"
    : "assets.cryptoInfo.crypto.symbol";

  const updateField = stockMode
    ? "assets.stockInfo.stock.$.amount"
    : "assets.cryptoInfo.crypto.$.amount";

  const assetCost = stockMode
    ? "assets.stockInfo.stock.$.cost"
    : "assets.cryptoInfo.crypto.$.cost";

  const assetTypeCost = stockMode
    ? "assets.stockInfo.cost"
    : "assets.cryptoInfo.cost";

  let updatedUser;
  if (sellingAll) {
    const removeArray = stockMode
      ? "assets.stockInfo.stock"
      : "assets.cryptoInfo.crypto";
    updatedUser = await User.findOneAndUpdate(
      { _id: id, [searchField]: symbol },
      {
        $pull: { [removeArray]: { _id: objectId } },
        $push: { [txnField]: txnObject },
        $inc: { [assetTypeCost]: cost * -1 },
      },
      { new: true }
    );
  } else {
    updatedUser = await User.findOneAndUpdate(
      { _id: id, [searchField]: symbol },
      {
        $inc: {
          [updateField]: quantity * -1,
          [assetCost]: -1 * cost,
          [assetTypeCost]: cost * -1,
        },
        $push: { [txnField]: txnObject },
      },
      { new: true }
    );
  }

  const result = {
    message: `User ${id} data has been updated.`,
    action: `Remove ${quantity} ${symbol}`,
    updatedUser: { email: updatedUser },
  };
  res.status(200).json({ status: "Success", data: result });
});
