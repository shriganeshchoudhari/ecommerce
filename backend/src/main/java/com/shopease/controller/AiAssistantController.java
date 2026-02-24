package com.shopease.controller;

import com.shopease.dto.request.AiChatRequest;
import com.shopease.dto.response.AiChatResponse;
import com.shopease.dto.response.AiConversationSummaryDto;
import com.shopease.entity.AiConversation;
import com.shopease.security.UserDetailsImpl;
import com.shopease.service.AiAssistantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    public AiAssistantController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiAssistantService.chat(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiConversationSummaryDto>> getConversations(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(aiAssistantService.getUserConversations(userDetails.getId()));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<AiConversation> getConversation(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(aiAssistantService.getConversation(userDetails.getId(), id));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        aiAssistantService.deleteConversation(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
