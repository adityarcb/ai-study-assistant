package com.studyassistant.repository;

import com.studyassistant.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderByAttemptedAtDesc(Long studentId);
    List<QuizAttempt> findByStudentIdOrderByAttemptedAtAsc(Long studentId);
    long countByStudentId(Long studentId);

    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.student.id = :studentId")
    Double findAveragePercentageByStudentId(@Param("studentId") Long studentId);
}
