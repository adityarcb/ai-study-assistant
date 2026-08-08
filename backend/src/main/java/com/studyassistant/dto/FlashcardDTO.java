package com.studyassistant.dto;

import java.time.LocalDateTime;

public class FlashcardDTO {

    private Long id;
    private String question;
    private String answer;
    private Integer boxLevel;
    private LocalDateTime nextReviewDate;

    public FlashcardDTO() {}

    public FlashcardDTO(Long id, String question, String answer) {
        this.id = id;
        this.question = question;
        this.answer = answer;
    }

    public FlashcardDTO(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public FlashcardDTO(Long id, String question, String answer, Integer boxLevel, LocalDateTime nextReviewDate) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.boxLevel = boxLevel;
        this.nextReviewDate = nextReviewDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public Integer getBoxLevel() { return boxLevel; }
    public void setBoxLevel(Integer boxLevel) { this.boxLevel = boxLevel; }

    public LocalDateTime getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDateTime nextReviewDate) { this.nextReviewDate = nextReviewDate; }
}
