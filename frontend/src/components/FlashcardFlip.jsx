import { useState } from 'react';

export default function FlashcardFlip({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <p className="text-surface-400 text-center">No flashcards available.</p>;
  }

  const card = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card counter */}
      <div className="flex items-center gap-2 text-surface-400 text-sm">
        <span className="px-3 py-1 bg-surface-700/50 rounded-full">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        className="flashcard-container cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-front">
            <div>
              <div className="text-xs uppercase tracking-wider text-primary-300/60 mb-4 font-semibold">Question</div>
              <p className="text-lg">{card.question}</p>
              <div className="mt-4 text-xs text-primary-300/40">Click to reveal answer</div>
            </div>
          </div>
          <div className="flashcard-back">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-300/60 mb-4 font-semibold">Answer</div>
              <p className="text-lg">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-700/50 border border-surface-600/50 text-surface-300 hover:text-white hover:bg-surface-600/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {flashcards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIsFlipped(false); setCurrentIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-primary-500 w-6' : 'bg-surface-600 hover:bg-surface-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-700/50 border border-surface-600/50 text-surface-300 hover:text-white hover:bg-surface-600/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
