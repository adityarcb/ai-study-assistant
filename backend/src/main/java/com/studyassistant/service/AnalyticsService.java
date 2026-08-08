package com.studyassistant.service;

import com.studyassistant.dto.AnalyticsResponse;
import com.studyassistant.model.QuizAttempt;
import com.studyassistant.model.Student;
import com.studyassistant.repository.QuizAttemptRepository;
import com.studyassistant.repository.StudentRepository;
import com.studyassistant.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    private static final double PASS_THRESHOLD = 70.0;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;

    public AnalyticsService(QuizAttemptRepository quizAttemptRepository, StudentRepository studentRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
    }

    public AnalyticsResponse getAnalytics(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdOrderByAttemptedAtAsc(student.getId());

        Map<Long, List<QuizAttempt>> byTopic = new LinkedHashMap<>();
        List<AnalyticsResponse.ScoreTrendPoint> trend = new ArrayList<>();
        double runningSum = 0;
        int runningCount = 0;

        for (QuizAttempt attempt : attempts) {
            byTopic.computeIfAbsent(attempt.getQuiz().getNote().getId(), k -> new ArrayList<>())
                    .add(attempt);

            double pct = attempt.getPercentage() != null ? attempt.getPercentage().doubleValue() : 0;
            runningSum += pct;
            runningCount++;
            String date = attempt.getAttemptedAt() != null
                    ? attempt.getAttemptedAt().toLocalDate().format(DATE_FMT)
                    : LocalDate.now().format(DATE_FMT);
            trend.add(new AnalyticsResponse.ScoreTrendPoint(date, round(runningSum / runningCount)));
        }

        List<AnalyticsResponse.TopicPerformance> topics = new ArrayList<>();
        long passedTopics = 0;
        for (Map.Entry<Long, List<QuizAttempt>> entry : byTopic.entrySet()) {
            List<QuizAttempt> topicAttempts = entry.getValue();
            double best = topicAttempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).max().orElse(0);
            double worst = topicAttempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).min().orElse(0);
            double avg = topicAttempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).average().orElse(0);
            long passed = topicAttempts.stream().filter(a -> a.getPercentage().doubleValue() >= PASS_THRESHOLD).count();

            if (avg >= PASS_THRESHOLD) passedTopics++;

            topics.add(new AnalyticsResponse.TopicPerformance(
                    entry.getKey(),
                    entry.getValue().get(0).getQuiz().getNote().getTitle(),
                    round(avg),
                    best,
                    worst,
                    topicAttempts.size(),
                    passed,
                    recommend(avg, worst)
            ));
        }

        double overallAvg = attempts.isEmpty() ? 0 : runningSum / runningCount;
        double overallBest = attempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).max().orElse(0);
        double overallWorst = attempts.isEmpty() ? 0 : attempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).min().orElse(0);

        AnalyticsResponse.OverallStats overall = new AnalyticsResponse.OverallStats(
                attempts.size(),
                BigDecimal.valueOf(overallAvg).setScale(1, RoundingMode.HALF_UP),
                round(overallBest),
                round(overallWorst),
                topics.size(),
                passedTopics
        );

        return new AnalyticsResponse(overall, topics, trend);
    }

    private String recommend(double avg, double worst) {
        if (avg >= 85) return "Mastered — great job, move on to a new topic";
        if (avg >= PASS_THRESHOLD) return "Solid — a quick review will keep it fresh";
        if (worst < 50) return "Needs work — re-study the weakest quiz and retake it";
        return "Keep practicing — retake the quiz to improve";
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
