const fetch = require("node-fetch");
const { DateTime } = require("luxon");
const API = process.env.NEWS_API;

// Handle news requests
// Returns business news
exports.news_all = async (req, res) => {
  try {
    const baseUrl = "https://newsapi.org/v2/top-headlines";
    const query = `?country=us&category=business&apiKey=${API}`;
    const result = await fetch(baseUrl + query);
    const data = await result.json();
    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Handle news requests for particular asset
exports.news_asset = async (req,res) => {
    try {
        const asset = req.params.asset;

        const dateObject = DateTime.now();
        const today= dateObject.toFormat('yyyy-LL-dd');
        // Earliest date
        const earliestDateObj = dateObject.minus({days: 15});
        const from = earliestDateObj.toFormat('yyyy-LL-dd');

        const baseUrl = "https://newsapi.org/v2/everything";
        const queryA = `?from=${from}&to=${today}&counry=us&q=${asset}`
        const queryB = `&sortBy=publishedAt&language=en&apiKey=${API}`;
        const result = await fetch(baseUrl + queryA + queryB);
        const data = await result.json();
        res.status(200).json({data});
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
};