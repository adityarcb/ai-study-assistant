package com.studyassistant.repository;

import com.studyassistant.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByNoteId(Long noteId);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.note.student.id = :studentId")
    long countByStudentId(@Param("studentId") Long studentId);
}
