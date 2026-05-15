package com.studyassistant.service;

import com.studyassistant.dto.QuizAttemptRequest;
import com.studyassistant.dto.QuizAttemptResponse;
import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.*;
import com.studyassistant.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;

    public QuizService(QuizRepository quizRepository, QuizQuestionRepository quizQuestionRepository,
                       QuizAttemptRepository quizAttemptRepository, StudentRepository studentRepository) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
    }

    public QuizAttemptResponse submitAttempt(String email, QuizAttemptRequest request) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quiz.getId());

        // Build a map of questionId -> correctOption
        Map<Long, String> correctAnswers = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, QuizQuestion::getCorrectOption));

        int score = 0;
        List<QuizAttemptResponse.QuestionBreakdown> breakdown = new ArrayList<>();

        for (QuizAttemptRequest.AnswerDTO answer : request.getAnswers()) {
            String correctOption = correctAnswers.get(answer.getQuestionId());
            boolean isCorrect = correctOption != null &&
                    correctOption.equalsIgnoreCase(answer.getSelectedOption());

            if (isCorrect) {
                score++;
            }

            breakdown.add(new QuizAttemptResponse.QuestionBreakdown(
                    answer.getQuestionId(),
                    answer.getSelectedOption(),
                    correctOption != null ? correctOption : "N/A",
                    isCorrect
            ));
        }

        int totalQuestions = questions.size();
        double percentage = totalQuestions > 0 ? (double) score / totalQuestions * 100 : 0;
        BigDecimal percentBD = BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP);

        // Save attempt
        QuizAttempt attempt = new QuizAttempt(student, quiz, score, totalQuestions, percentBD);
        quizAttemptRepository.save(attempt);

        boolean passed = percentage >= 60.0;

        return new QuizAttemptResponse(score, totalQuestions, percentage, passed, breakdown);
    }

    public List<Map<String, Object>> getQuizHistory(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdOrderByAttemptedAtDesc(student.getId());

        return attempts.stream().map(attempt -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("quizId", attempt.getQuiz().getId());
            map.put("noteTitle", attempt.getQuiz().getNote().getTitle());
            map.put("score", attempt.getScore());
            map.put("totalQuestions", attempt.getTotalQuestions());
            map.put("percentage", attempt.getPercentage());
            map.put("attemptedAt", attempt.getAttemptedAt());
            return map;
        }).collect(Collectors.toList());
    }

    public long countStudentAttempts(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return quizAttemptRepository.countByStudentId(student.getId());
    }

    public Double getAverageScore(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Double avg = quizAttemptRepository.findAveragePercentageByStudentId(student.getId());
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }
}
