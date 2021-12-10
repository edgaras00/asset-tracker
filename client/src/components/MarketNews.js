import React from "react";
import news from "../news.json";
import NewsItem from "./NewsItem";
import "../styles/marketNews.css";

const MarketNews = () => {
  // Component that holds links to market news articles
  const data = news.articles;
  const newsItems = data.slice(0, 5).map((article) => {
    return (
      <NewsItem
        key={article.author + article.title}
        title={article.title}
        author={article.author}
        description={article.description}
        content={article.content.split("[+")[0]}
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
