export const setRequestOptions = (method, body) => {
  return {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getDateString = () => {
  const dateObj = new Date();
  const dateStr = new Date(
    dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  return dateStr;
};

export const handleErrors = (response) => {
  let error = new Error("Something went wrong. Please try again later.");
  error.name = "serverError";

  if (response.status === 401) {
    error = new Error("Please log in to get access.");
    error.name = "authError";
    throw error;
  }

  if (response.status === 404) {
    error = new Error("Data not found.");
    error.name = "notFound";
    throw error;
  }

  throw error;
};

export const getAssetNews = async (symbol, token) => {
  try {
    const response = await fetch(`/news/${symbol}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Could not get news data");
    }
    const newsData = await response.json();
    return newsData.data.data.articles;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const multiplyArrayContents = (array, n) => {
  return Array.from({ length: n }, () => array).flat();
};

export const getExchangeImages = (exchanges) => {
  const exchangeImages = exchanges.map((exchange) => {
    return <img src={exchange} alt="exchange" />;
  });
  return exchangeImages;
};
