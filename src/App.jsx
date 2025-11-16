import { useCallback, useState } from "react"
import Timer from "./Timer.jsx"
import ProgressBar from "./Progress_bar.jsx"
import TriviaBar from "./Trivia_bar.jsx"
import generateTriviaQuestions from "./questions.json"
import "./App.css"
import "./Trivia_bar.css"

const GAME_STATES = {
  idle: "idle",
  playing: "playing",
  ended: "ended",
}

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.idle)
  const [gameRound, setGameRound] = useState(0)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [endMessage, setEndMessage] = useState("")

  const isPlaying = gameState === GAME_STATES.playing
  const isGameOver = gameState === GAME_STATES.ended
  const currentQuestion = isPlaying ? questions[currentQuestionIndex] ?? null : null
  const hasAnswered = Boolean(selectedOption)
  const hasMoreQuestions = currentQuestionIndex < questions.length - 1
  const totalQuestions = Math.max(questions.length || generateTriviaQuestions.length || 0, 1)

  const resetAnswerState = useCallback(() => {
    setSelectedOption("")
    setIsCorrect(null)
  }, [])

  const fetchQuestions = useCallback(async () => {
    setIsLoadingQuestions(true)
    setQuestionError("")
    try {
      const aiQuestions = Array.isArray(generateTriviaQuestions)
        ? [...generateTriviaQuestions]
        : []
      setQuestions(aiQuestions)
      setCurrentQuestionIndex(0)
      resetAnswerState()
      setCorrectCount(0)
    } catch (error) {
      setQuestionError(error.message ?? "Could not load trivia")
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [resetAnswerState])

  const handleOptionSelect = (option) => {
    if (!isPlaying || !currentQuestion || hasAnswered || isLoadingQuestions) return
    setSelectedOption(option)
    const answeredCorrectly = option === currentQuestion.answer
    setIsCorrect(answeredCorrectly)
    if (answeredCorrectly) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const endGame = useCallback(
    (message = "Great run! Game over.") => {
      setGameState(GAME_STATES.ended)
      setEndMessage(message)
      resetAnswerState()
    },
    [resetAnswerState]
  )

  const handleStart = () => {
    if (isPlaying) return
    setGameState(GAME_STATES.playing)
    setEndMessage("")
    setGameRound((prev) => prev + 1)
    setQuestions([])
    setCurrentQuestionIndex(0)
    resetAnswerState()
    setCorrectCount(0)
    fetchQuestions()
  }

  const handleNextQuestion = () => {
    if (!hasAnswered) return
    if (hasMoreQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1)
      resetAnswerState()
    } else {
      endGame("Mission complete! You finished every question.")
    }
  }

  const handleManualEndGame = () => {
    endGame("Nice work! You wrapped up this round.")
  }

  const handleTimeExpired = () => {
    if (!isPlaying) return
    endGame("Time's up! Thanks for playing.")
  }

  const startButtonLabel = isPlaying ? "Timer running" : isGameOver ? "Play again" : "Start"

  const shouldShowTrivia = isPlaying && currentQuestion

  const petStageImage = (() => {
    if (correctCount >= 5) return "/lv4.png"
    if (correctCount >= 4) return "/lv3.png"
    if (correctCount >= 3) return "/lv2.png"
    if (correctCount >= 2) return "/egg5.png"
    if (correctCount >= 1) return "/egg3.png"
    return "/egg1.png"
  })()

  return (
    <div className="app-shell" style={{ "--pet-bg-image": `url(${petStageImage})` }}>
      <div className="screen-content">
        <div className="hud">
          <ProgressBar score={correctCount} maxScore={totalQuestions} />
          <Timer key={gameRound} duration={60} isActive={isPlaying} onComplete={handleTimeExpired} />
        </div>

        <button className="start-button" onClick={handleStart} disabled={isPlaying}>
          {startButtonLabel}
        </button>

      </div>

      {shouldShowTrivia ? (
        <TriviaBar
          question={currentQuestion}
          loading={isLoadingQuestions}
          error={questionError}
          onSelectOption={handleOptionSelect}
          selectedOption={selectedOption}
          isCorrect={isCorrect}
          hasAnswered={hasAnswered}
          hasMoreQuestions={hasMoreQuestions}
          onNext={handleNextQuestion}
          onEndGame={handleManualEndGame}
        />
      ) : (
        <div className="trivia-placeholder">
          <p className="placeholder-eyebrow">
            {isGameOver ? "Game over" : isPlaying ? "Preparing trivia" : "Trivia challenge"}
          </p>
          {isGameOver ? (
            <>
              <p className="placeholder-body">{endMessage}</p>
              <p className="placeholder-subtext">Score: {correctCount}/{totalQuestions}</p>
              <p className="placeholder-subtext">Press Play again to launch another round.</p>
            </>
          ) : isPlaying ? (
            <>
              <p className="placeholder-body">
                {questionError ? "We hit a glitch fetching your question." : "Summoning your first cosmic question…"}
              </p>
              {questionError && (
                <button className="placeholder-action" onClick={fetchQuestions} disabled={isLoadingQuestions}>
                  {isLoadingQuestions ? "Retrying…" : "Try again"}
                </button>
              )}
            </>
          ) : (
            <p className="placeholder-body">Tap Start to reveal your first cosmic question.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App