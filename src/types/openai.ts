// src/types/openai.ts
export interface OpenAIMessage {
    role: string;
    content: string;
}

export interface OpenAIChoice {
    message: OpenAIMessage;
    finish_reason: string;
    index: number;
}

export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenAIChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
