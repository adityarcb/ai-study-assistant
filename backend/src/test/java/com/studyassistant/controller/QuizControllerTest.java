package com.studyassistant.controller;

import com.studyassistant.security.JwtUtil;
import com.studyassistant.service.QuizService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuizControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtUtil jwtUtil;
    @MockitoBean private QuizService quizService;

    @Test
    @DisplayName("POST /api/quiz/attempt - requires authentication")
    void attemptRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/quiz/attempt")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/quiz/history - requires authentication")
    void historyRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/quiz/history"))
                .andExpect(status().isUnauthorized());
    }
}
