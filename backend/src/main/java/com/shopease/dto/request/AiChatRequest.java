package com.shopease.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AiChatRequest {

    private Long conversationId; // Optional, null if starting a new conversation

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public AiChatRequest() {
    }

    public AiChatRequest(Long conversationId, String message) {
        this.conversationId = conversationId;
        this.message = message;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
