export default function QuizQuestion({ question, selectedOption, onSelect, showResult, correctOption }) {
  const options = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ];

  const getOptionClass = (optionKey) => {
    if (!showResult) {
      return selectedOption === optionKey ? 'quiz-option selected' : 'quiz-option';
    }
    if (optionKey === correctOption) return 'quiz-option correct';
    if (optionKey === selectedOption && selectedOption !== correctOption) return 'quiz-option incorrect';
    return 'quiz-option opacity-50';
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-surface-100 mb-6 leading-relaxed">
        {question.questionText}
      </h3>

      <div className="grid gap-3">
        {options.map(({ key, text }) => (
          <button
            key={key}
            onClick={() => !showResult && onSelect(key)}
            disabled={showResult}
            className={getOptionClass(key)}
          >
            <div className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                selectedOption === key && !showResult
                  ? 'bg-primary-500 text-white'
                  : showResult && key === correctOption
                  ? 'bg-emerald-500 text-white'
                  : showResult && key === selectedOption
                  ? 'bg-rose-500 text-white'
                  : 'bg-surface-700/50 text-surface-300'
              }`}>
                {key}
              </span>
              <span className="pt-1">{text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
