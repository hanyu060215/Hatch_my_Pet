import React, { useState, useEffect } from "react";
import "./Timer.css";

const Timer = ({ duration = 60, isActive }) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  // If duration changes, reset timer
  useEffect(() => {
    setSecondsLeft(duration);
  }, [duration]);

  // Countdown effect — ONLY runs when isActive = true
  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="timer-container">
      <h1 className="timer">{formatTime(secondsLeft)}</h1>
    </div>
  );
};

export default Timer;