// Utility functions
const fetch = require("node-fetch");
const { DateTime } = require("luxon");

const removeSameDayDataPoint = (values) => {
  /* 
      Function to remove a data point if it has
      a duplicate date in the weekly crypto chart
      data.
      Sometimes the API returns two data points
      for the current day data point. One for the
      current price and one for price at some earlier
      time. This function removes the earlier point
      and only leaves the latest data point.

      Parameters:
        values:
          Array containing weekly crypto price data
          objects. 
      Returns:
        values:
          Array containing weekly crypto price data
          objects with duplicate date data point object
          removed (if it is present)
   */
  const last = values[values.length - 1];
  const secondToLast = values[values.length - 2];
  // Check if the last two points have the same date
  if (last.date === secondToLast.date) {
    // Remove the first duplicate date point
    values = [...values.splice(0, values.length - 2), last];
  }
  return values;
};

const fetchCryptoData = async (coin, period, holdings) => {
  /* 
          Async function to fetch data from the Coingecko API.
          Parameters:
            coin: 
              Coingecko crypto ID
            days: 
              Time interval in days for the price
          Returns:
            calculatedValues:
              Object with calculated crypto values based on portfolio
              holdings and date.
        */
  try {
    // API URL
    // Determine time interval for price data
    // let interval = "hourly";
    // let days = "7"
    // if (period === "week" || period === "month") {
    //   interval = "daily";
    // } else if (period === "year") {
    //   interval = "monthly";
    // }
    let interval, days;
    switch(period) {
      case "day":
        interval = "hourly";
        days = "1";
        break;
      case "week":
        interval = "daily";
        days = "7";
        break;
      case "month":
        interval = "daily";
        days = "30";
        break;
      case "year":
        interval = "weekly";
        days = "365";
        break;
      default:
        interval = "hourly";
        days = "1";
    }
    // Build URL
    const baseUrl = "https://api.coingecko.com/";
    const api = `api/v3/coins/${coin}/market_chart`;
    const query = `?vs_currency=usd&days=${days}&interval=${interval}`;
    console.log(baseUrl + api + query);
    // Fetch crypto price data
    const result = await fetch(baseUrl + api + query);
    const data = await result.json();
    let calculatedValues = data.prices.map((point, index) => {
      // Date is returned as Unix time
      let unixDt = point[0];
      const lastIndex = data.prices.length - 1;
      // Round down to the nearest hour for intraday-chart
      // For every point but the current hour one
      if (index < data.prices.length - 1 && days === "1") {
        unixDt = point[0] - (point[0] % 3600000);
      } else if (index === lastIndex) {
        unixDt = DateTime.now().toMillis();
      }
      // Convert Unix time to human readable date
      const dateObject = DateTime.fromMillis(unixDt);
      const dateFormat = days === "1" ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd";
      const date = dateObject.toFormat(dateFormat);
      return { date, value: (point[1] * holdings[coin]).toFixed(2) };
    });

    // Remove duplicate date from today's data
    // API might return 2 data points for current day data
    // One for current price and another from some earlier time in the day
    // Keep only the current price and remove the earlier one
    if (days === "7") {
      calculatedValues = removeSameDayDataPoint(calculatedValues);
    }

    return { values: calculatedValues };
  } catch (error) {
    console.log(error);
  }
};

const combineCryptoFetches = async (coins, period, holdings) => {
  /* 
      Async function that creates an array of promises of 
      individual crypto price data fetches and returns resolved
      promise data.
      Coingecko API does not support batch requests for
      chart/time-series price data. Each request has to be submitted
      separately and then combined into an array of promises (data fetches)

      Parameters:
        coins:
          Array of crypto IDs
        days:
          Time interval (in days) for crypto price data
      Returns:
        data: 
          Array of resolved promise data (date and prices)
    */
  try {
    // Coingecko does not support batch requests for chart/time-series data
    // Create an array of promises (fetch price data for each coin)
    let promises = [];
    for (const coin of coins) {
      promises.push(fetchCryptoData(coin, period, holdings));
    }
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    console.log(error);
  }
};

