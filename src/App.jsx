import { useState } from "react";
import Timer from "./Timer.jsx";
import "./App.css";

function App() {
  const [startTimer, setStartTimer] = useState(false);

  return (
    <div className="app-shell blank-shell">
      <div className="screen-content">
        <header className="hud">
          <button className="start-button" onClick={() => setStartTimer(true)}>
            Start
          </button>

          <div className="timer-slot">
            <Timer duration={60} isActive={startTimer} />
          </div>
        </header>

        <div className="empty-space" aria-hidden="true" />
      </div>

      <div className="trivia-bar blank-bar">
        <p className="bar-text">Placeholder trivia bar · test copy only</p>
      </div>

    </div>
  );
}

export default App;