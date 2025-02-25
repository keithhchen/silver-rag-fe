import api from "../api";

interface ChatMessage {
    content: string;
    role: string;
    isLoading?: boolean;
    retriever_resources?: RetrieverResource[];
}

interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface RetrieverResource {
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    score: number;
    content: string;
    segment_id: string;
}

interface MessageEndEvent {
    task_id: string;
    message_id: string;
    conversation_id: string;
    metadata: Record<string, any>;
    usage: Usage;
    retriever_resources: RetrieverResource[];
}

interface MessageEvent {
    task_id: string;
    message_id: string;
    conversation_id: string;
    answer: string;
    created_at: number;
}

interface MessageReplaceEvent {
    task_id: string;
    message_id: string;
    conversation_id: string;
    answer: string;
    created_at: number;
}

interface ErrorEvent {
    task_id: string;
    message_id: string;
    status: number;
    code: string;
    message: string;
}

interface WorkflowStartedEvent {
    task_id: string;
    workflow_run_id: string;
}

interface WorkflowFinishedEvent {
    task_id: string;
    workflow_run_id: string;
}

interface ChatRequest {
    query: string;
}

export const streamMessages = async (request: ChatRequest, onMessage: (message: ChatMessage) => void, onError?: (error: any) => void): Promise<void> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data: ')) {
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        const data = JSON.parse(jsonStr);
                        console.log("new line: " + data.event)

                        // Skip ping events
                        if (data.event === 'ping') continue;

                        // Handle different event types
                        switch (data.event) {
                            case 'workflow_started':
                                // Update loading state without sending empty content
                                onMessage({
                                    role: "assistant",
                                    isLoading: true
                                } as ChatMessage);
                                break;

                            case 'workflow_finished':
                                // Update loading state without sending empty content
                                onMessage({
                                    role: "assistant",
                                    isLoading: false
                                } as ChatMessage);
                                break;

                            case 'message':
                                const messageEvent = data as MessageEvent;
                                if (messageEvent.answer && messageEvent.answer.length > 0) {
                                    onMessage({
                                        content: messageEvent.answer,
                                        role: "assistant",
                                        isLoading: false
                                    });
                                }
                                break;

                            case 'message_replace':
                                const replaceEvent = data as MessageReplaceEvent;
                                onMessage({
                                    content: replaceEvent.answer,
                                    role: "assistant",
                                    isLoading: false
                                });
                                break;

                            case 'error':
                                const errorEvent = data as ErrorEvent;
                                if (onError) {
                                    onError({
                                        status: errorEvent.status,
                                        message: errorEvent.message,
                                        code: errorEvent.code
                                    });
                                }
                                return;

                            case 'message_end':
                                const messageEndEvent = data as MessageEndEvent;
                                onMessage({
                                    content: "",
                                    role: "assistant",
                                    isLoading: false,
                                    retriever_resources: messageEndEvent?.metadata?.retriever_resources || []
                                })
                                break;

                            default:
                                console.warn('Unknown event type:', data.event);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE message:', e);
                    }
                }
            }
        }

        // Handle any remaining data in the buffer
        // if (buffer) {
        //     const trimmedLine = buffer.trim();
        //     if (trimmedLine.startsWith('data: ')) {
        //         try {
        //             const jsonStr = trimmedLine.slice(6);
        //             const data = JSON.parse(jsonStr);
        //             if (data.event !== 'message' && data.event !== 'message_replace') {
        //                 console.warn('Unhandled event type in buffer:', data.event);
        //             }
        //         } catch (e) {
        //             console.error('Error parsing SSE message:', e);
        //         }
        //     }
        // }
    } catch (error: any) {
        if (onError) {
            onError(error);
        }
        throw error;
    }
};