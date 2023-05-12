const yahooStockAPI = require("yahoo-stock-api").default;
const { DateTime } = require("luxon");

const catchAsync = require("./catchAsync");

const yahoo = new yahooStockAPI();

exports.getPreviousDate = (currentDate, interval) => {
  //  Check if input values are valid
  if (
    !currentDate instanceof Date ||
    !["day", "week", "month", "year"].includes(interval)
  ) {
    throw new Error("Invalid input values");
  }
  const previousDate = new Date(currentDate);

  if (interval === "day") previousDate.setDate(currentDate.getDate() - 2);
  if (interval === "week") previousDate.setDate(currentDate.getDate() - 7);
  if (interval === "month") previousDate.setMonth(currentDate.getMonth() - 1);
  if (interval === "year") previousDate.setYear(currentDate.getFullYear() - 1);
  return previousDate;
};

exports.getDateFromUnix = (unixTimestamp) => {
  const dateTime = DateTime.fromSeconds(unixTimestamp);
  const formattedDate = dateTime.toFormat("yyyy-MM-dd");

  return formattedDate;
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
