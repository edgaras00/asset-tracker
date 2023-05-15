const fetch = require("node-fetch");
const { DateTime } = require("luxon");
const StockSymbols = require("../models/stockSymbolsModel");
const catchAsync = require("../utils/catchAsync");
const assetNotFound = require("../utils/assetNotFound");
const getTxnHistory = require("../utils/getTxnHistory");
const AppError = require("../utils/appError");

const yahooStockAPI = require("yahoo-stock-api").default;
const {
  fetchAllStockData,
  getPreviousDate,
  getDateFromUnix,
} = require("../utils/stocksUtils");

const yahoo = new yahooStockAPI();

const AV_API = process.env.AV_API;

// Returns stock name and symbol
exports.searchStocks = catchAsync(async (req, res, next) => {
  const query = req.query.query;
  // Search db for stock
  const results = await StockSymbols.find({ $text: { $search: query } });
  res.status(200).json({ status: "Success", data: results });
});

exports.getPrices = catchAsync(async (req, res) => {
  // Valid inputs
  const intervals = ["day", "week", "month", "year"];
  const types = ["current", "market"];

  const symbol = req.params.symbol || "tsla";

  const interval = intervals.includes(req.query.interval)
    ? req.query.interval
    : "day";
  const type = types.includes(req.query.type) ? req.query.type : "current";

  const endDate = new Date();
  const startDate = getPreviousDate(endDate, interval);

  const priceData = await yahoo.getHistoricalPrices({
    startDate,
    endDate,
    symbol,
    frequency: interval === "year" ? "1mo" : "1d",
  });

  if (type === "current") {
    const currentPrice = priceData.response[0].close;
    const prevPrice = priceData.response[priceData.response.length - 1].close;
    const priceChange = currentPrice - prevPrice;
    const percentChange = Number(
      ((currentPrice - prevPrice) / prevPrice) * 100
    ).toFixed(2);
    return res.status(200).json({
      status: "success",
      data: { price: currentPrice, priceChange, percentChange },
    });
  }

  const historicalPrices = priceData.response
    .map((dataPoint) => {
      const date = getDateFromUnix(dataPoint.date);
      let displayDate =
        interval === "day" ? date : DateTime.fromSeconds(dataPoint.date);

      if (interval === "week" || interval === "month") {
        displayDate = displayDate.toFormat("d-MMMM");
      }
      if (interval === "year") displayDate = displayDate.toFormat("MMM-yy");

      return { date, price: dataPoint.close, displayDate };
    })
    .filter((dataPoint) => dataPoint.price !== null)
    .reverse();

  res.status(200).json({
    status: "success",
    data: historicalPrices,
  });
});

exports.getPortfolio = catchAsync(async (req, res) => {
  const stocks = req.user.assets.stockInfo.stock;

  if (stocks.length === 0) {
    const assets = [];
    return res.status(200).json({
      status: "Success",
      data: {
        assets,
      },
    });
  }

  const symbols = stocks.map((stock) => stock.symbol);

  // Get currenct prices

  const data = await fetchAllStockData(symbols);

  const assets = stocks.map((stock) => {
    const symbol = stock.symbol;
    const value = Number((stock.amount * data[symbol].price).toFixed(2));
    const returnOnInvestment = Number(
      (((value - stock.cost) / stock.cost) * 100).toFixed(2)
    );
    return {
      symbol,
      amount: stock.amount,
      cost: stock.cost,
      price: data[symbol].price,
      value,
      dayPercentChange: Number(data[stock.symbol].percentChange).toFixed(2),
      returnOnInvestment,
      logo: `https://storage.googleapis.com/iex/api/logos/${symbol}.png`,
    };
  });

  const totalValue = assets.reduce((prevStock, currentStock) => ({
    value: prevStock.value + currentStock.value,
  }));
  const totalCost = req.user.assets.stockInfo.cost;
  const totalROI = ((totalValue.value - totalCost) / totalCost) * 100;

  res.status(200).json({
    status: "success",
    data: {
      assets,
      totalValue: totalValue.value,
      totalCost,
      totalROI,
    },
  });
});

// Gwt company overview data
exports.getOverview = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol;
  const baseUrl = "https://www.alphavantage.co/query?";
  // const query = `function=OVERVIEW&symbol=${symbol}&apikey=${AV_API}`;
  const query = `function=OVERVIEW&symbol=IBM&apikey=demo`;

  // Fetch data
  const result = await fetch(baseUrl + query);

  assetNotFound(result, next);

  const data = await result.json();
  const overview = {
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
  res.status(200).json({ status: "Success", data: { data: overview } });
});

// Company income statement
exports.getIncome = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol;
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=INCOME_STATEMENT&symbol=IBM&apikey=demo`;
  // const query = `function=INCOME_STATEMENT&symbol=${symbol}&apikey=${AV_API}`;

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
  const symbol = req.params.symbol;
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=BALANCE_SHEET&symbol=IBM&apikey=demo`;
  // const query = `function=BALANCE_SHEET&symbol=${symbol}&apikey=${AV_API}`;

  const result = await fetch(baseUrl + query);
  assetNotFound(result, next);
  const data = await result.json();

  const quarterlyReport = data.quarterlyReports[0];

  const balanceSheet = {
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
  res.status(200).json({ success: "Success", data: { data: balanceSheet } });
});

// Company cash flow
exports.getCash = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol;
  const baseUrl = "https://www.alphavantage.co/query?";
  const query = `function=CASH_FLOW&symbol=IBM&apikey=demo`;
  // const query = `function=CASH_FLOW&symbol=${symbol}&apikey=${AV_API}`;

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

exports.getTransactionHistory = getTxnHistory("stock");
