package com.studyassistant.service;

import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.Note;
import com.studyassistant.model.Student;
import com.studyassistant.repository.NoteRepository;
import com.studyassistant.repository.StudentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final StudentRepository studentRepository;

    public NoteService(NoteRepository noteRepository, StudentRepository studentRepository) {
        this.noteRepository = noteRepository;
        this.studentRepository = studentRepository;
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
