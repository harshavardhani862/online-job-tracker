package com.klu.jobtracker.service;

import com.klu.jobtracker.dto.ats.CandidateRequest;
import com.klu.jobtracker.dto.ats.JobRequest;
import com.klu.jobtracker.entity.*;
import com.klu.jobtracker.exception.ResourceNotFoundException;
import com.klu.jobtracker.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecruitingServiceTenantTest {
    @Mock private UserRepository users;
    @Mock private TeamMembershipRepository memberships;
    @Mock private JobOpeningRepository jobs;
    @Mock private CandidateRepository candidates;
    @Mock private OrganizationService organizations;
    @Mock private TeamInvitationRepository invitations;
    @InjectMocks private RecruitingService service;

    @Test
    void cannotUpdateJobFromAnotherOrganization() {
        setupMember(11L);
        when(jobs.findByIdAndOrganizationId(90L, 11L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.updateJob(
                "recruiter@example.com", 90L,
                new JobRequest("Designer", "Design", "Remote", "Full-time", null, OpeningStatus.OPEN)));

        verify(jobs).findByIdAndOrganizationId(90L, 11L);
        verify(jobs, never()).save(any());
    }

    @Test
    void cannotAttachCandidateToJobFromAnotherOrganization() {
        setupMember(11L);
        when(jobs.findByIdAndOrganizationId(90L, 11L)).thenReturn(Optional.empty());
        CandidateRequest request = new CandidateRequest("Taylor Reed", "taylor@example.com", null,
                null, "Referral", null, null, 90L, CandidateStage.NEW);

        assertThrows(ResourceNotFoundException.class, () -> service.createCandidate(
                "recruiter@example.com", request));

        verify(jobs).findByIdAndOrganizationId(90L, 11L);
        verify(candidates, never()).save(any());
    }

    @Test
    void updatesCandidateDetailsAndSavesThem() {
        setupMember(11L);
        Organization organization = mock(Organization.class);
        User createdBy = mock(User.class);
        Candidate candidate = new Candidate(organization, null, createdBy, "Taylor Reed",
                "taylor@example.com", "111", "Old location", "Direct", null, null, CandidateStage.NEW);
        when(candidates.findByIdAndOrganizationId(55L, 11L)).thenReturn(Optional.of(candidate));
        when(candidates.save(candidate)).thenReturn(candidate);
        CandidateRequest request = new CandidateRequest("Taylor Reed", "taylor.reed@example.com",
                "222", "New location", "Referral", "https://example.com/resume",
                "Updated notes", null, CandidateStage.SCREENING);

        var response = service.updateCandidate("recruiter@example.com", 55L, request);

        assertEquals("taylor.reed@example.com", candidate.getEmail());
        assertEquals("222", candidate.getPhone());
        assertEquals("New location", candidate.getLocation());
        assertEquals("Referral", candidate.getSource());
        assertEquals("https://example.com/resume", candidate.getResumeUrl());
        assertEquals("Updated notes", candidate.getNotes());
        assertEquals(CandidateStage.SCREENING, candidate.getStage());
        assertEquals("taylor.reed@example.com", response.email());
        verify(candidates).save(candidate);
    }

    private void setupMember(Long organizationId) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(7L);
        Organization organization = mock(Organization.class);
        when(organization.getId()).thenReturn(organizationId);
        TeamMembership membership = mock(TeamMembership.class);
        when(membership.getOrganization()).thenReturn(organization);
        when(users.findByEmail("recruiter@example.com")).thenReturn(Optional.of(user));
        when(memberships.findByUserId(7L)).thenReturn(Optional.of(membership));
    }
}
