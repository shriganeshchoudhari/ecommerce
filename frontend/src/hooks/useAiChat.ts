import { useState, useCallback } from 'react';
import { api } from '../api/client';
import { AiMessage, AiConversationSummary, AiChatRequest, AiChatResponse } from '../types/ai';

export const useAiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AiMessage[]>([]);
    const [conversationId, setConversationId] = useState<number | undefined>(undefined);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Add user message immediately
        const userMessage: AiMessage = { role: 'USER', content: text };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        setError(null);

        try {
            const payload: AiChatRequest = {
                conversationId,
                message: text,
            };

            const { data } = await api.post<AiChatResponse>('/ai/chat', payload);

            const aiMessage: AiMessage = { role: 'ASSISTANT', content: data.response };
            setMessages((prev) => [...prev, aiMessage]);

            if (!conversationId) {
                setConversationId(data.conversationId);
            }
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setError(err.response?.data?.message || 'Failed to communicate with AI');
        } finally {
            setIsTyping(false);
        }
    }, [conversationId]);

    const loadConversation = useCallback(async (id: number) => {
        try {
            const { data } = await api.get(`/ai/conversations/${id}`);
            setConversationId(data.id);
            setMessages(data.messages || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load conversation:', err);
            setError('Failed to load conversation history');
        }
    }, []);

    const resetChat = useCallback(() => {
        setConversationId(undefined);
        setMessages([]);
        setError(null);
    }, []);

    return {
        isOpen,
        toggleChat,
        messages,
        isTyping,
        error,
        sendMessage,
        conversationId,
        loadConversation,
        resetChat,
    };
};
