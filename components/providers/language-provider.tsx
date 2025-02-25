"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

type Locale = "en" | "zh";
type Messages = Record<string, string>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("locale") as Locale) || "en";
  });
  const [messages, setMessages] = useState<Messages>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("locale", locale);
    const loadMessages = async () => {
      setLoading(true);
      try {
        const messages = await import(`@/messages/${locale}.json`);
        setMessages(messages);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [locale]);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, messages }}>
      <IntlProvider messages={messages} locale={locale}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}
