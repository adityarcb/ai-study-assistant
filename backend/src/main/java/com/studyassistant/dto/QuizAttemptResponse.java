package com.studyassistant.dto;

import java.util.List;

public class QuizAttemptResponse {

    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;
    private List<QuestionBreakdown> breakdown;

    public QuizAttemptResponse() {}

    public QuizAttemptResponse(int score, int totalQuestions, double percentage, boolean passed,
                               List<QuestionBreakdown> breakdown) {
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.passed = passed;
        this.breakdown = breakdown;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public List<QuestionBreakdown> getBreakdown() { return breakdown; }
    public void setBreakdown(List<QuestionBreakdown> breakdown) { this.breakdown = breakdown; }

    public static class QuestionBreakdown {
        private Long questionId;
        private String selectedOption;
        private String correctOption;
        private boolean isCorrect;

        public QuestionBreakdown() {}

        public QuestionBreakdown(Long questionId, String selectedOption, String correctOption, boolean isCorrect) {
            this.questionId = questionId;
            this.selectedOption = selectedOption;
            this.correctOption = correctOption;
            this.isCorrect = isCorrect;
        }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }

        public String getCorrectOption() { return correctOption; }
        public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
    }
}
