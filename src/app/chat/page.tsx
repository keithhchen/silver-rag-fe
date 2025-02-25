"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUp } from "lucide-react";
import { streamMessages } from "@/lib/services/chat";

interface Message {
  content: string;
  role: string;
  isLoading?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
    if (messagesEndRef.current) {
      const currentScroll = messagesEndRef.current.offsetTop;
      window.scrollTo({ top: currentScroll - 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { content: input, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamMessages(
        { query: input },
        (message) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === "assistant") {
              // Update existing assistant message with concatenated content
              const updatedMessage = {
                ...lastMessage,
                content: lastMessage.isLoading
                  ? message.content
                  : lastMessage.content + (message.content ?? ""),
                isLoading: false,
              };
              return [...prev.slice(0, -1), updatedMessage];
            } else {
              // Add new assistant message
              return [...prev, message];
            }
          });
        },
        (error) => {
          console.error("Error:", error);
          setMessages((prev) => [
            ...prev,
            { content: "An error occurred. Please try again.", role: "system" },
          ]);
        }
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 sticky bottom-0 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="开始提问..."
            disabled={isLoading}
            className="flex-1 shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
