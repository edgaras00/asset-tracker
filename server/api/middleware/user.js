const User = require("../models/user");

const buyAsset = async (req, res, next) => {
  try {
    const stockMode = req.body.stock ? true : false;
    const assetObj = stockMode ? req.body.stock : req.body.crypto;
    const symbol = assetObj.symbol;
    const quantity = assetObj.amount;
    const cost = req.body.price * quantity;
    const id = req.params.id;

    const user = await User.findById(id);
    const userAssets = stockMode
      ? user.assets.stockInfo.stocks
      : user.assets.cryptoInfo.crypto;
    const foundAsset = userAssets.find((asset) => asset.symbol === symbol);
    const txnField = stockMode ? "txnHistory.stocks" : "txnHistory.crypto";
    const txnObject = {
      date: req.body.date,
      price: req.body.price,
      name: assetObj.name,
      symbol: symbol,
      amount: quantity,
      action: "Buy",
    };

    if (foundAsset) {
      const searchField = stockMode
        ? "assets.stockInfo.stocks.symbol"
        : "assets.cryptoInfo.crypto.symbol";
      const updateField = stockMode
        ? "assets.stockInfo.stocks.$.amount"
        : "assets.cryptoInfo.crypto.$.amount";
      const assetCostField = stockMode
        ? "assets.stockInfo.stocks.$.cost"
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
        },
        { new: true }
      );
      req.body.result = {
        message: `User ${id} data has been updated.`,
        action: `Add ${quantity} ${symbol}`,
        updatedUser,
      };
      return next();
    }

    assetObj["cost"] = cost;
    const assetCostField = stockMode
      ? "assets.stockInfo.cost"
      : "assets.cryptoInfo.cost";
    const updateField = stockMode
      ? "assets.stockInfo.stocks"
      : "assets.cryptoInfo.crypto";
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: { [updateField]: assetObj, [txnField]: txnObject },
        $inc: { "assets.cost": cost, [assetCostField]: cost },
      },
      { new: true }
    );
    req.body.result = {
      message: `User ${id} data has been updated.`,
      action: `Add ${quantity} ${symbol}`,
      updatedUser,
    };
    return next();
  } catch (error) {
    console.log(error);
  }
};

const sellAsset = async (req, res, next) => {
  try {
    const stockMode = req.body.stock ? true : false;
    const assetObj = stockMode ? req.body.stock : req.body.crypto;
    const symbol = assetObj.symbol;
    const quantity = assetObj.amount;
    const cost = quantity * req.body.price;
    const sellingAll = req.body.sellingAll;
    const objectId = assetObj.objectId;
    const id = req.params.id;

    const txnField = stockMode ? "txnHistory.stocks" : "txnHistory.crypto";
    const txnObject = {
      date: req.body.date,
      price: req.body.price,
      name: assetObj.name,
      symbol: symbol,
      amount: quantity,
      action: "Sell",
    };

    // const user = await User.findById(id);
    const searchField = stockMode
      ? "assets.stockInfo.stocks.symbol"
      : "assets.cryptoInfo.crypto.symbol";

    const updateField = stockMode
      ? "assets.stockInfo.stocks.$.amount"
      : "assets.cryptoInfo.crypto.$.amount";

    const assetCost = stockMode
      ? "assets.stockInfo.stocks.$.cost"
      : "assets.cryptoInfo.crypto.$.cost";

    const assetTypeCost = stockMode
      ? "assets.stockInfo.cost"
      : "assets.cryptoInfo.cost";

    let updatedUser;
    if (sellingAll) {
      const removeArray = stockMode
        ? "assets.stockInfo.stocks"
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
    
    // updatedUser = await User.findByIdAndUpdate(
    //   {_id: req.params.id},
    //   { $inc: {[assetTypeCost]: cost * -1}},
    //   {new: true}
    // );

    req.body.result = {
      message: `User ${id} data has been updated.`,
      action: `Remove ${quantity} ${symbol}`,
      updatedUser,
    };

    return next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = { buyAsset, sellAsset };
