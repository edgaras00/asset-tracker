import { useEffect, useState } from "react";
import NewsItem from "./NewsItem";

import "./styles/marketNews.css";

const MarketNews = () => {
  // Component that holds links to market news articles

  const [newsData, setNewsData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getNewsData = async () => {
      try {
        let url = "https://alpha-assets-api.onrender.com/news";
        if (process.env.NODE_ENV === "development") {
          url = "/news";
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok || response.status !== 200) {
          throw new Error("Could not get news data");
        }
        const newsData = await response.json();
        setNewsData(newsData.data.data.articles);
      } catch (error) {
        console.error(error);
        setNewsData([]);
      }
    };
    getNewsData();
  }, []);

  const newsItems = newsData.map((article) => {
    return (
      <NewsItem
        key={article.author + article.title}
        title={article.title}
        author={article.author}
        description={article.description}
        content={
          article.content ? article.content.split("[+")[0] : article.content
        }
        date={article.publishedAt}
        source={article.source.name}
        image={article.urlToImage}
        url={article.url}
        type="market"
      />
    );
  });

  return <div className="market-news">{newsItems}</div>;
};

export default MarketNews;
