package com.klu.jobtracker.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class AIService {
    private final RestClient restClient;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-2.5-flash}")
    private String model;

    public AIService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String prepareInterview(String targetRole, String skills, String background,
                                   String additionalDetails, String interviewType, String experienceLevel) {
        String prompt = "Act as a practical interview coach. Create a tailored interview preparation guide.\n" +
                "Target role: " + targetRole + "\nInterview type: " + safe(interviewType, "Mixed") +
                "\nExperience level: " + safe(experienceLevel, "Entry level") +
                "\nSkills: " + safe(skills, "Not provided") +
                "\nBackground: " + safe(background, "Not provided") +
                "\nAdditional details: " + safe(additionalDetails, "None") + "\n\n" +
                "Return clear Markdown with: (1) a short preparation plan, (2) 8 role-specific questions " +
                "split into technical and behavioral, (3) concise answer guidance and sample STAR structure " +
                "for behavioral questions, (4) 5 key concepts to revise, (5) a 3-day practice schedule. " +
                "Do not claim the candidate has skills or experience they did not provide. Keep it suitable for a fresher when applicable.";
        return generate(prompt);
    }

    public String recommendCareer(String targetRole, String skills, String background, String additionalDetails) {
        String prompt = "Act as a realistic career guidance assistant for a student or early-career job seeker.\n" +
                "Preferred role or goal: " + targetRole + "\nSkills: " + safe(skills, "Not provided") +
                "\nEducation/background: " + safe(background, "Not provided") +
                "\nInterests, location or preferences: " + safe(additionalDetails, "Not provided") + "\n\n" +
                "Return Markdown with: (1) 3-5 suitable job roles ranked with reasons, (2) current-skill fit " +
                "and gaps for each role, (3) a prioritized 30-day learning roadmap, (4) 2 portfolio project ideas, " +
                "(5) suggested resume keywords and job-search terms, and (6) practical next steps. " +
                "Do not guarantee employment, invent qualifications, or make unsupported salary claims. " +
                "Clearly distinguish suggestions from facts.";
        return generate(prompt);
    }

    private String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            throw new IllegalStateException("AI is not configured yet. Add GEMINI_API_KEY to the backend environment and restart the server.");
        }

        Map<String, Object> request = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("temperature", 0.65, "maxOutputTokens", 1800)
        );

        try {
            JsonNode response = restClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", apiKey).build(model))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);

            JsonNode text = response == null ? null : response.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (text == null || text.isMissingNode() || text.asText().isBlank()) {
                throw new IllegalStateException("The AI provider returned an empty response. Please try again.");
            }
            return text.asText();
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException("AI provider request failed (HTTP " + ex.getStatusCode().value() + "). Check the Gemini API key, quota and model configuration.");
        }
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
