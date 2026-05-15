package com.studyassistant.dto;

import java.util.List;

public class QuizAttemptRequest {

    private Long quizId;
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
        private Long questionId;
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
