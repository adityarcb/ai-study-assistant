package com.studyassistant.dto;

import java.util.List;

public class GenerateResponse {

    private String summary;
    private List<FlashcardDTO> flashcards;
    private Long quizId;
    private List<QuizQuestionDTO> questions;

    public GenerateResponse() {}

    public GenerateResponse(String summary, List<FlashcardDTO> flashcards, Long quizId, List<QuizQuestionDTO> questions) {
        this.summary = summary;
        this.flashcards = flashcards;
        this.quizId = quizId;
        this.questions = questions;
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<FlashcardDTO> getFlashcards() { return flashcards; }
    public void setFlashcards(List<FlashcardDTO> flashcards) { this.flashcards = flashcards; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public List<QuizQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionDTO> questions) { this.questions = questions; }
}
