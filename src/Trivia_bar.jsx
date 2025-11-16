import PropTypes from "prop-types"
import "./Trivia_bar.css"

const TriviaBar = ({
  question = null,
  loading = false,
  error = "",
  onSelectOption = () => {},
  selectedOption = "",
  isCorrect = null,
  onNext = () => {},
  hasAnswered = false,
  hasMoreQuestions = false,
  onEndGame = () => {},
}) => {
  const disabled = loading || !question

  return (
    <div className="trivia-bar">
      <div className="bar-header">
        <div>
          <p className="eyebrow">Trivia challenge</p>
          <h4>{question ? question.category : "Preparing next prompt"}</h4>
        </div>
        
      </div>

      {error && <p className="bar-error">{error}</p>}

      {!error && (
        <div className="question-panel" aria-live="polite">
          {!question && loading && <p className="bar-text">Summoning your next question…</p>}
          {!question && !loading && <p className="bar-text">Preparing your question…</p>}

          {question && (
            <article className="question-card">
              <div className="card-meta">
                <span className="chip difficulty">{question.difficulty}</span>
                <span className="chip category">{question.category}</span>
              </div>
              <div className="card-body">
                <p className="card-question">{question.question}</p>

                <div className="options-grid">
                  {question.options?.map((option) => {
                    const isSelected = selectedOption === option
                    const showState = hasAnswered && isSelected
                    const isRightChoice = hasAnswered && option === question.answer
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`option-chip${isSelected ? ' selected' : ''}${isRightChoice ? ' correct' : ''}${
                          showState && !isRightChoice ? ' incorrect' : ''
                        }`}
                        onClick={() => onSelectOption(option)}
                        disabled={disabled || hasAnswered}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                {hasAnswered && (
                  <p className={`answer-feedback ${isCorrect ? 'success' : 'error'}`}>
                    {isCorrect ? 'Nice! That‘s correct ✔️' : `Not quite. The answer is ${question.answer}.`}
                  </p>
                )}
              </div>

              <div className="question-actions">
                <button
                  className="refresh-button primary"
                  onClick={hasMoreQuestions ? onNext : onEndGame}
                  disabled={!hasAnswered || loading}
                >
                  {hasMoreQuestions ? 'Next question' : 'End game'}
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  )
}

TriviaBar.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    question: PropTypes.string,
    category: PropTypes.string,
    difficulty: PropTypes.string,
    answer: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelectOption: PropTypes.func,
  selectedOption: PropTypes.string,
  isCorrect: PropTypes.bool,
  onNext: PropTypes.func,
  hasAnswered: PropTypes.bool,
  hasMoreQuestions: PropTypes.bool,
  onEndGame: PropTypes.func,
}

export default TriviaBar