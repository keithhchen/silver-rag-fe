"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUp } from "lucide-react";
import { streamMessages } from "@/lib/services/chat";
import ReactMarkdown from "react-markdown";
import styles from "./markdown.module.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  content: string;
  role: string;
  isLoading?: boolean;
  retriever_resources?: any[];
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
                retriever_resources: message.retriever_resources ?? [],
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
              className={`max-w-[80%] rounded-lg p-4 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : message.role === "user" ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className={styles.markdown}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {message.retriever_resources &&
                message.retriever_resources?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      引用文档
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {message.retriever_resources?.map((resource, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="text-sm font-medium hover:no-underline">
                            {resource.document_name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-sm text-gray-500">
                              {resource.content}
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="text-xs"
                                >
                                  <a
                                    href={`/documents/single?dify_document_id=${resource.document_id}`}
                                  >
                                    前往查看
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
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
