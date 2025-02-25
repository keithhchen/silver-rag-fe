import api from "../api";

interface ChatMessage {
    content: string;
    role: string;
    timestamp: string;
}

interface ChatRequest {
    query: string;
}

export const streamMessages = async (request: ChatRequest, onMessage: (message: ChatMessage) => void, onError?: (error: any) => void): Promise<void> => {
    try {
        const response = await api.post('/chat/messages', request, {
            responseType: 'stream',
            headers: {
                'Accept': 'text/event-stream'
            }
        });

        const reader = response.data.getReader();

        // Read the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the Uint8Array to a string
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    try {
                        const message = JSON.parse(jsonStr) as ChatMessage;
                        onMessage(message);
                    } catch (e) {
                        console.error('Error parsing SSE message:', e);
                    }
                }
            }
        }
    } catch (error: any) {
        if (onError) {
            onError(error);
        }
        throw error;
    }
};