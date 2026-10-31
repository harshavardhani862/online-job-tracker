package com.klu.jobtracker.controller;

import com.klu.jobtracker.dto.InterviewRequest;
import com.klu.jobtracker.entity.Interview;
import com.klu.jobtracker.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewService service;
    public InterviewController(InterviewService service) { this.service = service; }

    private Map<String, Object> response(Interview i) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", i.getId());
        out.put("applicationId", i.getApplication().getId());
        out.put("companyName", i.getApplication().getCompanyName());
        out.put("jobTitle", i.getApplication().getJobTitle());
        LocalDateTime dt = i.getInterviewDateTime();
        out.put("interviewDateTime", dt);
        out.put("interviewDate", dt == null ? null : dt.toLocalDate().toString());
        out.put("interviewTime", dt == null ? null : dt.toLocalTime().toString());
        out.put("interviewer", i.getInterviewerName());
        out.put("interviewType", i.getInterviewType());
        out.put("meetingLink", i.getMeetingLink());
        out.put("status", i.getStatus() == null ? "SCHEDULED" : i.getStatus().name());
        out.put("notes", i.getNotes() == null ? "" : i.getNotes());
        return out;
    }

    @GetMapping
    public List<Map<String, Object>> getAll(Principal p) {
        return service.getAll(p.getName()).stream().map(this::response).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOne(Principal p, @PathVariable Long id) {
        return response(service.getOne(p.getName(), id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Principal p, @Valid @RequestBody InterviewRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(p.getName(), r)));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(Principal p, @PathVariable Long id, @Valid @RequestBody InterviewRequest r) {
        return response(service.update(p.getName(), id, r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Principal p, @PathVariable Long id) {
        service.delete(p.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Interview deleted"));
    }
}
