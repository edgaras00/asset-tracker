const yahooStockAPI = require("yahoo-stock-api");
const catchAsync = require("./catchAsync");
const { default: YahooStockAPI } = require("yahoo-stock-api");

const yahoo = new YahooStockAPI();

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

exports.createDayDummyData = (
  openPrice,
  lowPrice,
  highPrice,
  closePrice,
  length
) => {
  const dummyData = [];

  let currentValue = openPrice;
  dummyData.push(currentValue);

  while (dummyData.length < length) {
    const randomChange = Math.random() * (highPrice - lowPrice);
    const direction = Math.random() < 0.5 ? -1 : 1;
    currentValue += direction * randomChange;
    dummyData.push(parseFloat(currentValue.toFixed(2)));
  }

  if (dummyData.length > length) {
    dummyData.pop();
  }

  dummyData.push(closePrice);

  return dummyData;
};