const combineAssetValues = (data, cryptoMode = true) => {
  /* 
        Function that takes in an array of asset price data
        and adds the values of assets for specific date.

        Parameters:
            data:
                Array of asset price data.
                Each item is an object with date and price attributes.
                Crypto data is differently structured than stock market
                data.
            cryptoMode:
                Boolean to indicate if crypto or stock market data
                is used (slightly differently structured data)
        Returns:
            combinedValues:
                Object where date is key and combined asset value
                is the value
    */
  // Object that will hold date and combined asset value data
  const combinedValues = {};
  // Determine if iterable object is going to be array or object
  // Crypto = array | Stock market = object
  const iterable = cryptoMode ? data : Object.keys(data);
  iterable.forEach((item, index) => {
    const values = cryptoMode ? data[index].values : data[item]["chart"];
    values.forEach((point) => {
      if (point.date in combinedValues) {
        // Add value if particular date is already in the object
        combinedValues[point.date].value += point.value;
        combinedValues[point.date].counter++;
      } else {
        //   Create a new date - value pair if first date instance
        combinedValues[point.date] = {
          counter: 1,
          value: point.value,
        };
      }
    });
  });
  return combinedValues;
};

const formatAssetValues = (combinedValues, numAssets, cryptoMode = true) => {
  /* 
        Function that reformats the combined asset value data.
        Creates an array of objects that have date and asset value
        attributes.

        Parameters:
            combinedValues:
                Object that holds date and combined asset value data.
                Key --> date
                Value --> Asset value at that date/time
            numAssets:
                Number of different assets for which the values are were
                combined.
            cryptoMode:
                Boolean to indicate if data is for crypto or stock
                market data.
        Returns:
            reformattedValues:
                Array of objects that hold date and asset value data.

                {date: 'YYYY-MM-DD', value: 12345}
                Some objects' date attributes also provide hour and minute
                data
                
    */
  //    Array that will hold objects of date and value data
  const reformattedValues = [];
  //   Get current date
  // Last object will have current date as it's date value
  const currentDateObj = DateTime.now();
  const currentDate = currentDateObj.toFormat("yyyy-MM-dd HH:mm");
  const currentTime = currentDateObj.toFormat("HH:mm");
  const day = currentDateObj.weekday;
  // const latestValue = { date: currentDate, value: 0 };
  //   Go through each date - value pair
  // Create an object that will have date and value attributes
  const keys = Object.keys(combinedValues);
  keys.forEach((key) => {
    if (combinedValues[key].counter === numAssets) {
      // Push to array
      reformattedValues.push({
        date: key,
        value: combinedValues[key].value,
      });
      // } else {
      // Add up newest values
      // Different assets could be updated at different times
      // latestValue.value += combinedValues[key].value;
    }
  });
  // Crypto markets are open 24/7
  // Last value at time of data fetch
  // if (cryptoMode) {
  //   reformattedValues.push(latestValue);
  //   return reformattedValues;
  // }
  // if (
  //   !cryptoMode &&
  //   !(day in [6, 7]) &&
  //   currentTime >= "9:30" &&
  //   currentTime < "15:59"
  // ) {
  //   reformattedValues.push(latestValue);
  //   return reformattedValues;
  // }
  return reformattedValues;
};

const modifyCryptoOverViewData = (data) => {
  /* 
        Function that etracts the relevant information from
        the returned crypto overview object.

        Parameters:
            data:
                Object containing crypto overview data.
                This data includes websites, social media,
                market data (market cap, supply, ATH, etc.),
                and exchange data.
        Returns:
            modifiedData:
                Object containing reformatted specific crypto data.
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
  };

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

const filterIntradayStocks = (stockData, symbol, type = 1) => {
  /* 
      Function to filter out some data points for better
      intraday price data plotting.

      Parameters:
        stockData:
          Array of objects containing stock intraday price data.
        symbol:
          Stock ticker/symbol string
        type:
          To determine which asset type is selected.
          1: Just stock value
          2: Total asset value (stock + crypto)
      Returns:
        filteredData:
          Array of objects containing filtered stock intraday 
          price data.
    */
  let intradayData = stockData[symbol]["intraday-prices"];
  // if (type === 2) {
  //   intradayData = stockData[symbol];
  // }
  const filteredData = intradayData.filter((point, index) => {
    let filterBoolean =
      index % 5 === 0 || index % 3 === 0 || index === intradayData.length - 1;

    if (type === 2) {
      filterBoolean =
        (index % 5 === 0 && point.close !== null) ||
        index === intradayData.length - 1 ||
        point.minute === "15:59";
    }

    if (index === intradayData.length - 1) {
      const currentTime = DateTime.now().toFormat('hh:mm');
      point['minute'] = currentTime;
    }

    if (filterBoolean) {
      return point;
    }
  });
  return filteredData;
};

