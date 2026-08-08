package com.studyassistant.dto;

import jakarta.validation.constraints.NotNull;

public class FlashcardReviewRequest {

    @NotNull(message = "flashcardId is required")
    private Long flashcardId;

    @NotNull(message = "correct is required")
    private Boolean correct;

    public FlashcardReviewRequest() {}

    public FlashcardReviewRequest(Long flashcardId, Boolean correct) {
        this.flashcardId = flashcardId;
        this.correct = correct;
    }

    public Long getFlashcardId() { return flashcardId; }
    public void setFlashcardId(Long flashcardId) { this.flashcardId = flashcardId; }

    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }
}
