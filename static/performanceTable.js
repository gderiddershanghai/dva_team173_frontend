const tableMargin = {top: 20, right: 20, bottom: 20, left: 20};
const tableWidth = 1300 - tableMargin.left - tableMargin.right;
const tableHeight = 460 - tableMargin.top - tableMargin.bottom;

const parameterDescriptions = {
  "alpha": "Earnings more than market average.",
  "beta": "Moves with market, shows risk.",
  "sharpe_ratio": "Earnings compared to total risk.",
  "treynor_ratio": "Earnings compared to market risk."
};

const parameterRanges = {
  "alpha": 3,
  "beta": 1,
  "sharpe_ratio": 3,
  "treynor_ratio": 1
};

function updatePerformanceTable(performanceData, dependencies) {
  const { stocksDatabase } = dependencies;
  const performanceTable = d3.select("#performance-table");
  performanceTable.html("");

  performanceTable.append("h2")
    .text("Stock Information")
    .style("margin-bottom", "15px")
    .style("color", "#333")
    .style("font-size", "36px")
    .style("margin-left", "50px");

  if (!performanceData) {
    performanceTable.append("p")
      .text("No performance data available")
      .style("text-align", "center")
      .style("color", "#666")
      .style("font-style", "italic");
    return;
  }

  const benchmarkValues = {
    "alpha": performanceData.market_alpha,
    "beta": performanceData.market_beta,
    "sharpe_ratio": performanceData.market_sharpe_ratio,
    "treynor_ratio": performanceData.market_treynor_ratio 
  };

  const avgRank = stocksDatabase.length / 2;

  const metricsContainer = performanceTable.append("div")
    .style("display", "grid")
    .style("grid-template-columns", "repeat(2, 1fr)")
    .style("grid-gap", "20px")
    .style("max-height", "380px")
    .style("padding-left", "60px")
    .style("padding-right", "60px");

  const currentTicker = d3.select("#searchTicker").property("value").toUpperCase() || "AAPL";

  createMetricCard(metricsContainer, "Alpha", 
    performanceData.alpha, 
    performanceData.alpha_rank, 
    avgRank, 
    stocksDatabase.length,
    "alpha",
    currentTicker,
    benchmarkValues);

  createMetricCard(metricsContainer, "Beta", 
    performanceData.beta, 
    performanceData.beta_rank, 
    avgRank, 
    stocksDatabase.length,
    "beta",
    currentTicker,
    benchmarkValues);

  createMetricCard(metricsContainer, "Sharpe Ratio", 
    performanceData.sharpe_ratio, 
    performanceData.sharpe_ratio_rank, 
    avgRank, 
    stocksDatabase.length,
    "sharpe_ratio",
    currentTicker,
    benchmarkValues);

  createMetricCard(metricsContainer, "Treynor Ratio", 
    performanceData.treynor_ratio, 
    performanceData.treynor_ratio_rank, 
    avgRank, 
    stocksDatabase.length,
    "treynor_ratio",
    currentTicker,
    benchmarkValues);
}

function createMetricCard(container, title, value, rank, avgRank, totalStocks, paramKey, stockTicker, benchmarkValues) {
  value = value || 0;
  rank = rank || 0;

  const isBelowAverage = value < benchmarkValues[paramKey];
  const circleColor = isBelowAverage ? "#EF7C8E" : "#66C2A3";

  const card = container.append("div")
    .style("background-color", "white")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)")
    .style("padding", "15px")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("height", "130px");

  const topRow = card.append("div")
    .style("display", "flex")
    .style("margin-bottom", "10px");

  const circleContainer = topRow.append("div")
    .style("min-width", "60px");

  circleContainer.append("div")
    .style("width", "60px")
    .style("height", "60px")
    .style("border-radius", "50%")
    .style("background-color", circleColor)
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("color", "white")
    .style("font-weight", "bold")
    .style("font-size", "24px")
    .text(rank);

  const textContainer = topRow.append("div")
    .style("margin-left", "15px")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center");

  textContainer.append("div")
    .style("font-size", "20px")
    .style("font-weight", "500")
    .style("color", "black")
    .text(title);

  textContainer.append("div")
    .style("font-size", "16px")
    .style("color", "#D6CDC4")
    .style("margin-top", "3px")
    .text(parameterDescriptions[paramKey]);

  const bottomRow = card.append("div")
    .style("height", "50px")
    .style("position", "relative")
    .style("margin-top", "5px");

  const svgWidth = "100%";
  const svgHeight = 50;

  const svg = bottomRow.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  svg.append("line")
    .attr("x1", "5%")
    .attr("x2", "95%")
    .attr("y1", 25)
    .attr("y2", 25)
    .attr("stroke", "#E9E5E1")
    .attr("stroke-width", 8)
    .attr("stroke-linecap", "round");

  const benchmarkX = "50%";
  const benchmarkValue = benchmarkValues[paramKey];

  svg.append("rect")
    .attr("x", benchmarkX)
    .attr("y", 15)
    .attr("width", 10)
    .attr("height", 20)
    .attr("transform", "translate(-5, 0)")
    .attr("fill", "#A38E79");

  svg.append("text")
    .attr("x", benchmarkX)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", "14px")
    .text("S&P500");

  svg.append("text")
    .attr("x", benchmarkX)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", "14px")
    .text(benchmarkValue.toFixed(1));

  const fixedRange = parameterRanges[paramKey];
  let relativeDiff = value - benchmarkValue;

  if (relativeDiff > fixedRange) {
    relativeDiff = fixedRange;
  } else if (relativeDiff < -fixedRange) {
    relativeDiff = -fixedRange;
  }

  const stockX = `${50 + (relativeDiff / fixedRange) * 40}%`;

  svg.append("line")
    .attr("x1", benchmarkX)
    .attr("x2", stockX)
    .attr("y1", 25)
    .attr("y2", 25)
    .attr("transform", "translate(5, 0)")
    .attr("stroke", isBelowAverage ? "rgba(239, 124, 142, 0.3)" : "rgba(102, 194, 163, 0.3)")
    .attr("stroke-width", 20);

  svg.append("circle")
    .attr("cx", stockX)
    .attr("cy", 25)
    .attr("r", 10)
    .attr("fill", circleColor);

  svg.append("text")
    .attr("x", stockX)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", "14px")
    .text(stockTicker);

  svg.append("text")
    .attr("x", stockX)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", "14px")
    .text(value.toFixed(1));
}

export {
  tableMargin,
  tableWidth,
  tableHeight,
  updatePerformanceTable
};
