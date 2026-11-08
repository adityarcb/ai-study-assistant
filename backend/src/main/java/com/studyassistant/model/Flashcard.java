package com.studyassistant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(name = "box_level", nullable = false)
    private Integer boxLevel = 1;

    @Column(name = "next_review_date", nullable = false)
    private LocalDateTime nextReviewDate = LocalDateTime.now();

    public Flashcard() {}

    public Flashcard(Note note, String question, String answer) {
        this.note = note;
        this.question = question;
        this.answer = answer;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Note getNote() { return note; }
    public void setNote(Note note) { this.note = note; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public Integer getBoxLevel() { return boxLevel; }
    public void setBoxLevel(Integer boxLevel) { this.boxLevel = boxLevel; }

    public LocalDateTime getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDateTime nextReviewDate) { this.nextReviewDate = nextReviewDate; }
}
