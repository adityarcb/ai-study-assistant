package com.studyassistant.dto;

public class AuthResponse {

    private String token;
    private Long studentId;
    private String name;

    public AuthResponse() {}

    public AuthResponse(String token, Long studentId, String name) {
        this.token = token;
        this.studentId = studentId;
        this.name = name;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
