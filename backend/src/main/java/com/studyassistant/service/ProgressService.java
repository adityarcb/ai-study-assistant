package com.studyassistant.service;

import com.studyassistant.dto.ProgressDTO;
import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.QuizAttempt;
import com.studyassistant.model.Student;
import com.studyassistant.repository.QuizAttemptRepository;
import com.studyassistant.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;

    public ProgressService(QuizAttemptRepository quizAttemptRepository, StudentRepository studentRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
    }

    public List<ProgressDTO> getProgress(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdOrderByAttemptedAtAsc(student.getId());

        return attempts.stream().map(attempt -> new ProgressDTO(
                attempt.getQuiz().getNote().getTitle(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                attempt.getPercentage(),
                attempt.getAttemptedAt()
        )).collect(Collectors.toList());
    }
}
