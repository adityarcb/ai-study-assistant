package com.studyassistant.controller;

import com.studyassistant.dto.NoteRequest;
import com.studyassistant.model.Note;
import com.studyassistant.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Notes", description = "Note management endpoints")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping("/text")
    @Operation(summary = "Create a note from text input")
    public ResponseEntity<Map<String, Object>> createTextNote(
            @Valid @RequestBody NoteRequest request,
            Authentication authentication) {
        Note note = noteService.saveTextNote(authentication.getName(), request.getTitle(), request.getContent());
        return ResponseEntity.ok(buildNoteResponse(note));
    }

    @PostMapping("/upload")
    @Operation(summary = "Create a note from PDF or PPTX upload")
    public ResponseEntity<Map<String, Object>> uploadFileNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            Authentication authentication) {
        Note note = noteService.uploadFileNote(authentication.getName(), title, file);
        Map<String, Object> response = buildNoteResponse(note);
        response.put("extractedText", note.getContent());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all notes for the authenticated student")
    public ResponseEntity<List<Map<String, Object>>> getAllNotes(Authentication authentication) {
        List<Note> notes = noteService.getStudentNotes(authentication.getName());
        List<Map<String, Object>> response = notes.stream()
                .map(this::buildNoteListItem)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{noteId}")
    @Operation(summary = "Get a specific note by ID")
    public ResponseEntity<Map<String, Object>> getNoteById(@PathVariable Long noteId) {
        Note note = noteService.getNoteById(noteId);
        return ResponseEntity.ok(buildNoteResponse(note));
    }

    private Map<String, Object> buildNoteResponse(Note note) {
        Map<String, Object> map = new HashMap<>();
        map.put("noteId", note.getId());
        map.put("title", note.getTitle());
        map.put("content", note.getContent());
        map.put("createdAt", note.getCreatedAt());
        return map;
    }

    private Map<String, Object> buildNoteListItem(Note note) {
        Map<String, Object> map = new HashMap<>();
        map.put("noteId", note.getId());
        map.put("title", note.getTitle());
        map.put("createdAt", note.getCreatedAt());
        return map;
    }
}
