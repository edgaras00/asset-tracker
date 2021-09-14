const fetch = require('node-fetch');

const getLogo = async (cId) => {
  /* 
    Function gets cryptocurrency logo from the CoinGecko API

    Parameters:
      cId (string):
        CoinGecko cryptocurrency id
    Returns:
      Object containing id and image link
      key: coin id
      value: link to logo
  */
  try {
    const baseUrl = `https://api.coingecko.com/api/v3/coins/${cId}?`;
    const query1 = "localization=false&tickers=false&market_data=false";
    const query2 = "&community_data=false&developer_data=false&sparkline=false";
    const response = await fetch(baseUrl + query1 + query2);
    const data = await response.json();
    if (response.status !== 200) {
      // console.log(response.status, baseUrl + query1 + query2);
    }
    if ( response.status === 200 && data.image) {
      return { [cId]: data.image.large };
    }
    return { [cId]: "NA" };
  } catch (error) {
    console.log(error);
  }
};

const getMultipleLogos = async (coins) => {
  /* 
      Function that combines multiples data requests.
      Creates an array of promises and waits until all
      of the promises are resolved (all data is fetched)

      Parameters:
        coins (array):
          Array of CoinGecko crypto ids
      Returns:
        logoObject (object):
          Object containing crypto id and logo information for multiple coins
          Key: CoinGecko crypto id
          Value: Link to logo
  */
  try {
    let promises = [];
    for (const coin of coins) {
      promises.push(getLogo(coin));
    }
    // Wait until all promises are resolved
    const data = await Promise.all(promises);
    const logoObject = {};
    data.forEach((crypto) => {
      const key = Object.keys(crypto);
      logoObject[key] = crypto[key];
    });
    console.log(logoObject);
    return logoObject;
  } catch (error) {
    console.log(error);
  }
};

const modifyCryptoOverViewData = (data) => {
  /* 
        Function that extracts the relevant information from
        the returned crypto overview object.

        Parameters:
            data:
                Object containing crypto overview data.
                This data includes websites, social media,
                market data (market cap, supply, ATH, etc.),
                and exchange data.
        Returns:
            modifiedData:
                Object containing reformatted specific crypto data.
    */
  let exchangeData = [];
  if (data.tickers) {
    exchangeData = data.tickers.map((exchange) => {
      return {
        base: exchange.base,
        target: exchange.target,
        name: exchange.market.name,
        lastPrice: exchange.last,
        volume: exchange.converted_volume.usd,
        url: exchange.trade_url,
      };
    });
  }

  const modifiedData = {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    categories: data.categories,
    description: data.description.en,
    links: data.links,
    image: data.image.large,
    marketRank: data.market_cap_rank,
    currentPrice: data.market_data.current_price.usd,
    ath: data.market_data.ath.usd,
    athChange: data.market_data.ath_change_percentage.usd,
    marketcap: data.market_data.market_cap.usd,
    fdv: data.market_data.fully_diluted_valuation.usd,
    totalVolume: data.market_data.total_volume.usd,
    high24h: data.market_data.high_24h.usd,
    low24h: data.market_data.low_24h.usd,
    deltaPrice24h: data.market_data.price_change_24h_in_currency.usd,
    deltaPercent24h: data.market_data.price_change_percentage_24h,
    delta_percent7d: data.market_data.price_change_percentage_7d,
    delta_percent14d: data.market_data.price_change_percentage_14d,
    delta_percent30d: data.market_data.price_change_percentage_30d,
    delta_percent60d: data.market_data.price_change_percentage_60d,
    delta_percent200d: data.market_data.price_change_percentage_200d,
    delta_percent1y: data.market_data.price_change_percentage_1y,
    delta_marketcap24h: data.market_data.market_cap_change_24h,
    deltaMcPercent24h: data.market_data.market_cap_change_percentage_24h,
    totalSupply: data.market_data.total_supply,
    maxSupply: data.market_data.max_supply,
    circulatingSupply: data.market_data.circulating_supply,
    exchangeData: exchangeData,
  };
  return modifiedData;
};

module.exports = {getMultipleLogos, modifyCryptoOverViewData};
