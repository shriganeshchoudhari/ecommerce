'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, PlusCircle } from 'lucide-react';
import { useAiChat } from '@/hooks/useAiChat';
import { useAuthStore } from '@/store/authStore';

export const AiChatWidget = () => {
    const { isAuthenticated } = useAuthStore();
    const {
        isOpen,
        toggleChat,
        messages,
        isTyping,
        error,
        sendMessage,
        resetChat,
    } = useAiChat();

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isAuthenticated) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isTyping) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <>
            {/* Chat Button (FAB) */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center animate-bounce-short"
                    aria-label="Open AI Shopping Assistant"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-full max-w-[350px] sm:max-w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-2xl">
                        <div className="flex items-center space-x-2">
                            <Bot size={20} />
                            <h3 className="font-semibold">ShopEase Assistant</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={resetChat}
                                className="text-white/80 hover:text-white transition-colors"
                                title="New Conversation"
                            >
                                <PlusCircle size={18} />
                            </button>
                            <button
                                onClick={toggleChat}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                                <Bot size={48} className="text-gray-300 mx-auto" />
                                <p className="text-sm">
                                    Hi! I'm your ShopEase AI assistant.<br />
                                    Ask me for product recommendations or store policies.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex w-full ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex max-w-[85%] ${msg.role === 'USER' ? 'flex-row-reverse' : 'flex-row'} items-end`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'USER' ? 'bg-indigo-100 text-indigo-600 ml-2' : 'bg-primary text-white mr-2'}`}>
                                        {msg.role === 'USER' ? <UserIcon size={14} /> : <Bot size={14} />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                        className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'USER'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex w-full justify-start border-l-2 border-transparent">
                                <div className="flex flex-row items-end">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white mr-2 flex items-center justify-center">
                                        <Bot size={14} />
                                    </div>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-center text-xs text-red-500 bg-red-50 p-2 rounded-md border border-red-100">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-200">
                        <form onSubmit={handleSend} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about products..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
