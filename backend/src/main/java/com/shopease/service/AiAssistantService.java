package com.shopease.service;

import com.shopease.dto.request.AiChatRequest;
import com.shopease.dto.response.AiChatResponse;
import com.shopease.dto.response.AiConversationSummaryDto;
import com.shopease.entity.AiConversation;
import com.shopease.entity.AiMessage;
import com.shopease.entity.User;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.AiConversationRepository;
import com.shopease.repository.AiMessageRepository;
import com.shopease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiAssistantService {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private static final String SYSTEM_PROMPT = "You are a helpful shopping assistant for ShopEase, an ecommerce platform. "
            +
            "You help customers find products, understand policies, and navigate the store. " +
            "Be concise, friendly, and format your answers using markdown if necessary. " +
            "If you don't know something about the specific store inventory, say so politely.";

    public AiAssistantService(AiConversationRepository conversationRepository,
            AiMessageRepository messageRepository,
            UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public AiChatResponse chat(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AiConversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

            // Verify ownership
            if (!conversation.getUser().getId().equals(userId)) {
                throw new SecurityException("Not authorized to access this conversation");
            }

            conversation.setUpdatedAt(LocalDateTime.now());
        } else {
            conversation = new AiConversation();
            conversation.setUser(user);

            // Generate a simple title based on the first message
            String title = request.getMessage().length() > 30
                    ? request.getMessage().substring(0, 30) + "..."
                    : request.getMessage();
            conversation.setTitle(title);
            conversation = conversationRepository.save(conversation);
        }

        // Save user message
        AiMessage userMsg = new AiMessage();
        userMsg.setConversation(conversation);
        userMsg.setRole("USER");
        userMsg.setContent(request.getMessage());
        messageRepository.save(userMsg);

        // Fetch previous context
        List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        // Call Ollama
        String aiResponseText = callOllama(history);

        // Save AI message
        AiMessage aiMsg = new AiMessage();
        aiMsg.setConversation(conversation);
        aiMsg.setRole("ASSISTANT");
        aiMsg.setContent(aiResponseText);
        messageRepository.save(aiMsg);

        return new AiChatResponse(conversation.getId(), aiResponseText);
    }

    private String callOllama(List<AiMessage> history) {
        String endpoint = ollamaUrl + "/api/chat";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, String>> messages = new ArrayList<>();

        // Add system prompt
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", SYSTEM_PROMPT);
        messages.add(systemMsg);

        // Add history
        for (AiMessage msg : history) {
            Map<String, String> m = new HashMap<>();
            m.put("role", msg.getRole().equalsIgnoreCase("USER") ? "user" : "assistant");
            m.put("content", msg.getContent());
            messages.add(m);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("messages", messages);
        requestBody.put("stream", false);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("message")) {
                Map<String, String> msgMap = (Map<String, String>) response.getBody().get("message");
                return msgMap.getOrDefault("content", "I am having trouble processing your request.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I am currently unavailable. Please try again later. (Error: " + e.getMessage() + ")";
        }

        return "I am having trouble processing your request.";
    }

    public List<AiConversationSummaryDto> getUserConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(c -> new AiConversationSummaryDto(c.getId(), c.getTitle(),
                        c.getUpdatedAt() != null ? c.getUpdatedAt() : c.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public AiConversation getConversation(Long userId, Long conversationId) {
        AiConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to access this conversation");
        }

        return conversation;
    }

    @Transactional
    public void deleteConversation(Long userId, Long conversationId) {
        AiConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to access this conversation");
        }

        conversationRepository.delete(conversation);
    }
}
