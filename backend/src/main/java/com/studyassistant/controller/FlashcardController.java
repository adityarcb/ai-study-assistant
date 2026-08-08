package com.studyassistant.controller;

import com.studyassistant.dto.FlashcardDTO;
import com.studyassistant.dto.FlashcardReviewRequest;
import com.studyassistant.service.SpacedRepetitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@Tag(name = "Flashcards", description = "Spaced-repetition flashcard review (Leitner system)")
public class FlashcardController {

    private final SpacedRepetitionService spacedRepetitionService;

    public FlashcardController(SpacedRepetitionService spacedRepetitionService) {
        this.spacedRepetitionService = spacedRepetitionService;
    }

    @PostMapping("/review")
    @Operation(summary = "Record a flashcard review — moves card through Leitner boxes based on answer correctness")
    public ResponseEntity<FlashcardDTO> reviewFlashcard(
            @Valid @RequestBody FlashcardReviewRequest request,
            Authentication authentication) {
        FlashcardDTO updated = spacedRepetitionService.reviewFlashcard(
                authentication.getName(), request.getFlashcardId(), request.getCorrect());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/due")
    @Operation(summary = "Get all flashcards due for review (nextReviewDate <= now)")
    public ResponseEntity<List<FlashcardDTO>> getDueFlashcards(Authentication authentication) {
        return ResponseEntity.ok(spacedRepetitionService.getDueFlashcards(authentication.getName()));
    }
}
