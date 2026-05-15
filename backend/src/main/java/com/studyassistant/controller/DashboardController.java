package com.studyassistant.controller;

import com.studyassistant.service.NoteService;
import com.studyassistant.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics")
public class DashboardController {

    private final NoteService noteService;
    private final QuizService quizService;

    public DashboardController(NoteService noteService, QuizService quizService) {
        this.noteService = noteService;
        this.quizService = quizService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics for the authenticated student")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNotes", noteService.countStudentNotes(email));
        stats.put("totalQuizzes", quizService.countStudentAttempts(email));
        stats.put("averageScore", quizService.getAverageScore(email));
        return ResponseEntity.ok(stats);
    }
}
