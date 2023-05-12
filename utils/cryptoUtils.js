const fetch = require("node-fetch");
const { DateTime } = require("luxon");
const catchAsync = require("../utils/catchAsync");

const getLogo = catchAsync(async (cID) => {
  // Function to get crypto logo data (single coin)

  // Build query
  const baseUrl = `https://api.coingecko.com/api/v3/coins/${cID}`;
  const query1 = "localization=false&tickers=false&market_data=false";
  const query2 = "community_data=false&developer_data=false&sparkline=false";
  const response = await fetch(`${baseUrl}?${query1}&${query2}`);

  const data = await response.json();

  if (response.status === 200 && data.image) {
    return { [cID]: data.image.large };
  }
  return { [cID]: "NA" };
});

exports.getMultipleLogos = catchAsync(async (coins) => {
  // Function that gets logo data for multiple cryptocurrencies

  let promises = [];
  for (const coin of coins) {
    promises.push(getLogo(coin));
  }

  // Wait until all promises are resolved
  const data = await Promise.all(promises);

  const logoObject = {};
  data.forEach((crypto) => {
    const key = Object.keys(crypto);
    logoObject[key] = crypto[key];
  });

  return logoObject;
});

exports.getMultiplePrices = catchAsync(async (cryptoIDArray) => {
  const cIDString = cryptoIDArray.join("%2C");
  // CoinGecko API
  const baseUrl = "https://api.coingecko.com/api/v3/simple/price?";
  const query = `ids=${cIDString}&vs_currencies=usd&include_24hr_change=true`;

  // Fetch price data
  const result = await fetch(baseUrl + query);
  const priceData = await result.json();
  return priceData;
});

exports.formatCryptoPriceData = (priceData, interval) => {
  // Format market price data for plotting
  const modifiedData = priceData.prices.map((point) => {
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
    const price = point[1];
    return { date, price, displayDate };
  });
  return modifiedData;
};

exports.getPercentChangeOnInterval = async (
  cryptoId,
  currentPrice,
  changeInterval
) => {
  // Get historical market data
  // Get current date's object
  const currentDate = DateTime.now();
  // const currentPrice = data[cryptoId].usd;
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
  return percentChange;
};

exports.findOtherCryptoMatches = (searchResults, query) => {
  /* 
    Function that filters crypto search result array
    and gets similar/secondary matches for the crypto query.
    It removes redundant results (-short-, -long-, etc...)
  */
  const otherMatches = searchResults.filter((crypto) => {
    const name = crypto.name.toLowerCase();
    const symbol = crypto.symbol.toLowerCase();
    // Boolean to check if a result is a partial match to the query
    const bool =
      name !== query &&
      symbol !== query &&
      (name.includes(query) || symbol.includes(query)) &&
      !crypto.id.includes("-short-") &&
      !crypto.id.includes("-long-") &&
      !crypto.id.includes("-set") &&
      !crypto.id.includes("-index") &&
      !crypto.id.includes("yd-btc") &&
      !crypto.id.includes("_set") &&
      !crypto.id.includes("yd-eth");

    if (bool) {
      return crypto;
    }
  });
  return otherMatches;
};

exports.findExactCryptoMatch = (searchResults, query) => {
  // Function that isolates the exact match from the crypto search results

  const exactMatch = searchResults.find((crypto) => {
    const name = crypto.name.toLowerCase();
    const symbol = crypto.symbol.toLowerCase();
    // Exclude "pegged" coins
    if ((name === query || symbol === query) && !name.includes("peg")) {
      return crypto;
    }
  });
  return exactMatch;
};

exports.modifyCryptoOverViewData = (data) => {
  /* 
     Function that extracts the relevant information from the 
     returned crypto overview object.
  */

  let exchangeData = [];
  if (data.tickers) {
    exchangeData = data.tickers.map((exchange) => {
      return {
        base: exchange.base,
        target: exchange.target,
        name: exchange.market.name,
        lastPrice: exchange.last,
        volume: exchange.converted_volume.usd,
        url: exchange.trade_url,
      };
    });
  }

  const modifiedData = {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    categories: data.categories,
    description: data.description.en,
    links: data.links,
    image: data.image.large,
    marketRank: data.market_cap_rank,
    currentPrice: data.market_data.current_price.usd,
    ath: data.market_data.ath.usd,
    athChange: data.market_data.ath_change_percentage.usd,
    marketcap: data.market_data.market_cap.usd,
    fdv: data.market_data.fully_diluted_valuation.usd,
    totalVolume: data.market_data.total_volume.usd,
    high24h: data.market_data.high_24h.usd,
    low24h: data.market_data.low_24h.usd,
    deltaPrice24h: data.market_data.price_change_24h_in_currency.usd,
    deltaPercent24h: data.market_data.price_change_percentage_24h,
    delta_percent7d: data.market_data.price_change_percentage_7d,
    delta_percent14d: data.market_data.price_change_percentage_14d,
    delta_percent30d: data.market_data.price_change_percentage_30d,
    delta_percent60d: data.market_data.price_change_percentage_60d,
    delta_percent200d: data.market_data.price_change_percentage_200d,
    delta_percent1y: data.market_data.price_change_percentage_1y,
    delta_marketcap24h: data.market_data.market_cap_change_24h,
    deltaMcPercent24h: data.market_data.market_cap_change_percentage_24h,
    totalSupply: data.market_data.total_supply,
    maxSupply: data.market_data.max_supply,
    circulatingSupply: data.market_data.circulating_supply,
    exchangeData: exchangeData,
  };
  return modifiedData;
};
