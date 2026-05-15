package com.studyassistant.service;

import com.studyassistant.dto.AuthResponse;
import com.studyassistant.dto.LoginRequest;
import com.studyassistant.dto.RegisterRequest;
import com.studyassistant.model.Student;
import com.studyassistant.repository.StudentRepository;
import com.studyassistant.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole("STUDENT");

        student = studentRepository.save(student);

        String token = jwtUtil.generateToken(student.getEmail());
        return new AuthResponse(token, student.getId(), student.getName());
    }

    public AuthResponse login(LoginRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(student.getEmail());
        return new AuthResponse(token, student.getId(), student.getName());
    }
}
