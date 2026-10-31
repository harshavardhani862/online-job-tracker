package com.klu.jobtracker.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AIRequest(
        @NotBlank(message = "Please provide your target role or career goal")
        @Size(max = 160, message = "Target role must be 160 characters or fewer")
        String targetRole,
        @Size(max = 3000, message = "Skills must be 3000 characters or fewer")
        String skills,
        @Size(max = 3000, message = "Background must be 3000 characters or fewer")
        String background,
        @Size(max = 1200, message = "Additional details must be 1200 characters or fewer")
        String additionalDetails,
        @Size(max = 60, message = "Interview type must be 60 characters or fewer")
        String interviewType,
        @Size(max = 40, message = "Experience level must be 40 characters or fewer")
        String experienceLevel
) {}
