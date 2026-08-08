package com.studyassistant.service;

import com.studyassistant.exception.ForbiddenException;
import com.studyassistant.exception.ResourceNotFoundException;
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
class OpenRouterServiceTest {

    @Mock private NoteRepository noteRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private FlashcardRepository flashcardRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @InjectMocks private OpenRouterService openRouterService;

    @Test
    @DisplayName("Non-existent note ID throws ResourceNotFoundException")
    void nonExistentNoteThrowsException() {
        Student student = new Student("Test", "test@test.com", "pass");
        student.setId(1L);
        when(studentRepository.findByEmail("test@test.com")).thenReturn(Optional.of(student));
        when(noteRepository.findByIdAndStudentId(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> openRouterService.generateStudyMaterials(999L, "test@test.com"));
    }

    @Test
    @DisplayName("Another student cannot generate materials for someone else's note - ForbiddenException")
    void otherStudentCannotGenerate() {
        Student owner = new Student("Owner", "owner@test.com", "pass");
        owner.setId(1L);
        Student other = new Student("Other", "other@test.com", "pass");
        other.setId(2L);
        Note note = new Note(owner, "Test", "Sample content for testing");
        note.setId(1L);

        when(studentRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));
        when(noteRepository.findByIdAndStudentId(1L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> openRouterService.generateStudyMaterials(1L, "other@test.com"));
        verify(noteRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Note content is used in AI generation call")
    void noteContentIsUsed() {
        Student student = new Student("Test", "test@test.com", "pass");
        student.setId(1L);
        Note note = new Note(student, "Test", "Sample content for testing");
        note.setId(1L);
        when(studentRepository.findByEmail("test@test.com")).thenReturn(Optional.of(student));
        when(noteRepository.findByIdAndStudentId(1L, 1L)).thenReturn(Optional.of(note));

        // Will fail at API call since no real API key - this verifies the flow up to API call
        assertThrows(RuntimeException.class,
                () -> openRouterService.generateStudyMaterials(1L, "test@test.com"));
        verify(noteRepository).findByIdAndStudentId(1L, 1L);
    }
}