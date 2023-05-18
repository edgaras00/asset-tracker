const express = require("express");
const {
  getCryptoDataTA,
  getStockDataTA,
} = require("../utils/utils");
const router = express.Router();

const IEX_API = process.env.IEX_API;

// Get combined asset data (crypto  )
router.get("/value", async (req, res) => {
  try {
    const stockSymbols = req.query.stocks;
    const cryptoSymbols = req.query.crypto ? req.query.crypto.split(",") : [];
    console.log(stockSymbols);
    const num = cryptoSymbols.length;
    const period = req.query.period;
    const holdings = 1;
    const cryptoValue = await getCryptoDataTA(
      cryptoSymbols,
      period,
      holdings,
      num
    );
    const stockValue = await getStockDataTA(stockSymbols, period, IEX_API);
    res.json(stockValue);
    // const combinedValues = combineTotalAssets(cryptoValue, stockValue, period);
    // res.status(200).json({ assetValue: combinedValues });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = router;
