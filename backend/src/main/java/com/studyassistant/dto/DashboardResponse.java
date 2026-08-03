package com.studyassistant.dto;

/**
 * DTO returned by the Dashboard endpoint. Contains aggregated statistics for a student.
 */
public record DashboardResponse(
        long totalQuizzes,
        java.math.BigDecimal averageScore,
        PaginatedScoreHistory scoreHistory,
        long totalFlashcards) {}
