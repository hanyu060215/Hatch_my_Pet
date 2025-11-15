import React from "react";
import "./Progress_bar.css";

const ProgressBar = ({ score = 50, maxScore = 100 }) => {
  const coverPercent = 100 - (score / maxScore) * 100;

  return (
    <div className="progress-bar-container">
      {/* Solid bar color */}
      <div className="progress-bar-color"></div>

      {/* White cover that shrinks */}
      <div
        className="progress-bar-cover"
        style={{ width: `${coverPercent}%` }}
      ></div>

      {/* PNG overlay */}
      <img
        src="/barframe.png"  
        alt="Bar frame"
        className="progress-bar-overlay"
      />
    </div>
  );
};

export default ProgressBar;
