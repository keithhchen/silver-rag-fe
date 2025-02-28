"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowUp,
  SquareArrowOutUpRight,
  Sparkles,
} from "lucide-react";
import { streamMessages } from "@/lib/services/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./markdown.module.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { translate } from "@/lib/i18n";

import { ChatMessage as Message } from "@/lib/services/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
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
      setMessages((prev) => [
        ...prev,
        { content: "", role: "assistant", isLoading: true },
      ]);

      await streamMessages(
        { query: input, conversation_id: conversationId },
        (message) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === "assistant") {
              const updatedMessage = {
                ...lastMessage,
                content: getUpdatedContent(lastMessage, message.content),
                isLoading: false,
                retriever_resources: message.retriever_resources ?? [],
              };
              // Store conversation_id when received from message events
              if (message.conversation_id) {
                setConversationId(message.conversation_id);
              }
              return [...prev.slice(0, -1), updatedMessage];
            } else {
              return [...prev, { ...message, isLoading: false }];
            }
          });
        },
        (error) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === "assistant") {
              const updatedMessage = {
                ...lastMessage,
                content: translate("chat.error.server")
                  .replace("{status}", String(error.status))
                  .replace("{code}", String(error.code))
                  .replace("{message}", error.message ?? ""),
                isLoading: false,
                error: true,
              };
              return [...prev.slice(0, -1), updatedMessage];
            }
            return [...prev];
          });
        }
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="chat" className="flex flex-col bg-background">
      <div
        id="messages"
        className={`flex-1 overflow-y-auto p-6 space-y-4 min-h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] ${
          messages.length === 0 ? "flex justify-center items-center" : ""
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center select-none">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                {translate("chat.startChat")}
              </h3>
              <p className="text-sm">{translate("chat.basedOnDocs")}</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } w-full py-2`}
            >
              <div
                className={`${
                  message.role === "user"
                    ? "max-w-[80%] md:max-w-[60%] ml-auto"
                    : "w-full md:max-w-[80%]"
                } text-sm ${
                  message.role === "user"
                    ? "bg-primary rounded-lg text-primary-foreground p-4"
                    : "bg-transparent p-2"
                }`}
              >
                {message.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div
                    className={`prose prose-invert max-w-none ${
                      message.error ? "font-mono text-muted-foreground" : ""
                    }`}
                  >
                    <div className={styles.markdown}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                {message.retriever_resources &&
                  message.retriever_resources?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        {translate("chat.citedDocs")}
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {message.retriever_resources?.map((resource, i) => (
                          <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="truncate text-sm font-medium hover:no-underline">
                              {resource.document_name}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm text-gray-500">
                                {resource.content}
                                <div className="mt-2">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    asChild
                                    className="text-xs p-0"
                                  >
                                    <a
                                      href={`/documents/single?dify_document_id=${resource.document_id}`}
                                      target="_blank"
                                    >
                                      <span className="pr-1">
                                        {translate("chat.viewDoc")}
                                      </span>
                                      <SquareArrowOutUpRight className="h-3 w-3" />
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-4 border-t sticky bottom-0 bg-background h-[4.5rem]">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={translate("chat.placeholder")}
            disabled={isLoading}
            className="flex-1 shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="transition rounded-full h-8 w-8 p-0 duration-300"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

const getUpdatedContent = (
  lastMessage: Message,
  newContent: string | undefined
): string => {
  if (lastMessage.isLoading) {
    return newContent || "";
  }

  const existingContent = lastMessage.content || "";
  const contentToAdd = newContent || "";
  return existingContent + contentToAdd;
};
