import { useState } from "react";
import Timer from "./Timer.jsx";
import "./App.css";

function App() {
  const [startTimer, setStartTimer] = useState(false);

  return (
    <div className="app-container">
      <button onClick={() => setStartTimer(true)}>Start</button>

      <div className="timer-top-right">
        <Timer duration={60} isActive={startTimer} />
      </div>
    </div>

   <div className="app-shell blank-shell">
            <div className="empty-space" aria-hidden="true" />

            <div className="trivia-bar blank-bar">
                <p className="bar-text">Placeholder trivia bar · test copy only</p>
            </div>
        </div>
  );
}

export default App;