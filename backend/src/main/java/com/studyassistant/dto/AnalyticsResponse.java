package com.studyassistant.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsResponse(
    OverallStats overall,
    List<TopicPerformance> topics,
    List<ScoreTrendPoint> trend
) {
    public record OverallStats(
        long totalAttempts,
        BigDecimal averageScore,
        double bestScore,
        double worstScore,
        long topicsAttempted,
        long topicsPassed
    ) {}

    public record TopicPerformance(
        Long noteId,
        String noteTitle,
        double averageScore,
        double bestScore,
        double worstScore,
        long attempts,
        long passed,
        String recommendation
    ) {}

    public record ScoreTrendPoint(
        String date,
        double percentage
    ) {}
}
