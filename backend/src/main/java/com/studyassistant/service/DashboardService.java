package com.studyassistant.service;

import com.studyassistant.dto.DashboardResponse;
import com.studyassistant.dto.ScorePoint;
import com.studyassistant.dto.PaginatedScoreHistory;
import com.studyassistant.model.QuizAttempt;
import com.studyassistant.repository.FlashcardRepository;
import com.studyassistant.repository.QuizAttemptRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final FlashcardRepository flashcardRepository;

    public DashboardService(QuizAttemptRepository quizAttemptRepository, FlashcardRepository flashcardRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.flashcardRepository = flashcardRepository;
    }

    /**
     * Retrieves aggregated dashboard data for a given student.
     *
     * @param studentId the ID of the authenticated student
     * @param pageable  pagination parameters for the score history (page, size)
     * @return DashboardResponse containing totals and paginated score history
     */
    public DashboardResponse getDashboard(Long studentId, Pageable pageable) {
        long totalQuizzes = quizAttemptRepository.countByStudentId(studentId);
        Double avg = quizAttemptRepository.findAveragePercentageByStudentId(studentId);
        java.math.BigDecimal averageScore = avg != null
                ? java.math.BigDecimal.valueOf(avg).setScale(2, java.math.RoundingMode.HALF_UP)
                : java.math.BigDecimal.ZERO;

        Page<QuizAttempt> attemptPage = quizAttemptRepository.findAttemptsByStudentIdPaged(studentId, pageable);
        List<ScorePoint> scorePoints = attemptPage.getContent().stream()
                .map(a -> new ScorePoint(a.getAttemptedAt().toLocalDate(), a.getPercentage()))
                .collect(java.util.stream.Collectors.toList());

        PaginatedScoreHistory paginatedScoreHistory = new PaginatedScoreHistory(
                scorePoints,
                attemptPage.getNumber(),
                attemptPage.getSize(),
                attemptPage.getTotalElements(),
                attemptPage.getTotalPages(),
                attemptPage.isLast()
        );
        long totalFlashcards = flashcardRepository.countByStudentId(studentId);
        return new DashboardResponse(totalQuizzes, averageScore, paginatedScoreHistory, totalFlashcards);
    }
}
