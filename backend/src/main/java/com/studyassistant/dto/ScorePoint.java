package com.studyassistant.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Simple immutable record representing a single score data point.
 */
public record ScorePoint(LocalDate date, BigDecimal percentage) {}
