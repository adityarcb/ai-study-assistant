package com.studyassistant.service;

import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.Flashcard;
import com.studyassistant.model.Note;
import com.studyassistant.model.Quiz;
import com.studyassistant.model.QuizQuestion;
import com.studyassistant.model.Student;
import com.studyassistant.repository.FlashcardRepository;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.QuizQuestionRepository;
import com.studyassistant.repository.QuizRepository;
import com.studyassistant.repository.StudentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final StudentRepository studentRepository;
    private final FlashcardRepository flashcardRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    public NoteService(NoteRepository noteRepository, StudentRepository studentRepository,
                       FlashcardRepository flashcardRepository, QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository) {
        this.noteRepository = noteRepository;
        this.studentRepository = studentRepository;
        this.flashcardRepository = flashcardRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
    }

    public Note saveTextNote(String email, String title, String content) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Note note = new Note(student, title, content);
        return noteRepository.save(note);
    }

    public Note uploadFileNote(String email, String title, MultipartFile file) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String extractedText = extractFileText(file);

        Note note = new Note(student, title, extractedText);
        return noteRepository.save(note);
    }

    public List<Note> getStudentNotes(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return noteRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    public List<Note> getRecentNotes(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return noteRepository.findTop5ByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    public Note getNoteById(Long noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));
    }

    public long countStudentNotes(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return noteRepository.countByStudentId(student.getId());
    }

    public Map<String, Object> getStoredStudyMaterials(Long noteId) {
        // Verify note exists
        noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        Map<String, Object> result = new HashMap<>();

        // Fetch flashcards
        List<Flashcard> flashcards = flashcardRepository.findByNoteId(noteId);
        List<Map<String, Object>> flashcardList = new ArrayList<>();
        for (Flashcard fc : flashcards) {
            Map<String, Object> fcMap = new HashMap<>();
            fcMap.put("id", fc.getId());
            fcMap.put("question", fc.getQuestion());
            fcMap.put("answer", fc.getAnswer());
            flashcardList.add(fcMap);
        }
        result.put("flashcards", flashcardList);
        result.put("hasFlashcards", !flashcardList.isEmpty());

        // Fetch quiz questions (with correct answers — this is the history view)
        Optional<Quiz> quizOpt = quizRepository.findByNoteId(noteId);
        if (quizOpt.isPresent()) {
            Quiz quiz = quizOpt.get();
            List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quiz.getId());
            List<Map<String, Object>> questionList = new ArrayList<>();
            for (QuizQuestion q : questions) {
                Map<String, Object> qMap = new HashMap<>();
                qMap.put("id", q.getId());
                qMap.put("questionText", q.getQuestionText());
                qMap.put("optionA", q.getOptionA());
                qMap.put("optionB", q.getOptionB());
                qMap.put("optionC", q.getOptionC());
                qMap.put("optionD", q.getOptionD());
                qMap.put("correctOption", q.getCorrectOption());
                questionList.add(qMap);
            }
            result.put("questions", questionList);
            result.put("quizId", quiz.getId());
            result.put("hasQuiz", !questionList.isEmpty());
        } else {
            result.put("questions", new ArrayList<>());
            result.put("hasQuiz", false);
        }

        return result;
    }

    private String extractFileText(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            return extractPdfText(file);
        } else if (filename != null && (filename.toLowerCase().endsWith(".pptx") || filename.toLowerCase().endsWith(".ppt"))) {
            return extractPptxText(file);
        } else {
            throw new RuntimeException("Unsupported file format. Please upload a PDF or PowerPoint (.pptx) file.");
        }
    }

    private String extractPdfText(MultipartFile file) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            return text;
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage());
        }
    }

    private String extractPptxText(MultipartFile file) {
        try {
            org.apache.poi.xslf.usermodel.XMLSlideShow ppt = new org.apache.poi.xslf.usermodel.XMLSlideShow(file.getInputStream());
            StringBuilder text = new StringBuilder();
            for (org.apache.poi.xslf.usermodel.XSLFSlide slide : ppt.getSlides()) {
                for (org.apache.poi.xslf.usermodel.XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof org.apache.poi.xslf.usermodel.XSLFTextShape) {
                        org.apache.poi.xslf.usermodel.XSLFTextShape textShape = (org.apache.poi.xslf.usermodel.XSLFTextShape) shape;
                        text.append(textShape.getText()).append("\n");
                    }
                }
            }
            ppt.close();
            return text.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PowerPoint. Ensure it is a valid .pptx file: " + e.getMessage());
        }
    }
}
