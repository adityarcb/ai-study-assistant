package com.studyassistant.repository;

import com.studyassistant.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Note> findTop5ByStudentIdOrderByCreatedAtDesc(Long studentId);
    long countByStudentId(Long studentId);
}
