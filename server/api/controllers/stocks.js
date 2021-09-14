const fetch = require('node-fetch');
const { DateTime } = require("luxon");
const Symbols = require("../models/symbols");


const IEX_API = process.env.IEX_API;
const AV_API = process.env.AV_API;

const fixPreviousDate = (initialDays, dateObj) => {
  let minusDays = initialDays;
  let lastDateObj = dateObj;
  while (lastDateObj.weekday === 7 || lastDateObj.weekday === 6) {
    lastDateObj = dateObj.minus({ days: minusDays });
    minusDays++;
  }
  return lastDateObj.toFormat("yyyyMMdd");
};

// Handle stock search requests
// Returns stock name and symbol
exports.stocks_search = async (req, res) => {
  try {
    const query = req.query.query;
    // Search db for stock
    const results = await Symbols.find({ $text: { $search: query } });
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handles current price requests for different time intervals
// Returns current price and price change for different intervals
exports.stocks_current = async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const changeInterval = req.query.interval;
    // Build URL
    const baseUrl = "https://sandbox.iexapis.com/stable/stock";
    const endpoint = `/${symbol}/quote?token=${IEX_API}`;
    // Fetch data
    const result = await fetch(baseUrl + endpoint);
    const data = await result.json();
    // Return daily price data if no interval is provided
    if (!changeInterval || changeInterval === "day") {
      const priceData = {
        symbol: data.symbol,
        price: data.latestPrice,
        change: data.change,
        changePercent: data.changePercent,
      };
      return res.status(200).json(priceData);
    }

    // Get price history to calculate price changes

    // Current date object
    const dateObj = DateTime.now();
    const currentPrice = data.latestPrice;
    let lastDate;
    // Get last week's price
    if (changeInterval === "week") {
      // Check if weekend
      const today = DateTime.now().weekday;
      let minusDays = 7;
      if (today === 6) {
        minusDays = 8;
      } else if (today === 7) {
        minusDays = 9;
      }
      lastDate = dateObj.minus({ days: minusDays }).toFormat("yyyyMMdd");
    } else if (changeInterval === "month") {
      lastDate = fixPreviousDate(30, dateObj);
    } else if (changeInterval === "year") {
      lastDate = fixPreviousDate(365, dateObj);
    }

    const prevApi = `/${symbol}/chart/date/${lastDate}?chartByDay=true&token=${IEX_API}`;
    console.log(baseUrl + prevApi);
    // Fetch past prices
    const prevResponse = await fetch(baseUrl + prevApi);
    const prevData = await prevResponse.json();
    const lastPrice = prevData[0].close;
    // Calculate percent change
    const percentChange = ((currentPrice - lastPrice) / lastPrice) * 100;
    // Calculate price change
    const priceChange = currentPrice - lastPrice;
    const priceData = {
      symbol: data.smybol,
      price: data.latestPrice,
      change: priceChange,
      changePercent: percentChange,
    };
    res.status(200).json(priceData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handles requests for multiple stock price data
exports.stocks_batch = async (req, res) => {
  try {
    // Format: symbol:amount:cost
    const stockHoldings = req.query.stocks;
    const stockArr = stockHoldings.split(",");
    // Get stock symbols from query
    const symbols = stockArr.map((stock) => stock.split(":")[0]).join(",");
    // Object containing symbol, amount and cost data
    const mapped = {};
    stockArr.forEach((stock) => {
      const splitted = stock.split(":");
      const symbol = splitted[0].toUpperCase();
      const amount = Number(splitted[1]);
      const cost = Number(splitted[2]);
      // mapped[splitted[0].toUpperCase()] = Number(splitted[1]);
      mapped[symbol] = { amount: amount, cost: cost };
      // mapped[symbol] = {amount: amount};
    });

    const baseUrl = "https://sandbox.iexapis.com/stable/stock/market/batch?";
    const query = `types=quote&symbols=${symbols}&token=${IEX_API}`;
    console.log(baseUrl + query);

    // const query = `types=price&symbols=${symbols}&token=${IEX_API}`;
    const result = await fetch(baseUrl + query);
    const data = await result.json();

    // Array containing objects with price data
    const assets = Object.keys(data).map((symbol) => {
      // Current stock value: amount * price
      const value = mapped[symbol].amount * data[symbol].quote.latestPrice;
      const cost = mapped[symbol].cost;
      // Calculate return on investment
      const roi = (((value - cost) / cost) * 100).toFixed(2);
      return {
        symbol: symbol,
        name: data[symbol].quote.companyName,
        amount: mapped[symbol].amount,
        price: data[symbol].quote.latestPrice,
        value: value,
        cost: cost,
        dayChange: data[symbol].quote.changePercent,
        roi: roi,
        logo: `https://storage.googleapis.com/iex/api/logos/${symbol}.png`,
      };
    });
    res.status(200).json({ assets: assets });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Market price data
exports.stocks_prices = async (req, res) => {
  try {
    // Stock ticker and price movement time interval
    const symbol = req.params.symbol;
    const period = req.query.period;

    let interval;
    if (period === "week") {
      interval = "1w";
    }
    if (period === "month") {
      interval = "1m";
    }
    if (period === "year") {
      interval = "1y";
    }

    // Build query
    const baseUrl = "https://sandbox.iexapis.com/stable/stock";
    let endpoint;
    if (period === "day") {
      endpoint = `/${symbol}/intraday-prices?token=${IEX_API}`;
    } else {
      endpoint = `/${symbol}/chart/${interval}?token=${IEX_API}`;
    }

    // Fetch daily price data
    // Reduce number of data points (will be easier to plot)
    if (period === "day") {
      const result = await fetch(baseUrl + endpoint);
      const data = await result.json();
      const filteredData = data.filter((point, index) => {
        if (index % 5 === 0 || index === data.length - 1) {
          return point;
        }
      });
      const points = filteredData.map((point) => ({
        date: `${point.date} ${point.minute}`,
        value: point.close,
        displayDate: point.minute,
      }));

      res.status(200).json({ symbol, assetValue: points });
      // Other time intervals
    } else {
      const result = await fetch(baseUrl + endpoint);
      const data = await result.json();

      const points = data.map((point) => {
        const dateObj = DateTime.fromFormat(point.date, "yyyy-MM-dd");
        let displayDate;
        if (period === "week" || period === "month") {
          displayDate = dateObj.toFormat("d-MMMM");
        } else {
          displayDate = dateObj.toFormat("MMM-yy");
        }
        return {
          date: point.date,
          value: point.close,
          displayDate,
        };
      });

      res.status(200).json({ symbol, assetValue: points });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle company overview requests
exports.stocks_overview = async (req, res) => {
  try {
    const baseUrl = "https://www.alphavantage.co/query?";
    // const query = `function=OVERVIEW&symbol=${symbol}&apikey=${AV_API}`;
    const query = `function=OVERVIEW&symbol=IBM&apikey=demo`;

    // Fetch data
    const result = await fetch(baseUrl + query);
    const data = await result.json();
    const overviewData = {
      symbol: data.Symbol,
      assetType: data.AssetType,
      name: data.Name,
      country: data.Country,
      exchange: data.Exchange,
      employees: data.FullTimeEmployees,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      latestQuarter: data.LatestQuarter,
      marketcap: data.MarketCapitalization,
      eps: data.EPS,
      roe: data.ReturnOnEquityTTM,
      profitMargin: data.ProfitMargin,
      pe: data.PERatio,
      pb: data.PriceToBookRatio,
      peg: data.PEGRatio,
    };
    res.status(200).json({ data: overviewData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle company income sheet requests
exports.stocks_income = async (req, res) => {
  try {
    const baseUrl = "https://www.alphavantage.co/query?";
    const query = `function=INCOME_STATEMENT&symbol=IBM&apikey=demo`;

    const result = await fetch(baseUrl + query);
    const data = await result.json();
    const quarterlyReport = data.quarterlyReports[0];
    const incomeData = {
      symbol: data.symbol,
      totalRevenue: quarterlyReport.totalRevenue,
      costOfRevenue: quarterlyReport.costOfRevenue,
      grossProfit: quarterlyReport.grossProfit,
      operatingExpenses: quarterlyReport.operatingExpenses,
    };
    res.status(200).json({ data: incomeData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Company balance sheet requests
exports.stocks_balance = async (req, res) => {
  try {
    const baseUrl = "https://www.alphavantage.co/query?";
    const query = `function=BALANCE_SHEET&symbol=IBM&apikey=demo`;

    const result = await fetch(baseUrl + query);
    const data = await result.json();
    const quarterlyReport = data.quarterlyReports[0];
    const balanceSheetData = {
      fiscalDateEnding: quarterlyReport.fiscalDateEnding,
      assets: {
        totalAssets: quarterlyReport.totalAssets,
        currentAssets: quarterlyReport.totalCurrentAssets,
        nonCurrentAssets: quarterlyReport.totalNonCurrentAssets,
        cash: quarterlyReport.cashAndCashEquivalentsAtCarryingValue,
        inventory: quarterlyReport.inventory,
        netReceivables: quarterlyReport.currentNetReceivables,
        property: quarterlyReport.propertyPlantEquipment,
        depAmm: quarterlyReport.accumulatedDepreciationAmortizationPPE,
        goodwill: quarterlyReport.goodwill,
        investments: quarterlyReport.investments,
        shortTermInvestments: quarterlyReport.shortTermInvestments,
        longTermInvestments: quarterlyReport.longTermInvestments,
        intangibleAssets: quarterlyReport.intangibleAssets,
      },
      liabilities: {
        totalLiabilities: quarterlyReport.totalLiabilities,
        currentLiabilities: quarterlyReport.totalCurrentLiabilities,
        nonCurrentLiabilities: quarterlyReport.totalNonCurrentLiabilities,
        currentDebt: quarterlyReport.currentDebt,
        shortTermDebt: quarterlyReport.shortTermDebt,
        longTermDebt: quarterlyReport.longTermDebt,
        accountsPayable: quarterlyReport.currentAccountsPayable,
        deferredRevenue: quarterlyReport.deferredRevenue,
        capitalLeaseObligations: quarterlyReport.capitalLeaseObligations,
      },
      shareHolderEquity: {
        totalEquity: quarterlyReport.totalShareholderEquity,
        treasuryStock: quarterlyReport.treasuryStock,
        commonStock: quarterlyReport.commonStock,
        retainedEarnings: quarterlyReport.retainedEarnings,
        commonStockSO: quarterlyReport.commonStockSharesOutstanding,
      },
    };
    res.status(200).json({ data: balanceSheetData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Company cash flow
exports.stocks_cash = async (req, res) => {
  try {
    const baseUrl = "https://www.alphavantage.co/query?";
    const query = `function=CASH_FLOW&symbol=IBM&apikey=demo`;

    const result = await fetch(baseUrl + query);
    const data = await result.json();

    const quarterlyReport = data.quarterlyReports[0];
    const cashFlowStatement = {
      operations: {
        operatingCashFlow: quarterlyReport.operatingCashflow,
        opActivitiesPayments: quarterlyReport.paymentsForOperatingActivities,
        opActivitiesProceeds: quarterlyReport.proceedsFromOperatingActivities,
        opLiabilities: quarterlyReport.changeInOperatingLiabilities,
        opAssets: quarterlyReport.changeInOperatingAssets
      },
      investing: {
        investmentCash: quarterlyReport.cashflowFromInvestment,
        inventory: quarterlyReport.changeInInventory,
        capitalExpenditures: quarterlyReport.capitalExpenditures
      },
      financing: {
      financingCash: quarterlyReport.cashflowFromFinancing,
      shortDebtRp: quarterlyReport.proceedsFromRepaymentsOfShortTermDebt,
      cStockRp: quarterlyReport.paymentsForRepurchaseOfCommonStock,
      dividendPayout: quarterlyReport.dividendPayout,
      repurchaseEquityProceeds: quarterlyReport.proceedsFromRepurchaseOfEquity
      }
    }

    res.status(200).json({ data: cashFlowStatement });
  } catch (error) {
    console.log(error);
  }
};