package com.studyassistant.controller;

import com.studyassistant.dto.QuizAttemptRequest;
import com.studyassistant.dto.QuizAttemptResponse;
import com.studyassistant.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@Tag(name = "Quiz", description = "Quiz attempt and history endpoints")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/attempt")
    @Operation(summary = "Submit a quiz attempt with answers")
    public ResponseEntity<QuizAttemptResponse> submitAttempt(
            @RequestBody QuizAttemptRequest request,
            Authentication authentication) {
        QuizAttemptResponse response = quizService.submitAttempt(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @Operation(summary = "Get quiz attempt history for the authenticated student")
    public ResponseEntity<List<Map<String, Object>>> getHistory(Authentication authentication) {
        List<Map<String, Object>> history = quizService.getQuizHistory(authentication.getName());
        return ResponseEntity.ok(history);
    }
}
