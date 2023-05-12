import { useState, useCallback } from "react";
import { PieChart, Pie, Legend, ResponsiveContainer, Sector } from "recharts";
import { numberWithCommas } from "../../utils/utils";

const PieGraph = ({ portfolio, assetValue, showPercent }) => {
  // Asset allocation graph component
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const colors = [
    "#36b500",
    "#9b46ae",
    "#d6504f",
    "#33c1f1",
    "#3949ba",
    "#ff9831",
    "#c2b759",
    "#97a4b8",
    "#a07ea6",
    "#d16b52",
  ];

  const data = portfolio.map((asset) => {
    const displayValue = showPercent
      ? (asset.value / assetValue) * 100
      : asset.value;
    return {
      name: asset.symbol,
      value: displayValue,
    };
  });

  data.forEach((asset, index) => {
    if (index < colors.length) {
      asset.fill = colors[index];
    } else {
      const fillColorIdx = index % colors.length;
      asset.fill = colors[fillColorIdx];
    }
  });

  const displayMiddleText = (props) => {
    const {
      cx,
      cy,
      fill,
      payload,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
    } = props;
    return (
      <g>
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          fill={fill}
          fontSize="1.4em"
          fontWeight="bold"
          stroke={fill}
        >
          <tspan x={cx} dy={0}>
            {payload.name}
          </tspan>
          <tspan x={cx} dy={25}>
            {showPercent
              ? payload.value.toFixed(2) + "%"
              : "$" + numberWithCommas(payload.value.toFixed(2))}
          </tspan>
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="58%" height="100%">
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          cx={190}
          cy={158}
          innerRadius={70}
          activeIndex={activeIndex}
          activeShape={displayMiddleText}
          onMouseEnter={onPieEnter}
          onMouseLeave={() => setActiveIndex(-1)}
        ></Pie>
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconSize={13}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieGraph;
