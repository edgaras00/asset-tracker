const fetch = require('node-fetch');
const { DateTime } = require("luxon");
const CryptoSymbols = require("../models/cryptoSymbols");
const { modifyCryptoOverViewData } = require("../utils/cryptoUtils");
const { getMultipleLogos } = require("../utils/cryptoUtils");

// Handle crypto search requests 
exports.crypto_search = async (req, res) => {
  try {
    // Search database for cryptocurrency information
    const query = req.query.query;
    const results = await CryptoSymbols.find({ $text: { $search: query } });

    // Isolate the result that exactly matches the query
    const exactMatch = results.find((crypto) => {
      const name = crypto.name.toLowerCase();
      const symbol = crypto.symbol.toLowerCase();
      if ((name === query || symbol === query) && !name.includes("peg")) {
        return crypto;
      }
    });

    // Other results that are similar to the query
    const otherMatches = results.filter((crypto) => {
      const name = crypto.name.toLowerCase();
      const symbol = crypto.symbol.toLowerCase();
      // Boolean to check if a result is a partial match to the query
      const bool =
        name !== query &&
        symbol !== query &&
        (name.includes(query) || symbol.includes(query)) &&
        !crypto.cid.includes("-short-") &&
        !crypto.cid.includes("-long-") &&
        !crypto.cid.includes("-set") &&
        !crypto.cid.includes("-index") &&
        !crypto.cid.includes("yd-btc") &&
        !crypto.cid.includes("_set") &&
        !crypto.cid.includes("yd-eth");

      if (bool) {
        return crypto;
      }
    });
    // Combine query results 
    let combinedResults = exactMatch
      ? [exactMatch, ...otherMatches]
      : [...otherMatches];

    // Limit number of coins to Avoid too many requests 
    if (combinedResults.length > 10) {
      combinedResults = combinedResults.slice(0,20);
    }
    // Get CoinGecko ids
    const cIdArray = combinedResults.map((result) => result.cid);

    // Get crypto logos using CoinGecko ids
    const logos = await getMultipleLogos(cIdArray);
    const finalResults = combinedResults.map((item) => {
      return { ...item._doc, logo: logos[item.cid] };
    });
    res.status(200).json({ results: finalResults });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle price requests for a batch of coins
exports.crypto_batch = async (req, res) => {
  try {
    // Query format: coin:amount:cost
    // Multiple coins are separated by commas
    const coinHoldings = req.query.coins;
    // Split the query string to get an array of coins
    const coinArr = coinHoldings.split(",");
    // Get coin ids
    const cIdsArr = coinArr.map((coin) => coin.split(":")[0]);
    // Join ids into one string using a different separator
    const cIds = cIdsArr.join("%2C");

    // Object containing amount and info data for crypto
    // Key: cId
    // Value: Object containing cost and amount data
    const mapped = {};
    coinArr.forEach((coin) => {
      const splitted = coin.split(":");
      const symbol = splitted[0];
      const amount = splitted[1];
      const cost = splitted[2];
      mapped[symbol] = { amount, cost };
    });
    // Fetch price data
    const baseUrl = "https://api.coingecko.com/api/v3/simple/price?";
    const query = `ids=${cIds}&vs_currencies=usd&include_24hr_change=true`;
    console.log(baseUrl + query);
    const result = await fetch(baseUrl + query);
    const data = await result.json();

    // Search db for ticker data
    // Symbol and API ids
    const tickerData = await CryptoSymbols.find(
      {
        cid: { $in: cIdsArr },
      },
      { symbol: 1, cmcId: 1, cid: 1 } // What fields to return
    );

    // Object containing symbol and coin id data
    // Key: CoinGecko id
    // Value: Object containing CMC id and symbol data
    const mappedTicker = {};
    tickerData.forEach((coin) => {
      const symbol = coin.symbol;
      const cmcId = coin.cmcId ? coin.cmcId : "";
      mappedTicker[coin.cid] = { symbol, cmcId };
    });

    // Fetch crypto logos
    const logos = await getMultipleLogos(cIdsArr);

    // Array containing coin objects with data
    const assets = Object.keys(data).map((coin) => {
      // Calculate current value (amount * current price)
      const value = mapped[coin].amount * data[coin].usd;
      const cost = mapped[coin].cost;
      // Calculate return on investment for the crypto asset
      const roi = (((value - cost) / cost) * 100).toFixed(2);
      const ticker = mappedTicker[coin].symbol.toUpperCase();
      const cmcId = mappedTicker[coin].cmcId;
      const logo = logos[coin];
      console.log(logo);
      return {
        symbol: ticker,
        cid: coin,
        amount: mapped[coin].amount,
        price: data[coin].usd,
        value: value,
        cost: cost,
        dayChange: data[coin].usd_24h_change.toFixed(2),
        roi: roi,
        // logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmcId}.png`,
        logo: logo,
      };
    });
    res.status(200).json({ assets: assets });
  } catch (error) {
    console.log(error);
  }
};

// Handle current price requests
exports.crypto_current = async (req, res) => {
  try {
    // Coingecko crypto id
    const cryptoId = req.params.cId;
    // Price data time interval
    const changeInterval = req.query.interval;

    // URL
    const baseUrl = "https://api.coingecko.com/api/v3/simple/price?";
    const query = `ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`;
    // Fetch current price data
    const result = await fetch(baseUrl + query);
    const data = await result.json();
    // Return daily data if interval is not provided in the query string
    if (!changeInterval || changeInterval === "day") {
      return res.status(200).json({ assetValue: data });
    }
    // Get historical market data
    // Get current date's object
    const currentDate = DateTime.now();
    const currentPrice = data[cryptoId].usd;
    let lastDate;
    // Get date based on provided time interval
    if (changeInterval === "week") {
      lastDate = currentDate.minus({ days: 7 }).toFormat("dd-MM-yyyy");
    } else if (changeInterval === "month") {
      lastDate = currentDate.minus({ days: 30 }).toFormat("dd-MM-yyyy");
    } else if (changeInterval === "year") {
      lastDate = currentDate.minus({ days: 365 }).toFormat("dd-MM-yyyy");
    }
    // Get coin's price at that interval
    const historyBaseUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}`;
    const historyApi = `/history?date=${lastDate}&localization=false`;
    const historyResponse = await fetch(historyBaseUrl + historyApi);
    const historyData = await historyResponse.json();
    const lastPrice = historyData.market_data.current_price.usd;
    // Calculate price percent change for provided time interval
    const percentChange = ((currentPrice - lastPrice) / lastPrice) * 100;
    res.status(200).json({ assetValue: { ...data, percentChange } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle cryptocurrency price requests for various time intervals
// Daily, weekly, monthly, yearly prices
// Used for plotting
exports.crypto_prices = async (req, res) => {
  try {
    // Code block to build the API query for price data
    // Coingecko crypto ID
    const cryptoId = req.params.cId;
    // Query parameter for time interval
    const interval = req.query.interval;
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
    // Modify data
    const modifiedData = data.prices.map((point) => {
      const dateObject = DateTime.fromMillis(point[0]);
      let displayDate, date;

      // Format the way date is displayed for each interval
      if (interval === "day") {
        date = dateObject.toFormat("yyyy-MM-dd HH:mm");
        displayDate = dateObject.toFormat("HH:mm");
      } else if (interval === "week" || interval === "month") {
        displayDate = dateObject.toFormat("d-MMM");
        date = dateObject.toFormat("yyyy-MM-dd");
      } else {
        displayDate = dateObject.toFormat("MMM-yy");
        date = dateObject.toFormat("yyyy-MM-dd");
      }
      const value = point[1];
      return { date, value, displayDate };
    });
    res.status(200).json({ assetValue: modifiedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle crypto data requests
// Metadata, market data, social media
exports.crypto_data = async (req, res) => {
  try {
    // Coingecko crypto id
    const cryptoId = req.params.cId;
    // URL
    const baseUrl = "https://api.coingecko.com/api/v3/coins/";
    const endpoint = `${cryptoId}?localization=false`;
    // Fetch data
    const result = await fetch(baseUrl + endpoint);
    const data = await result.json();
    const modifiedData = modifyCryptoOverViewData(data);
    res.status(200).json({ cryptoData: modifiedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
