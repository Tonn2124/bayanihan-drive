package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.model.Comment;
import com.bayanihandrive.acebedobelenmedil.model.Update;
import com.bayanihandrive.acebedobelenmedil.repository.CommentRepository;
import com.bayanihandrive.acebedobelenmedil.repository.UpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "http://localhost:3000")
public class SocialController {

    @Autowired private CommentRepository commentRepository;
    @Autowired private UpdateRepository updateRepository;

    // --- COMMENTS ---
    @GetMapping("/comments/{campaignId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long campaignId) {
        return ResponseEntity.ok(commentRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId));
    }

    @PostMapping("/comments")
    public ResponseEntity<Comment> postComment(@RequestBody Comment comment, @AuthenticationPrincipal Jwt jwt) {
        comment.setUserId(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    // --- UPDATES ---
    @GetMapping("/updates/{campaignId}")
    public ResponseEntity<List<Update>> getUpdates(@PathVariable Long campaignId) {
        return ResponseEntity.ok(updateRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId));
    }

    @PostMapping("/updates")
    public ResponseEntity<Update> postUpdate(@RequestBody Update update, @AuthenticationPrincipal Jwt jwt) {
        update.setOrganizerId(UUID.fromString(jwt.getSubject()));
        // Note: In a real app, you should verify here that jwt.subject == campaign.organizerId
        return ResponseEntity.ok(updateRepository.save(update));
    }
}