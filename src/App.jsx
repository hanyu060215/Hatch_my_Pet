import { useState } from "react";
import Timer from "./Timer.jsx";
import Progress_bar from "./Progress_bar.jsx"; 
import "./Trivia_bar.css";
import "./App.css";

function App() {
  const [startTimer, setStartTimer] = useState(false);

  return (
    <div className="app-shell">
      <div className="screen-content">
        <div className="hud">
            <Progress_bar score={90} maxScore={100} />
            <Timer duration={60} isActive={startTimer} />
        </div>

            
            <button className="start-button" onClick={() => setStartTimer(true)}>
                Start
            </button>
      </div>

      <div className="trivia-bar">
        <p className="bar-text">Placeholder trivia bar · test copy only</p>
      </div>
    </div>
  );
}

export default App;