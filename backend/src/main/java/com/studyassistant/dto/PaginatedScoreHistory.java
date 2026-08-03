package com.studyassistant.dto;

import java.util.List;

/**
 * Wrapper for a page of ScorePoint results. Mirrors Spring's Page metadata.
 */
public record PaginatedScoreHistory(
        List<ScorePoint> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean last) {}
