package com.studyassistant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public class QuizAttemptRequest {

    @NotNull(message = "quizId is required")
    private Long quizId;

    @NotEmpty(message = "answers cannot be empty")
    @Valid
    private List<AnswerDTO> answers;

    public QuizAttemptRequest() {}

    public QuizAttemptRequest(Long quizId, List<AnswerDTO> answers) {
        this.quizId = quizId;
        this.answers = answers;
    }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public List<AnswerDTO> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDTO> answers) { this.answers = answers; }

    public static class AnswerDTO {
        @NotNull(message = "questionId is required")
        private Long questionId;

        @NotBlank(message = "selectedOption is required")
        @Pattern(regexp = "^[A-D]$", message = "selectedOption must be A, B, C, or D")
        private String selectedOption;

        public AnswerDTO() {}

        public AnswerDTO(Long questionId, String selectedOption) {
            this.questionId = questionId;
            this.selectedOption = selectedOption;
        }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    }
}
