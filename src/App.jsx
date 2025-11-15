import { useState } from "react";
import Timer from "./Timer.jsx";
import "./Trivia_bar.css";
import "./App.css";

function App() {
  const [startTimer, setStartTimer] = useState(false);

  return (
    <div className="app-shell">
      <div className="screen-content">
        <div className="hud">
            <button className="start-button" onClick={() => setStartTimer(true)}>
                Start
            </button>
        </div>

          <div className="timer">
            <Timer duration={60} isActive={startTimer} />
          </div>
        </header>
      </div>

      <div className="trivia-bar">
        <p className="bar-text">Placeholder trivia bar · test copy only</p>
      </div>

    </div>
  );
}

export default App;