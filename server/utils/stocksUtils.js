const yahooStockAPI = require("yahoo-stock-api").default;
const { DateTime } = require("luxon");

const catchAsync = require("./catchAsync");

const yahoo = new yahooStockAPI();

exports.getPreviousDate = (currentDate, interval) => {
  try {
    if (!(currentDate instanceof Date)) {
      throw new Error("Invalid currentDate: Not a Date object");
    }

    if (!["day", "week", "month", "year"].includes(interval)) {
      throw new Error("Invalid interval value");
    }

    const previousDate = new Date(currentDate);

    switch (interval) {
      case "day":
        previousDate.setDate(currentDate.getDate() - 2);
        break;
      case "week":
        previousDate.setDate(currentDate.getDate() - 7);
        break;
      case "month":
        previousDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "year":
        previousDate.setYear(currentDate.getFullYear() - 1);
        break;
      default:
        throw new Error("Invalid interval");
    }

    return previousDate;
  } catch (error) {
    console.error(error);
  }
};

exports.getDateFromUnix = (unixTimestamp) => {
  const dateTime = DateTime.fromSeconds(unixTimestamp);
  const formattedDate = dateTime.toFormat("yyyy-MM-dd");

  return formattedDate;
};

exports.formatHistoricalPrices = (priceData, interval) => {
  const historicalPrices = priceData.response
    .map((dataPoint) => {
      const date = getDateFromUnix(dataPoint.date);

      let displayDate =
        interval === "day" ? date : DateTime.fromSeconds(dataPoint.date);
      if (interval === "week" || interval === "month") {
        displayDate = displayDate.toFormat("d-MMMM");
      } else if (interval === "year") {
        displayDate = displayDate.toFormat("MMM-yy");
      }

      return { date, price: dataPoint.close, displayDate };
    })
    .filter((dataPoint) => dataPoint.price !== null)
    .reverse();
  return historicalPrices;
};

exports.getCurrentPrice = (priceData) => {
  console.log(priceData);
  const currentPrice = priceData.response[0].close;
  const prevPrice = priceData.response[priceData.response.length - 1].close;
  const priceChange = prevPrice ? currentPrice - prevPrice : 0;

  const percentChange = prevPrice
    ? Number((priceChange / prevPrice) * 100).toFixed(2)
    : 0;

  return { price: currentPrice, priceChange, percentChange };
};

const calculatePercentChange = (newValue, oldValue) => {
  return ((newValue - oldValue) / oldValue) * 100;
};

const fetchStockData = catchAsync(async (symbol) => {
  const data = await yahoo.getSymbol({ symbol });
  const price = data.response.previousClose;
  const previousPrice = data.response.dayRange.low;
  const percentChange = calculatePercentChange(price, previousPrice);
  return { [symbol]: { price, percentChange } };
});

exports.fetchAllStockData = catchAsync(async (symbols) => {
  const allStocksPromises = symbols.map((symbol) => fetchStockData(symbol));
  const allStocks = await Promise.all(allStocksPromises);
  const stockObject = Object.assign({}, ...allStocks);
  return stockObject;
});
