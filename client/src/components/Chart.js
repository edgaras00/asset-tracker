import React, { useContext } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../context/appContext";
import "../styles/tooltip.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <div className="tooltip">
        <h3>{payload[0].payload.date}</h3>
        <br />
        <h3>${payload[0].payload.price}</h3>
      </div>
    );
  }
  return null;
};

const Chart = ({ timeFrame, valueData, priceChange, hide }) => {
  // Price chart component
  const { theme } = useContext(AppContext);

  // Set up styles for different themes
  const colorInc = theme === "light" ? "#41b63c" : "#7bcd77";
  const opacityOne = theme === "light" ? 0.8 : 0.4;
  const opacityTwo = theme === "light" ? 0.05 : 0.3;

  const cartesianOpacity = theme === "light" ? 0.85 : 0.4;

  const tickFill = theme === "light" ? "#000000" : "#c5c5c5";

  // Format X axis
  // Don't show all the ticks for better visualization
  const formatX = (time, index) => {
    if (valueData) {
      if (
        timeFrame === "day" &&
        (index % 3 === 0 || index === valueData.length - 1)
      ) {
        return time;
      } else if (timeFrame === "week") {
        return time;
      } else if (
        timeFrame === "month" &&
        (index % 4 === 0 || index === valueData.length - 1)
      ) {
        return time;
      } else if (
        timeFrame === "year" &&
        (index % 28 === 0 || index === valueData.length - 1)
      ) {
        return time;
      }
    }
    return "";
  };

  return (
    <ResponsiveContainer width="98%" height={350}>
      <AreaChart
        width={1400}
        height={300}
        data={valueData.priceData}
        margin={{ left: 60 }}
      >
        <defs>
          <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={priceChange > 0 ? colorInc : "#c45145"}
              stopOpacity={opacityOne}
            />
            <stop
              offset="100%"
              stopColor={priceChange > 0 ? colorInc : "#c45145"}
              stopOpacity={opacityTwo}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#878787"
          opacity={cartesianOpacity}
          vertical={false}
        />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          dy={8}
          fontSize={13}
          fontWeight={800}
          tick={{ fill: tickFill }}
          interval={timeFrame === "day" ? null : "preserveEnd"}
          tickFormatter={(date, index) => formatX(date, index)}
        />
        <YAxis
          dataKey="price"
          axisLine={false}
          tickLine={false}
          tick={{ fill: tickFill }}
          domain={["dataMin", "dataMax"]}
          dx={-18}
          fontSize={14}
          fontWeight={800}
          tickFormatter={(price) => `$${price.toFixed(2)}`}
        />

        <Tooltip content={<CustomTooltip />} />
        <Area
          dataKey="price"
          stroke={priceChange > 0 ? colorInc : "#c45145"}
          fill="url(#color)"
          strokeWidth={2.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
