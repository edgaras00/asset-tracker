const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const CryptoSymbols = require("./models/cryptoSymbolsModel");
const StockSymbols = require("./models/stockSymbolsModel");
require("dotenv").config({ path: "./env" });

const readData = (path) => JSON.parse(fs.readFileSync(path, "utf-8"));

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT_CLOUD);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const clearDB = async (Model) => {
  try {
    await Model.deleteMany({});
  } catch (error) {
    console.log(error);
  }
};

const uploadData = async (Model, data) => {
  try {
    await Model.insertMany(data);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Read files
    const coinInfo = readData(path.join(__dirname, "coins.json"));
    // const symbolInfo = readData(path.join(__dirname, "db-symbols.json"));

    // Connect to DB
    await connectToDB();

    // Clear collections
    await clearDB(CryptoSymbols);
    // await clearDB(StockSymbols);

    console.log("DB cleared");

    // Upload new data to DB
    await uploadData(CryptoSymbols, coinInfo);
    // await uploadData(StockSymbols, symbolInfo);
    console.log("Data imported successfully!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

importData();