const getPrevTradingDate = () => {
  /* 
    Function that returns a luxon DateTime object for
    the previous market trading day. Needed to fetch previous
    trading day intraday price data.

    Returns:
      prevDateObj:
        Luxon DateTime object for previous trading day.
  */

  //  Initiate DateTime object as current date
  let prevDateObj = DateTime.now();
  // Modify DateTime object to hold previous trading day data
  if (prevDateObj.weekday === 6) {
    prevDateObj = prevDateObj.minus({ days: 2 });
  } else if (prevDateObj.weekday === 7) {
    prevDateObj = prevDateObj.minus({ days: 3 });
  } else if (
    prevDateObj.weekday === 1 &&
    prevDateObj.toFormat("HH:mm") < "09:30"
  ) {
    prevDateObj = prevDateObj.minus({ days: 4 });
  } else if (
    prevDateObj.weekday === 1 &&
    prevDateObj.toFormat("HH:mm") >= "09:30"
  ) {
    prevDateObj = prevDateObj.minus({ days: 3 });
  } else {
    prevDateObj = prevDateObj.minus({ days: 1 });
  }
  return prevDateObj;
};

const fetchTwoDayStockData = async (currentUrl, prevUrl = null) => {
  /* 
    Function that fetches stock (batch request) price data for the current 
    and previous trading day. Used for the total asset (crypto + stocks)
    value route. 

    Parameters:
      currentUrl:
        Current trading day API query URL string.
      prevUrl:
        Previous trading day API query URL string.
    Returns:
      data:
        Object that holds stock market data for the current and previous
        stock market trading day.
  */

  // Get today's market data
  const response = await fetch(currentUrl);
  const data = await response.json();

  if (prevUrl) {
    // Get previous day's market data
    const prevDayResponse = await fetch(prevUrl);
    const prevDayData = await prevDayResponse.json();
    // Combine both day market data into one object
    Object.keys(prevDayData).forEach((symbol) => {
      // data[symbol] = [
      //   ...prevDayData[symbol].chart,
      //   ...data[symbol]["intraday-prices"],
      // ];
      data[symbol]["prev"] = prevDayData[symbol].chart;
    });
    console.log(data)
    return data;
  }

  return data;
};

const getCryptoDataTA = async (coins, period, holdings, num) => {
  /* 
    Function to fetch crypto price data.
    Used for the total asset (crypto + stock) value route.

    Parameters:
      coins:
        Array of Coingecko crypto IDs.
      period:
        Time period for price data.
        day | week | month | year
      holdings:
        Object containing amount of each coin in a portfolio
    Returns:
      combinedValues:
        Object with combined crypto price data based on specific date/time.
  */

  // Determine time interval
  try {
    // let days = "1";
    // if (period === "week") {
    //   days = "7";
    // } else if (period === "month") {
    //   days = "30";
    // } else if (period === "year") {
    //   days = "365";
    // }
    // Get price data
    const data = await combineCryptoFetches(coins, period, holdings);
    // Add up values for each time/date
    const combinedValues = combineAssetValues(data);

    // Delete data point for a time period that does not have
    // all of the asset price data
    Object.keys(combinedValues).forEach((key) => {
      if (combinedValues[key].counter < num) {
        delete combinedValues[key];
      }
    });

    return combinedValues;
  } catch (error) {
    console.log(error);
  }
};

