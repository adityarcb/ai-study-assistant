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
public class OpenRouterService {

    private static final Logger logger = LoggerFactory.getLogger(OpenRouterService.class);

    @Value("${app.openrouter.api.key}")
    private String apiKey;

    @Value("${app.openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    private final NoteRepository noteRepository;
    private final FlashcardRepository flashcardRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public OpenRouterService(NoteRepository noteRepository, FlashcardRepository flashcardRepository,
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
        String aiResponse = callOpenRouterApi(prompt);
        String jsonContent = extractJsonFromResponse(aiResponse);

        try {
            JsonNode root = objectMapper.readTree(jsonContent);

            // Parse and save summary directly onto the Note
            String summary = root.get("summary").asText();
            note.setSummary(summary);
            noteRepository.save(note);

            // Clean up any existing flashcards or quizzes for this note before saving new ones
            List<Flashcard> existingFc = flashcardRepository.findByNoteId(noteId);
            if (!existingFc.isEmpty()) {
                flashcardRepository.deleteAll(existingFc);
            }
            quizRepository.findByNoteId(noteId).ifPresent(existingQuiz -> {
                List<QuizQuestion> existingQq = quizQuestionRepository.findByQuizId(existingQuiz.getId());
                quizQuestionRepository.deleteAll(existingQq);
                quizRepository.delete(existingQuiz);
            });

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
            logger.error("Failed to parse AI response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response. Please try again. Error: " + e.getMessage());
        }
    }

    private String buildPrompt(String noteContent) {
        return """
                You are an expert study assistant.
                Given the following lecture notes or topic, do three things:

                1. Write a clear, concise summary of the topic in 3-5 paragraphs. The summary should cover the main concepts, key points, and important takeaways in plain readable English. Do NOT use bullet trees or flowcharts — write it as normal paragraphs.
                2. Generate exactly 5 flashcards as a JSON array:
                   [{"question": "...", "answer": "..."}]
                3. Generate exactly 5 multiple choice quiz questions as a JSON array:
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

    private String callOpenRouterApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:5173");
        headers.set("X-Title", "AI Study Assistant");

        String requestBody;
        try {
            java.util.Map<String, Object> requestMap = java.util.Map.of(
                "model", "openrouter/free",
                "messages", List.of(java.util.Map.of("role", "user", "content", prompt)),
                "response_format", java.util.Map.of("type", "json_object")
            );
            requestBody = objectMapper.writeValueAsString(requestMap);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build OpenRouter request: " + e.getMessage());
        }

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("OpenRouter API returned status: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (Exception e) {
            logger.error("OpenRouter API call failed: {}", e.getMessage());
            throw new RuntimeException("Failed to call OpenRouter API: " + e.getMessage());
        }
    }

    private String extractJsonFromResponse(String responseStr) {
        try {
            JsonNode root = objectMapper.readTree(responseStr);
            String text = root.get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
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
            throw new RuntimeException("Failed to extract content from OpenRouter response: " + e.getMessage());
        }
    }
}
