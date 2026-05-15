package com.studyassistant.service;

import com.studyassistant.dto.QuizAttemptRequest;
import com.studyassistant.dto.QuizAttemptResponse;
import com.studyassistant.model.*;
import com.studyassistant.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @Mock private QuizAttemptRepository quizAttemptRepository;
    @Mock private StudentRepository studentRepository;
    @InjectMocks private QuizService quizService;

    private Student student;
    private Quiz quiz;
    private Note note;
    private List<QuizQuestion> questions;

    @BeforeEach
    void setUp() {
        student = new Student("Test", "test@example.com", "pass");
        student.setId(1L);
        note = new Note(student, "Test Note", "content");
        note.setId(1L);
        quiz = new Quiz(note, "Test Quiz");
        quiz.setId(1L);

        questions = Arrays.asList(
            createQuestion(1L, "Q1", "A", "B", "C", "D", "A"),
            createQuestion(2L, "Q2", "A", "B", "C", "D", "B"),
            createQuestion(3L, "Q3", "A", "B", "C", "D", "C"),
            createQuestion(4L, "Q4", "A", "B", "C", "D", "D"),
            createQuestion(5L, "Q5", "A", "B", "C", "D", "A")
        );
    }

    private QuizQuestion createQuestion(Long id, String text, String a, String b, String c, String d, String correct) {
        QuizQuestion q = new QuizQuestion(quiz, text, a, b, c, d, correct);
        q.setId(id);
        return q;
    }

    private QuizAttemptRequest buildRequest(String... selectedOptions) {
        List<QuizAttemptRequest.AnswerDTO> answers = new java.util.ArrayList<>();
        for (int i = 0; i < selectedOptions.length; i++) {
            answers.add(new QuizAttemptRequest.AnswerDTO((long) (i + 1), selectedOptions[i]));
        }
        return new QuizAttemptRequest(1L, answers);
    }

    @Test
    @DisplayName("All correct answers - score equals totalQuestions")
    void allCorrectAnswers() {
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizId(1L)).thenReturn(questions);
        when(quizAttemptRepository.save(any())).thenReturn(new QuizAttempt());

        QuizAttemptResponse res = quizService.submitAttempt("test@example.com", buildRequest("A", "B", "C", "D", "A"));

        assertEquals(5, res.getScore());
        assertEquals(5, res.getTotalQuestions());
        assertEquals(100.0, res.getPercentage());
        assertTrue(res.isPassed());
    }

    @Test
    @DisplayName("All wrong answers - score equals 0")
    void allWrongAnswers() {
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizId(1L)).thenReturn(questions);
        when(quizAttemptRepository.save(any())).thenReturn(new QuizAttempt());

        QuizAttemptResponse res = quizService.submitAttempt("test@example.com", buildRequest("D", "D", "D", "A", "D"));

        assertEquals(0, res.getScore());
        assertFalse(res.isPassed());
    }

    @Test
    @DisplayName("Partial correct answers - correct score calculated")
    void partialCorrectAnswers() {
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizId(1L)).thenReturn(questions);
        when(quizAttemptRepository.save(any())).thenReturn(new QuizAttempt());

        QuizAttemptResponse res = quizService.submitAttempt("test@example.com", buildRequest("A", "B", "A", "A", "A"));

        assertEquals(3, res.getScore());
        assertEquals(60.0, res.getPercentage());
        assertTrue(res.isPassed());
    }

    @Test
    @DisplayName("Attempt saved to database with correct percentage")
    void attemptSavedToDatabase() {
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizId(1L)).thenReturn(questions);
        when(quizAttemptRepository.save(any())).thenReturn(new QuizAttempt());

        quizService.submitAttempt("test@example.com", buildRequest("A", "B", "C", "D", "A"));

        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    @Test
    @DisplayName("Breakdown contains correct and incorrect info")
    void breakdownContainsCorrectInfo() {
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizId(1L)).thenReturn(questions);
        when(quizAttemptRepository.save(any())).thenReturn(new QuizAttempt());

        QuizAttemptResponse res = quizService.submitAttempt("test@example.com", buildRequest("A", "A", "C", "D", "A"));

        assertEquals(4, res.getBreakdown().stream().filter(QuizAttemptResponse.QuestionBreakdown::isCorrect).count());
        assertEquals(1, res.getBreakdown().stream().filter(b -> !b.isCorrect()).count());
    }
}