const getDataPoints = (data, period, type = 1) => {
  /*
    Function that gets relevant data points from the stock
    price data.

    Parameters:
      data:
        Object with fetched stock price data.
      period:
        Time interval for stock price data.
      type:
        Which asset type is selected to view. 
        Each requires slightly different formatting.
        Value is passed down to the filterIntradayStocks() function.
          1: Stock value
          2: Total asset value
    Returns:
      stockPriceData:
        Object containing date and value data for each stock.
  */
  const stocks = Object.keys(data);
  const stockPriceData = {};
  stocks.forEach((symbol) => {
    let marketData = data[symbol]["chart"];
    if (period === "day") {
      marketData = filterIntradayStocks(data, symbol, (type = type));
    }
    const dataPoints = marketData.map((point) => ({
      date: period === "day" ? `${point.date} ${point.minute}` : point.date,
      value: point.close,
    }));

    if (period === "day" && type === 2) {
      const prevData = data[symbol].prev.map((item) => ({
        date: item.date,
        value: item.close,
      }));
      stockPriceData[symbol] = { chart: dataPoints, prev: prevData };
      return stockPriceData;
    }
    stockPriceData[symbol] = { chart: dataPoints };
  });
  return stockPriceData;
};

const getStockDataTA = async (symbols, period, api) => {
  /* 
      Function to get stock price data.
      Used in the total asset value route.

      Parameters:
        symbols:
          A string of comma separated stock tickers.
        period:
          Time interval for stock price data.
          day | week | month | year
        api:
          IEX cloud API key.
      Returns:
        combinedValues:
          Object containing date and stock price data.
          Key = date / time
          Value: combined stock value
   */
  try {
    // Set up API query URL
    let range;
    if (period === "week") {
      range = "12d";
    } else if (period === "month") {
      range = "37d";
    } else if (period === "year") {
      range = "368d";
    }
    const baseUrl = "https://sandbox.iexapis.com/stable/stock/market/batch";
    const endpoint =
      period === "day"
        ? `?types=intraday-prices&symbols=${symbols}&token=${api}`
        : `?types=chart&symbols=${symbols}&range=${range}&token=${api}`;

    // Get previous stock market trading day data
    let prevUrl = null;
    if (period === "day") {
      // const prevDateObj = getPrevTradingDate();
      // const prevDate = prevDateObj.toFormat("yyyyLLdd");
      const prevSymbols = `?types=chart&symbols=${symbols}&range=7d`;
      const prevFilters = `&token=${api}`;
      // const prevFilters = `&exactDate=${prevDate}&token=${api}`;
      prevUrl = baseUrl + prevSymbols + prevFilters;
    }

    // Final URLs
    const currentUrl = baseUrl + endpoint;

    console.log(currentUrl);
    console.log(prevUrl);

    const currentDate = DateTime.now();
    const weekday = currentDate.weekday;
    // Fetch data for the current and last stock trading day data
    let data = await fetchTwoDayStockData(currentUrl, prevUrl);
    return data;
    // const stockPriceData = getDataPoints(data, period, (type = 2));
    // return stockPriceData;
    const combinedValues = combineAssetValues(
      stockPriceData,
      (cryptoMode = false)
    );

    // Add prev stock price data
    if (period === "day") {
      Object.keys(stockPriceData).forEach((symbol) => {
        const dataPoints = stockPriceData[symbol].prev;
        const today = DateTime.now().toFormat("yyyy-LL-dd");
        dataPoints.forEach((item) => {
          if (item.date in combinedValues && item.date !== today) {
            combinedValues[item.date].value += item.value;
            combinedValues[item.date].counter++;
          } else if (!(item.date in combinedValues) && item.date !== today) {
            combinedValues[item.date] = {
              counter: 1,
              value: item.value
            }
          }
        });
      });
    };

    return combinedValues;
  } catch (error) {
    console.log(error);
  }
};

const getLastClosing = () => {
  /* 
      Function that gets the last closing day and its 
      market close time.

      Returns:
        lastClosing:
          Last market closing date and time.
    */
  let lastClosing;
  if (DateTime.now().weekday === 7) {
    lastClosing = DateTime.now().minus({ days: 2 });
  } else if (DateTime.now().weekday === 1) {
    lastClosing = DateTime.now().minus({ days: 3 });
  } else {
    lastClosing = DateTime.now().minus({ days: 1 });
  }
  lastClosing = lastClosing.toFormat("yyyy-MM-dd") + " 15:59";
  return lastClosing;
};

