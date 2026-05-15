package com.studyassistant.controller;

import com.studyassistant.dto.ProgressDTO;
import com.studyassistant.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@Tag(name = "Progress", description = "Student progress tracking endpoints")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    @Operation(summary = "Get progress data for the authenticated student")
    public ResponseEntity<List<ProgressDTO>> getProgress(Authentication authentication) {
        List<ProgressDTO> progress = progressService.getProgress(authentication.getName());
        return ResponseEntity.ok(progress);
    }
}
