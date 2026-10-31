package com.klu.jobtracker.ai.controller;

import com.klu.jobtracker.ai.dto.AIRequest;
import com.klu.jobtracker.ai.service.AIService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/interview-preparation")
    public Map<String, String> interviewPreparation(@Valid @RequestBody AIRequest request) {
        return Map.of("result", aiService.prepareInterview(request.targetRole(), request.skills(),
                request.background(), request.additionalDetails(), request.interviewType(), request.experienceLevel()));
    }

    @PostMapping("/career-recommendations")
    public Map<String, String> careerRecommendations(@Valid @RequestBody AIRequest request) {
        return Map.of("result", aiService.recommendCareer(request.targetRole(), request.skills(),
                request.background(), request.additionalDetails()));
    }
}
