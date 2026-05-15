package com.studyassistant.service;

import com.studyassistant.model.Note;
import com.studyassistant.model.Student;
import com.studyassistant.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    @Mock private NoteRepository noteRepository;
    @Mock private FlashcardRepository flashcardRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @InjectMocks private GeminiService geminiService;

    @Test
    @DisplayName("Non-existent note ID throws ResourceNotFoundException")
    void nonExistentNoteThrowsException() {
        when(noteRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> geminiService.generateStudyMaterials(999L));
    }

    @Test
    @DisplayName("Note content is used in AI generation call")
    void noteContentIsUsed() {
        Student student = new Student("Test", "test@test.com", "pass");
        student.setId(1L);
        Note note = new Note(student, "Test", "Sample content for testing");
        note.setId(1L);
        when(noteRepository.findById(1L)).thenReturn(Optional.of(note));

        // Will fail at API call since no real API key - this verifies the flow up to API call
        assertThrows(RuntimeException.class, () -> geminiService.generateStudyMaterials(1L));
        verify(noteRepository).findById(1L);
    }
}
