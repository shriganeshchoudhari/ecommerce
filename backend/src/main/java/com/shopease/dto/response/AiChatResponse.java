package com.shopease.dto.response;

public class AiChatResponse {

    private Long conversationId;
    private String response;

    public AiChatResponse() {
    }

    public AiChatResponse(Long conversationId, String response) {
        this.conversationId = conversationId;
        this.response = response;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
