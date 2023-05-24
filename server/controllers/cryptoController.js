const fetch = require("node-fetch");

// Models
const CryptoSymbols = require("../models/cryptoSymbolsModel");

const catchAsync = require("../utils/catchAsync");
const cryptoUtils = require("../utils/cryptoUtils");
const AppError = require("../utils/appError");
const getTxnHistory = require("../utils/getTxnHistory");

// Handle crypto search requests
exports.searchCrypto = catchAsync(async (req, res, next) => {
  // Search database for cryptocurrency information
  const query = req.query.query;

  const results = await CryptoSymbols.find({ $text: { $search: query } });
  // Isolate the result that exactly matches the query
  const exactMatch = cryptoUtils.findExactCryptoMatch(results, query);

  // Other (secondary) results that are similar to the query
  const otherMatches = cryptoUtils.findOtherCryptoMatches(results, query);

  // Combine query results
  let combinedResults = exactMatch
    ? [exactMatch, ...otherMatches]
    : [...otherMatches];

  // Limit number of coins to avoid too many requests
  if (combinedResults.length > 10) {
    combinedResults = combinedResults.slice(0, 3);
  }

  // // Get CoinGecko IDs
  const cIdArray = combinedResults.map((result) => result.id);

  // Get crypto logos using Coin`Gecko IDs
  const logos = await cryptoUtils.getMultipleLogos(cIdArray);

  let finalResults = [];
  combinedResults.forEach((item) => {
    if (!(logos[item.id] === "NA")) {
      finalResults.push({ ...item._doc, logo: logos[item.id] });
    }
  });

  // Send data to client
  res.status(200).json({
    status: "Success",
    results: finalResults.length,
    data: finalResults,
  });
});

// Handle price requests for a batch of coins
exports.getPortfolio = catchAsync(async (req, res, next) => {
  const crypto = req.user.assets.cryptoInfo.crypto;

  // Send empty array if user has no crypto assets
  if (crypto.length === 0) {
    const assets = [];
    return res.status(200).json({
      status: "Success",
      data: {
        assets,
      },
    });
  }

  // Join crypto IDs into a string
  const cryptoIDArray = crypto.map((coin) => coin.cid);
  // Get prices
  const priceData = await cryptoUtils.getMultiplePrices(cryptoIDArray);
  // Get logo data
  const cryptoLogos = await cryptoUtils.getMultipleLogos(cryptoIDArray);

  // Create asset object array
  // Each object holds info about a single asset
  const cryptoAssets = crypto.map((coin) => {
    const { amount, cost, cid, symbol } = coin;
    const price = priceData[cid].usd;
    const value = parseFloat((amount * priceData[cid].usd).toFixed(2));
    const roi = parseFloat((((value - cost) / cost) * 100).toFixed(2));
    const logo = cryptoLogos[cid];
    return {
      symbol,
      cid,
      amount,
      cost,
      returnOnInvestment: roi,
      price,
      dayPercentChange: priceData[cid].usd_24h_change.toFixed(2),
      logo,
      value,
    };
  });

  // Calculate total crypto asset value
  const totalValue = cryptoAssets.reduce((prevCoin, currentCoin) => ({
    value: prevCoin.value + currentCoin.value,
  }));
  // Total crypto asset cost (invested money)
  const totalCost = req.user.assets.cryptoInfo.cost;

  // Total return on investment
  const totalROI = ((totalValue.value - totalCost) / totalCost) * 100;

  res.status(200).json({
    status: "Success",
    results: cryptoAssets.length,
    data: {
      assets: cryptoAssets,
      totalROI,
      totalCost,
      totalValue: totalValue.value,
    },
  });
});

// Handle current price requests
exports.getCurrentPrice = catchAsync(async (req, res, next) => {
  // Valid query inputs
  const intervals = ["day", "week", "month", "year"];

  // Coingecko crypto id
  const cryptoId = req.params.cId;
  // Price data time interval
  const changeInterval = intervals.includes(req.query.interval)
    ? req.query.interval
    : "day";

  // URL
  const baseUrl = "https://api.coingecko.com/api/v3/simple/price?";
  const query = `ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`;

  // Fetch current price data
  const result = await fetch(baseUrl + query);
  const data = await result.json();

  // throw error if nothing was found
  if (Object.keys(data).length === 0) {
    return next(new AppError("Coin price data not found", 404));
  }

  // Return daily data if interval is not provided in the query string
  if (!changeInterval || changeInterval === "day") {
    return res.status(200).json({ status: "Success", data: data });
  }

  // Calculate price percent change for provided time interval
  const percentChange = await cryptoUtils.getPercentChangeOnInterval(
    cryptoId,
    data[cryptoId].usd,
    changeInterval
  );
  res.status(200).json({
    status: "Success",
    data: { ...data, percentChange },
  });
});

// Handle cryptocurrency price requests for various time intervals
// Daily, weekly, monthly, yearly prices
// Used for plotting
exports.getPricesOnInterval = catchAsync(async (req, res, next) => {
  // Valid query inputs
  const validIntervals = ["day", "week", "month", "year"];

  // Code block to build the API query for price data
  const cryptoId = req.params.cId;

  // Query parameter for time interval
  const interval = validIntervals.includes(req.query.interval)
    ? req.query.interval
    : "day";

  const baseUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/`;

  // Endpoint based on the interval query parameter
  let endpoint = "";
  if (interval === "day") {
    endpoint = "market_chart?vs_currency=usd&days=1&interval=hourly";
  } else if (interval === "week") {
    endpoint = "market_chart?vs_currency=usd&days=7&interval=daily";
  } else if (interval === "month") {
    endpoint = "market_chart?vs_currency=usd&days=30&interval=daily";
  } else if (interval === "year") {
    endpoint = "market_chart?vs_currency=usd&days=365&interval=monthly";
  } else {
    // Return hourly if anything else fails in case of bugs/typos
    endpoint = "market_chart?vs_currency=usd&days=1&interval=hourly";
  }

  // Fetch price data
  const result = await fetch(baseUrl + endpoint);
  const data = await result.json();

  if ("error" in data) {
    return next(new AppError("Could not find coin with the given ID", 404));
  }

  // Format data
  const modifiedData = cryptoUtils.formatCryptoPriceData(data, interval);
  res.status(200).json({ status: "Success", data: modifiedData });
});

// Handle crypto data requests
// Metadata, market data, social media
exports.getMetadata = catchAsync(async (req, res, next) => {
  // Coingecko crypto id
  const cryptoId = req.params.cId;
  // URL
  const baseUrl = "https://api.coingecko.com/api/v3/coins/";
  const endpoint = `${cryptoId}?localization=false`;
  // Fetch data
  const result = await fetch(baseUrl + endpoint);
  const data = await result.json();

  if ("error" in data) {
    return next(new AppError("Could not find coin with the given id", 404));
  }

  const modifiedData = cryptoUtils.modifyCryptoOverViewData(data);
  res.status(200).json({ status: "Success", data: modifiedData });
});

// Get user's cryptocurrency transaction history data
exports.getTransactionHistory = getTxnHistory("crypto");
