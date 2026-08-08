package com.studyassistant.service;

import com.studyassistant.dto.FlashcardDTO;
import com.studyassistant.exception.ForbiddenException;
import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.Flashcard;
import com.studyassistant.model.Student;
import com.studyassistant.repository.FlashcardRepository;
import com.studyassistant.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SpacedRepetitionService {

    private static final int MAX_BOX = 5;

    // Each box N has a review interval of 2^(N-1) days: 1, 2, 4, 8, 16
    private static final int[] INTERVAL_DAYS = {1, 2, 4, 8, 16};

    private final FlashcardRepository flashcardRepository;
    private final StudentRepository studentRepository;

    public SpacedRepetitionService(FlashcardRepository flashcardRepository, StudentRepository studentRepository) {
        this.flashcardRepository = flashcardRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Leitner box algorithm:
     * - Correct answer  -> move card up one box (max 5)
     * - Wrong answer    -> move card back to box 1
     * - Next review date = now + 2^(box-1) days
     */
    @Transactional
    public FlashcardDTO reviewFlashcard(String email, Long flashcardId, boolean correct) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard not found with id: " + flashcardId));

        if (!flashcard.getNote().getStudent().getId().equals(student.getId())) {
            throw new ForbiddenException("You do not have access to this flashcard");
        }

        int currentBox = flashcard.getBoxLevel() != null ? flashcard.getBoxLevel() : 1;
        int newBox;
        if (correct) {
            newBox = Math.min(currentBox + 1, MAX_BOX);
        } else {
            newBox = 1;
        }

        flashcard.setBoxLevel(newBox);
        flashcard.setNextReviewDate(LocalDateTime.now().plusDays(INTERVAL_DAYS[newBox - 1]));
        flashcardRepository.save(flashcard);

        return toDTO(flashcard);
    }

    public List<FlashcardDTO> getDueFlashcards(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return flashcardRepository.findDueForStudent(student.getId(), LocalDateTime.now())
                .stream().map(this::toDTO).toList();
    }

    private FlashcardDTO toDTO(Flashcard fc) {
        return new FlashcardDTO(fc.getId(), fc.getQuestion(), fc.getAnswer(), fc.getBoxLevel(), fc.getNextReviewDate());
    }
}
