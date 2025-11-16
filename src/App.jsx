import { useCallback, useEffect, useState } from "react"
import Timer from "./Timer.jsx"
import ProgressBar from "./Progress_bar.jsx"
import TriviaBar from "./Trivia_bar.jsx"
import generateTriviaQuestions from "./questions.json"
import "./App.css"
import "./Trivia_bar.css"

function App() {
  const [startTimer, setStartTimer] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState("")

  const currentQuestion = questions[currentQuestionIndex] ?? null
  const hasAnswered = Boolean(selectedOption)
  const hasMoreQuestions = currentQuestionIndex < questions.length - 1

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
    } catch (error) {
      setQuestionError(error.message ?? "Could not load AI trivia")
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [resetAnswerState])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleOptionSelect = (option) => {
    if (!currentQuestion || hasAnswered || isLoadingQuestions) return
    setSelectedOption(option)
    setIsCorrect(option === currentQuestion.answer)
  }

  const handleNextQuestion = () => {
    if (!hasAnswered) return
    if (hasMoreQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1)
      resetAnswerState()
    } else {
      resetAnswerState()
      fetchQuestions()
    }
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <div className="hud">
          <ProgressBar score={90} maxScore={100} />
          <Timer duration={60} isActive={startTimer} />
        </div>

        <button className="start-button" onClick={() => setStartTimer(true)}>
          {startTimer ? "Timer running" : "Start"}
        </button>
      </div>

      <TriviaBar
        question={currentQuestion}
        loading={isLoadingQuestions}
        error={questionError}
        onRefresh={fetchQuestions}
        onSelectOption={handleOptionSelect}
        selectedOption={selectedOption}
        isCorrect={isCorrect}
        hasAnswered={hasAnswered}
        hasMoreQuestions={hasMoreQuestions}
        onNext={handleNextQuestion}
      />
    </div>
  )
}

export default App