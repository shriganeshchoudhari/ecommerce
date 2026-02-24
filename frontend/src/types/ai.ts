export interface AiMessage {
  id?: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
}

export interface AiConversationSummary {
  id: number;
  title: string;
  updatedAt: string;
}

export interface AiConversationDetail {
  id: number;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt?: string;
}

export interface AiChatRequest {
  conversationId?: number;
  message: string;
}

export interface AiChatResponse {
  conversationId: number;
  response: string;
}
