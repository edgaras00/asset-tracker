const { DateTime } = require("luxon");
const Holidays = require("date-holidays");
const fetch = require("node-fetch");

const IEX_API = process.env.IEX_API;

const fixPreviousDate = (initialDays, dateObj) => {
  // Get earlier date if not market day
  let minusDays = initialDays;
  let lastDateObj = dateObj;

  const holidayObject = new Holidays("US");
  lastDateObj = dateObj.minus({ days: minusDays });
  let additionalMinusDays = 1;
  while (
    lastDateObj.weekday === 7 ||
    lastDateObj.weekday === 6 ||
    holidayObject.isHoliday(lastDateObj)
  ) {
    lastDateObj = dateObj.minus({ days: additionalMinusDays });
    additionalMinusDays++;
  }
  return lastDateObj.toFormat("yyyyMMdd");
};

const getDateForInterval = (changeInterval) => {
  // Function that checks if the date was on a market day
  // Get earlier date if not market day
  const dateObj = DateTime.now();
  let lastDate;
  // Get last week's price
  if (changeInterval === "week") {
    // Check if weekend
    lastDate = fixPreviousDate(7, dateObj);
  } else if (changeInterval === "month") {
    lastDate = fixPreviousDate(30, dateObj);
  } else if (changeInterval === "year") {
    lastDate = fixPreviousDate(365, dateObj);
  }
  return lastDate;
};

exports.getStockPriceChange = async (symbol, priceData, changeInterval) => {
  // Get information about the stock price change for a current interval
  // Return change in USD and percent

  const pastDate = getDateForInterval(changeInterval);
  const currentPrice = priceData.latestPrice;
  const baseUrl = "https://sandbox.iexapis.com/stable/stock";

  const prevApi = `/${symbol}/chart/date/${pastDate}?`;
  const query = `chartByDay=true&token=${IEX_API}`;
  // Fetch past prices
  const prevResponse = await fetch(baseUrl + prevApi + query);
  const prevData = await prevResponse.json();
  const lastPrice = prevData[0].close;
  // Calculate percent change
  const percentChange = ((currentPrice - lastPrice) / lastPrice) * 100;
  // Calculate price change
  const priceChange = currentPrice - lastPrice;
  return [priceChange, percentChange];
};

exports.getDailyStockPriceData = async (url) => {
  // Get daily stock price data and format it for better plotting
  const result = await fetch(url);
  const data = await result.json();
  const filteredData = data.filter((point, index) => {
    if (index % 5 === 0 || index === data.length - 1) {
      return point;
    }
  });
  const priceData = filteredData.map((point) => ({
    date: `${point.date} ${point.minute}`,
    value: point.close,
    displayDate: point.minute,
  }));
  return priceData;
};
