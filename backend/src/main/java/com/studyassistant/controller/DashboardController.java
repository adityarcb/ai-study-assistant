package com.studyassistant.controller;

import com.studyassistant.dto.DashboardResponse;
import com.studyassistant.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes study progress statistics for the authenticated student.
 * Returns a {@link DashboardResponse} containing totals and a paginated list of recent score points.
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Study‑progress overview")
public class DashboardController {

    private final DashboardService dashboardService;
    private final com.studyassistant.repository.StudentRepository studentRepository;

    public DashboardController(DashboardService dashboardService, com.studyassistant.repository.StudentRepository studentRepository) {
        this.dashboardService = dashboardService;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    @Operation(summary = "Get paginated dashboard statistics for the current student")
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
            @RequestParam(name = "size", defaultValue = "7") @Min(1) int size) {
        // Resolve student ID from email
        Long studentId = studentRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"))
                .getId();
        Pageable pageable = PageRequest.of(page, size);
        DashboardResponse response = dashboardService.getDashboard(studentId, pageable);
        return ResponseEntity.ok(response);
    }
}
