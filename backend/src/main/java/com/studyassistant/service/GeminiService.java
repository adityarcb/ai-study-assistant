package com.studyassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyassistant.dto.FlashcardDTO;
import com.studyassistant.dto.GenerateResponse;
import com.studyassistant.dto.QuizQuestionDTO;
import com.studyassistant.exception.ResourceNotFoundException;
import com.studyassistant.model.*;
import com.studyassistant.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api.key}")
    private String apiKey;

    @Value("${app.gemini.api.url}")
    private String apiUrl;

    private final NoteRepository noteRepository;
    private final FlashcardRepository flashcardRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(NoteRepository noteRepository, FlashcardRepository flashcardRepository,
                         QuizRepository quizRepository, QuizQuestionRepository quizQuestionRepository) {
        this.noteRepository = noteRepository;
        this.flashcardRepository = flashcardRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
    }

    public GenerateResponse generateStudyMaterials(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        String prompt = buildPrompt(note.getContent());
        String geminiResponse = callGeminiApi(prompt);
        String jsonContent = extractJsonFromResponse(geminiResponse);

        try {
            JsonNode root = objectMapper.readTree(jsonContent);

            // Parse summary
            String summary = root.get("summary").asText();

            // Parse and save flashcards
            List<FlashcardDTO> flashcardDTOs = new ArrayList<>();
            JsonNode flashcardsNode = root.get("flashcards");
            if (flashcardsNode != null && flashcardsNode.isArray()) {
                for (JsonNode fc : flashcardsNode) {
                    Flashcard flashcard = new Flashcard(
                            note,
                            fc.get("question").asText(),
                            fc.get("answer").asText()
                    );
                    flashcard = flashcardRepository.save(flashcard);
                    flashcardDTOs.add(new FlashcardDTO(flashcard.getId(), flashcard.getQuestion(), flashcard.getAnswer()));
                }
            }

            // Create and save quiz
            Quiz quiz = new Quiz(note, "Quiz: " + note.getTitle());
            quiz = quizRepository.save(quiz);

            // Parse and save quiz questions
            List<QuizQuestionDTO> questionDTOs = new ArrayList<>();
            JsonNode questionsNode = root.get("questions");
            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode q : questionsNode) {
                    QuizQuestion question = new QuizQuestion(
                            quiz,
                            q.get("questionText").asText(),
                            q.get("optionA").asText(),
                            q.get("optionB").asText(),
                            q.get("optionC").asText(),
                            q.get("optionD").asText(),
                            q.get("correctOption").asText()
                    );
                    question = quizQuestionRepository.save(question);

                    // NOTE: correctOption is NOT included in the DTO sent to frontend
                    questionDTOs.add(new QuizQuestionDTO(
                            question.getId(),
                            question.getQuestionText(),
                            question.getOptionA(),
                            question.getOptionB(),
                            question.getOptionC(),
                            question.getOptionD()
                    ));
                }
            }

            return new GenerateResponse(summary, flashcardDTOs, quiz.getId(), questionDTOs);

        } catch (Exception e) {
            logger.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response. Please try again. Error: " + e.getMessage());
        }
    }

    private String buildPrompt(String noteContent) {
        return """
                You are an expert study assistant.
                Given the following lecture notes or topic, do three things:

                1. Create a one-page flowchart-like tree structure with short descriptions for each topic and subtopic, representing the core concepts. Use markdown bullet points and indentation to format it cleanly.
                2. Generate exactly 10 flashcards as a JSON array:
                   [{"question": "...", "answer": "..."}]
                3. Generate exactly 30 multiple choice quiz questions as a JSON array:
                   [{"questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctOption": "A"}]

                Return ONLY valid JSON in this exact format, nothing else:
                {
                  "summary": "...",
                  "flashcards": [...],
                  "questions": [...]
                }
                CRITICAL: You must double-escape any backslashes in the text (e.g. write C:\\\\path instead of C:\\path) so the JSON is valid.

                Notes/Topic:
                """ + noteContent;
    }

    private String callGeminiApi(String prompt) {
        String url = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(
                    new GeminiRequest(prompt)
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Gemini request: " + e.getMessage());
        }

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Gemini API returned status: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (Exception e) {
            logger.error("Gemini API call failed: {}", e.getMessage());
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage());
        }
    }

    private String extractJsonFromResponse(String geminiResponse) {
        try {
            JsonNode root = objectMapper.readTree(geminiResponse);
            String text = root.get("candidates")
                    .get(0)
                    .get("content")
                    .get("parts")
                    .get(0)
                    .get("text")
                    .asText();

            // Strip markdown code fences if present
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            return text.trim();

        } catch (Exception e) {
            throw new RuntimeException("Failed to extract content from Gemini response: " + e.getMessage());
        }
    }

    // Inner class for Gemini API request body
    private static class GeminiRequest {
        private final List<Content> contents;

        public GeminiRequest(String text) {
            this.contents = List.of(new Content(List.of(new Part(text))));
        }

        public List<Content> getContents() { return contents; }

        private static class Content {
            private final List<Part> parts;
            public Content(List<Part> parts) { this.parts = parts; }
            public List<Part> getParts() { return parts; }
        }

        private static class Part {
            private final String text;
            public Part(String text) { this.text = text; }
            public String getText() { return text; }
        }
    }
}
