package com.studyassistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyassistant.dto.AuthResponse;
import com.studyassistant.dto.LoginRequest;
import com.studyassistant.dto.RegisterRequest;
import com.studyassistant.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/register - success")
    void registerSuccess() throws Exception {
        AuthResponse response = new AuthResponse("jwt-token", 1L, "John Doe");
        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("John Doe", "john@example.com", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.studentId").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    @DisplayName("POST /api/auth/login - success")
    void loginSuccess() throws Exception {
        AuthResponse response = new AuthResponse("jwt-token", 1L, "John Doe");
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("john@example.com", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /api/auth/register - invalid email returns 400")
    void registerInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"John\",\"email\":\"invalid\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest());
    }
}
