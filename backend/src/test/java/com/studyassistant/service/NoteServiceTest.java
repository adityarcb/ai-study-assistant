package com.studyassistant.service;

import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.Note;
import com.studyassistant.model.Student;
import com.studyassistant.repository.FlashcardRepository;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.QuizQuestionRepository;
import com.studyassistant.repository.QuizRepository;
import com.studyassistant.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock private NoteRepository noteRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private FlashcardRepository flashcardRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @InjectMocks private NoteService noteService;

    private Student owner;
    private Student other;
    private Note note;

    @BeforeEach
    void setUp() {
        owner = new Student("Owner", "owner@example.com", "pass");
        owner.setId(1L);
        other = new Student("Other", "other@example.com", "pass");
        other.setId(2L);
        note = new Note(owner, "My Note", "content");
        note.setId(10L);
    }

    @Test
    @DisplayName("Owner can fetch their own note")
    void ownerCanFetchOwnNote() {
        when(studentRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(noteRepository.findByIdAndStudentId(10L, 1L)).thenReturn(Optional.of(note));

        Note result = noteService.getNoteById(10L, "owner@example.com");

        assertEquals(10L, result.getId());
        assertEquals("My Note", result.getTitle());
    }

    @Test
    @DisplayName("Another student cannot fetch someone else's note - ResourceNotFoundException")
    void otherStudentCannotFetchNote() {
        when(studentRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));
        when(noteRepository.findByIdAndStudentId(10L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.getNoteById(10L, "other@example.com"));
    }

    @Test
    @DisplayName("Another student cannot read someone else's study materials - ResourceNotFoundException")
    void otherStudentCannotReadStudyMaterials() {
        when(studentRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));
        when(noteRepository.findByIdAndStudentId(10L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.getStoredStudyMaterials(10L, "other@example.com"));
    }

    @Test
    @DisplayName("Unknown email throws ResourceNotFoundException")
    void unknownEmailThrows() {
        when(studentRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.getNoteById(10L, "ghost@example.com"));
    }
}