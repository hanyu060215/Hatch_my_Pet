import React from "react";
import "./Progress_bar.css";

const Progress_bar = ({ score = 0, maxScore = 100 }) => {
  const percent = Math.min(100, (score / maxScore) * 100);

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default Progress_bar;
