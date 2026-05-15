package com.studyassistant.controller;

import com.studyassistant.dto.GenerateResponse;
import com.studyassistant.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study")
@Tag(name = "Study", description = "AI-powered study material generation")
public class StudyController {

    private final GeminiService geminiService;

    public StudyController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate summary, flashcards, and quiz from a note using Gemini AI")
    public ResponseEntity<GenerateResponse> generateStudyMaterials(@RequestBody Map<String, Long> request) {
        Long noteId = request.get("noteId");
        if (noteId == null) {
            throw new IllegalArgumentException("noteId is required");
        }
        GenerateResponse response = geminiService.generateStudyMaterials(noteId);
        return ResponseEntity.ok(response);
    }
}
