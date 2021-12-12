const fetch = require("node-fetch");
const { DateTime } = require("luxon");
const StockSymbols = require("../models/stockSymbolsModel");
const stockUtils = require("../utils/stockUtils");
const catchAsync = require("../utils/catchAsync");
const assetNotFound = require("../utils/assetNotFound");
const getTxnHistory = require("../utils/getTxnHistory");
const AppError = require("../utils/appError");

const IEX_API = process.env.IEX_API;
const AV_API = process.env.AV_API;

// Handle stock search requests
// Returns stock name and symbol
exports.searchStocks = catchAsync(async (req, res, next) => {
  const query = req.query.query;

  // Search db for stock
  const results = await StockSymbols.find({ $text: { $search: query } });
  res.status(200).json({ status: "Success", data: results });
});

// Returns current price and price change for different intervals
exports.getCurrentPrice = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol;
  const changeInterval = req.query.interval;
  // Build URL
  const baseUrl = "https://sandbox.iexapis.com/stable/stock";
  const endpoint = `/${symbol}/quote?token=${IEX_API}`;
  // Fetch data
  const result = await fetch(baseUrl + endpoint);

  assetNotFound(result, next);

  const data = await result.json();

  // Return daily price data if no interval is provided
  if (!changeInterval || changeInterval === "day") {
    const priceData = {
      symbol: data.symbol,
      price: data.latestPrice,
      change: data.change,
      changePercent: data.changePercent,
    };
    return res.status(200).json({ status: "Success", data: priceData });
  }

  // Get price change and percent price change
  const [priceChange, percentChange] = await stockUtils.getStockPriceChange(
    symbol,
    data,
    changeInterval
  );
  // Create price data object
  const priceData = {
    symbol: data.symbol,
    price: data.latestPrice,
    change: priceChange,
    changePercent: percentChange,
  };
  res.status(200).json({
    status: "Success",
    data: priceData,
  });
});

// Get user's stock portfolio data
exports.getPortfolio = catchAsync(async (req, res, next) => {
  const stocks = req.user.assets.stockInfo.stocks;

  if (stocks.length === 0) {
    const assets = [];
    return res.status(200).json({
      status: "Success",
      data: {
        assets,
      },
    });
  }

  const symbols = stocks.map((stock) => stock.symbol.toLowerCase()).join(",");

  const baseUrl = "https://sandbox.iexapis.com/stable/stock/market/batch?";
  const query = `types=quote&symbols=${symbols}&token=${IEX_API}`;

  const response = await fetch(baseUrl + query);

  assetNotFound(response, next);

  const data = await response.json();

  const assets = stocks.map((stock) => {
    const symbol = stock.symbol.toUpperCase();
    const value = stock.amount * data[symbol].quote.latestPrice;
    const roi = (((value - stock.cost) / stock.cost) * 100).toFixed(2);
    return {
      id: stock._id,
      symbol,
      name: data[symbol].quote.name,
      amount: stock.amount,
      price: data[symbol].quote.latestPrice,
      value,
      cost: stock.cost,
      dayChange: data[symbol].quote.changePercent,
      roi,
      logo: `https://storage.googleapis.com/iex/api/logos/${symbol}.png`,
    };
  });

  const totalValue = assets.reduce((prevStock, currentStock) => ({
    value: prevStock.value + currentStock.value,
  }));
  const totalCost = req.user.assets.stockInfo.cost;
  const totalROI = ((totalValue.value - totalCost) / totalCost) * 100;

  res.status(200).json({
    status: "Success",
    data: { assets, totalValue: totalValue.value, totalROI, totalCost },
  });
});

// Market price data for different time intervals
exports.getPricesOnInterval = catchAsync(async (req, res, next) => {
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
    const dayPriceData = await stockUtils.getDailyStockPriceData(
      baseUrl + endpoint
    );
    return res.status(200).json({
      status: "Success",
      data: { symbol, assetValue: dayPriceData },
    });
  }

  // Other time intervals
  const result = await fetch(baseUrl + endpoint);

  assetNotFound(result, next);

  const data = await result.json();

  const priceData = data.map((point) => {
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

  res
    .status(200)
    .json({ status: "Success", data: { symbol, assetValue: priceData } });
});

// Gwt company overview data
exports.getOverview = catchAsync(async (req, res, next) => {
  const baseUrl = "https://www.alphavantage.co/query?";
  // const query = `function=OVERVIEW&symbol=${symbol}&apikey=${AV_API}`;
  const query = `function=OVERVIEW&symbol=IBM&apikey=demo`;

  // Fetch data
  const result = await fetch(baseUrl + query);

  assetNotFound(result, next);

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
  res.status(200).json({ status: "Success", data: { data: overviewData } });
});

// Company income statement
exports.getIncome = catchAsync(async (req, res, next) => {
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=INCOME_STATEMENT&symbol=IBM&apikey=demo`;

  const result = await fetch(baseUrl + query);
  assetNotFound(result, next);
  const data = await result.json();

  const quarterlyReport = data.quarterlyReports[0];
  const incomeData = {
    symbol: data.symbol,
    totalRevenue: quarterlyReport.totalRevenue,
    costOfRevenue: quarterlyReport.costOfRevenue,
    grossProfit: quarterlyReport.grossProfit,
    operatingExpenses: quarterlyReport.operatingExpenses,
  };
  res.status(200).json({ status: "Success", data: { data: incomeData } });
});

// Company balance sheet requests
exports.getBalance = catchAsync(async (req, res, next) => {
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=BALANCE_SHEET&symbol=IBM&apikey=demo`;

  const result = await fetch(baseUrl + query);
  assetNotFound(result, next);
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
  res
    .status(200)
    .json({ success: "Success", data: { data: balanceSheetData } });
});

// Company cash flow
exports.getCash = catchAsync(async (req, res, next) => {
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=CASH_FLOW&symbol=IBM&apikey=demo`;

  const result = await fetch(baseUrl + query);
  assetNotFound(result, next);
  const data = await result.json();

  const quarterlyReport = data.quarterlyReports[0];
  const cashFlowStatement = {
    operations: {
      operatingCashFlow: quarterlyReport.operatingCashflow,
      opActivitiesPayments: quarterlyReport.paymentsForOperatingActivities,
      opActivitiesProceeds: quarterlyReport.proceedsFromOperatingActivities,
      opLiabilities: quarterlyReport.changeInOperatingLiabilities,
      opAssets: quarterlyReport.changeInOperatingAssets,
    },
    investing: {
      investmentCash: quarterlyReport.cashflowFromInvestment,
      inventory: quarterlyReport.changeInInventory,
      capitalExpenditures: quarterlyReport.capitalExpenditures,
    },
    financing: {
      financingCash: quarterlyReport.cashflowFromFinancing,
      shortDebtRp: quarterlyReport.proceedsFromRepaymentsOfShortTermDebt,
      cStockRp: quarterlyReport.paymentsForRepurchaseOfCommonStock,
      dividendPayout: quarterlyReport.dividendPayout,
      repurchaseEquityProceeds: quarterlyReport.proceedsFromRepurchaseOfEquity,
    },
  };

  res
    .status(200)
    .json({ status: "Success", data: { data: cashFlowStatement } });
});

exports.getTransactionHistory = getTxnHistory("stocks");
