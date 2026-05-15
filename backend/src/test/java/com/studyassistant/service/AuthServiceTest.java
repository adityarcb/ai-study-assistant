package com.studyassistant.service;

import com.studyassistant.dto.AuthResponse;
import com.studyassistant.dto.LoginRequest;
import com.studyassistant.dto.RegisterRequest;
import com.studyassistant.model.Student;
import com.studyassistant.repository.StudentRepository;
import com.studyassistant.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private StudentRepository studentRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private AuthService authService;

    private Student testStudent;

    @BeforeEach
    void setUp() {
        testStudent = new Student("John Doe", "john@example.com", "encoded_password");
        testStudent.setId(1L);
    }

    @Test
    @DisplayName("Register with valid data - student saved, token returned")
    void registerWithValidData() {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");
        when(studentRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);
        when(jwtUtil.generateToken("john@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(1L, response.getStudentId());
        assertEquals("John Doe", response.getName());
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Register with duplicate email - throws exception")
    void registerDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password");
        when(studentRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login with correct credentials - token returned")
    void loginSuccess() {
        LoginRequest request = new LoginRequest("john@example.com", "password123");
        when(studentRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testStudent));
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        when(jwtUtil.generateToken("john@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
    }

    @Test
    @DisplayName("Login with wrong password - throws exception")
    void loginWrongPassword() {
        LoginRequest request = new LoginRequest("john@example.com", "wrong");
        when(studentRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testStudent));
        when(passwordEncoder.matches("wrong", "encoded_password")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login(request));
    }
}