const getEarliestStockDateDay = (stockValue, refDate) => {
  const currentDateObj = DateTime.now();
  let day = 1;
  let earliestDate = "";
  while (earliestDate === "") {
    const earliestDateObj = currentDateObj.minus({ days: day });
    const formattedDate = earliestDateObj.toFormat("yyyy-LL-dd");
    if (formattedDate <= refDate && formattedDate in stockValue) {
      earliestDate = formattedDate;
    }
    day++;
  }
  return earliestDate;
};

const getEarliestStockDate = (referenceDate, stockValue) => {
  /* 
    Function that gets the earliest stock market date available
    that is the same as the provided crypto market earliest
    date.

    Parameters:
      referenceDate:
        Earliest available crypto market date string.
      stockValue:
        Stock market data object containing date and price data.
    Returns:
      Earliest available stock market date.
  */
  const refDateObj = DateTime.fromFormat(referenceDate, "yyyy-LL-dd");
  let earliestStockDate = "";
  let day = 1;

  while (earliestStockDate === "") {
    const prevDate = refDateObj.minus({ days: day }).toFormat("yyyy-LL-dd");
    if (prevDate in stockValue) {
      earliestStockDate = prevDate;
    }
    day++;
  }
  return earliestStockDate;
};

const combineTotalAssets = (cryptoValue, stockValue, period) => {
  /* 
        Function that combines total asset value (stocks + crypto).

        Parameters:
          cryptoValue:
            Object containing total crypto holding value.
          stockValue:
            Object containing total stock holding value.
        Returns:
          formattedValues:
            Array containing objects with date and total
            asset value data.
     */

  const combinedAssets = {};
  if (period === "day") {
    // const lastClosing = getLastClosing();
    const marketStart = DateTime.now().toFormat("yyyy-MM-dd") + " 09:30";
    const marketEnd = DateTime.now().toFormat("yyyy-MM-dd") + " 15:59";
    const day = DateTime.now().weekday;
    
    const referenceDate = Object.keys(cryptoValue)[0].split(" ")[0];
    const earliestDate = getEarliestStockDateDay(stockValue, referenceDate);
    Object.keys(cryptoValue).forEach((point) => {
      if (point < marketStart || day === 6 || day === 7) {
        // console.log('BEFORE')
        // console.log(point, earliestDate);
        const prevStockVal = stockValue[earliestDate].value;
        combinedAssets[point] = cryptoValue[point].value + prevStockVal;
      } else if (point > marketEnd) {
        // console.log('AFTER')
        // console.log(point, marketEnd);
        combinedAssets[point] =
          cryptoValue[point].value + stockValue[marketEnd].value;
      } else {
        // console.log('DURING');
        // console.log(point);
        combinedAssets[point] =
          cryptoValue[point].value + stockValue[point].value;
      }
    });
  } else {
    let lastTrading = "";
    let earliestStockDate = "";
    const firstCryptoDate = Object.keys(cryptoValue)[0];
    if (!(firstCryptoDate in stockValue)) {
      earliestStockDate = getEarliestStockDate(firstCryptoDate, stockValue);
    }

    Object.keys(cryptoValue).forEach((point) => {
      // Check what day of the week to add proper stock values
      // Stock market is open Mon-Fri

      const weekday = DateTime.fromFormat(point, "yyyy-MM-dd").weekday;

      if (weekday !== 6 && weekday !== 7 && point in stockValue) {
        combinedAssets[point] =
          cryptoValue[point].value + stockValue[point].value;
        lastTrading = point;
      } else if (!(point in stockValue) && lastTrading === "") {
        combinedAssets[point] =
          cryptoValue[point].value + stockValue[earliestStockDate].value;
      } else {
        combinedAssets[point] =
          cryptoValue[point].value + stockValue[lastTrading].value;
      }
    });
  }
  const formattedValues = [];
  Object.keys(combinedAssets).forEach((point) => {
    formattedValues.push({ date: point, value: combinedAssets[point] });
  });
  return formattedValues;
};

module.exports = {
  combineCryptoFetches,
  combineAssetValues,
  formatAssetValues,
  modifyCryptoOverViewData,
  filterIntradayStocks,
  getPrevTradingDate,
  fetchTwoDayStockData,
  getCryptoDataTA,
  getDataPoints,
  getStockDataTA,
  combineTotalAssets,
};
