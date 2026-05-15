package com.studyassistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyassistant.dto.QuizAttemptRequest;
import com.studyassistant.dto.QuizAttemptResponse;
import com.studyassistant.security.JwtUtil;
import com.studyassistant.service.QuizService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class QuizControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtUtil jwtUtil;
    @MockitoBean private QuizService quizService;

    private String getToken() {
        return "Bearer " + jwtUtil.generateToken("test@example.com");
    }

    @Test
    @DisplayName("POST /api/quiz/attempt - requires authentication")
    void attemptRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/quiz/attempt")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/quiz/history - requires authentication")
    void historyRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/quiz/history"))
                .andExpect(status().isForbidden());
    }
}
