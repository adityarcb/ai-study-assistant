package com.studyassistant.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProgressDTO {

    private String noteTitle;
    private int score;
    private int totalQuestions;
    private BigDecimal percentage;
    private LocalDateTime attemptedAt;

    public ProgressDTO() {}

    public ProgressDTO(String noteTitle, int score, int totalQuestions, BigDecimal percentage, LocalDateTime attemptedAt) {
        this.noteTitle = noteTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.attemptedAt = attemptedAt;
    }

    public String getNoteTitle() { return noteTitle; }
    public void setNoteTitle(String noteTitle) { this.noteTitle = noteTitle; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
