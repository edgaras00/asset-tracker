const fetch = require("node-fetch");
const { DateTime } = require("luxon");

const catchAsync = require("../utils/catchAsync");
const API = process.env.NEWS_API;

// Handle news requests

// Return business news
exports.getAllNews = catchAsync(async (req, res) => {
  // API URL
  const baseUrl = "https://newsapi.org/v2/top-headlines";
  const query = `?country=us&category=business&pageSize=10&apiKey=${API}`;

  // Get data from the news API
  const result = await fetch(baseUrl + query);
  const data = await result.json();

  // Send data to client
  res.status(200).json({
    status: "Success",
    results: data.length,
    data: {
      data,
    },
  });
});

// Handle news requests for a particular asset
exports.getAssetNews = catchAsync(async (req, res) => {
  // Get asset ID from the params
  const asset = req.params.asset;

  // Today's date
  const dateObject = DateTime.now();
  const today = dateObject.toFormat("yyyy-LL-dd");

  // Oldest date to get news for
  const oldestDateObj = dateObject.minus({ days: 15 });
  const from = oldestDateObj.toFormat("yyyy-LL-dd");

  // API URL
  const baseUrl = "https://newsapi.org/v2/everything";
  const queryA = `?from=${from}&to=${today}&counry=us&q=${asset}`;
  const queryB = `&sortBy=publishedAt&language=en&pageSize=10&apiKey=${API}`;

  // Fetch asset news data from the API
  const result = await fetch(baseUrl + queryA + queryB);
  const data = await result.json();

  // Send data to client
  res.status(200).json({
    status: "Success",
    results: data.length,
    data: {
      data,
    },
  });
});
