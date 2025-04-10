"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

const financeQuestions = [
  "What are the best investment options?",
  "How can I save on taxes?",
  "What is the best way to build credit?",
];

const legalQuestions = [
  "How do I start a business legally?",
  "What are my tenant rights?",
  "How does contract law work?",
];

export default function Chat() {
  const [activeTab, setActiveTab] = useState("finance");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Function to handle tab switch and reset messages
  const handleTabSwitch = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setMessages([]); // Clear chat history when switching tabs
    }
  };

  const sendMessage = async (message: string) => {
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
          category: activeTab,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Error fetching response" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center transition-all duration-500 ease-in-out"
      style={{
        backgroundImage: activeTab === "finance"
          ? "url('/finance-bg.jpg')" // Add a finance-related background image
          : "url('/legal-bg.jpg')",   // Add a legal-related background image
      }}
    >
      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => handleTabSwitch("finance")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "finance" ? "bg-blue-500 text-white" : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Finance Advisor
        </Button>
        <Button
          onClick={() => handleTabSwitch("legal")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "legal" ? "bg-green-500 text-white" : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Legal Advisor
        </Button>
      </div>

      <Card className="w-full max-w-2xl shadow-xl bg-opacity-90">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <CardTitle className="text-2xl font-bold">
            {activeTab === "finance" ? "Finance Advisor" : "Legal Advisor"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto p-4">
          {messages.map((m, index) => (
            <div key={index} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
              {m.role === "ai" ? (
                <span
                  className="inline-block p-2 rounded-lg bg-gray-200 text-black"
                  dangerouslySetInnerHTML={{ __html: m.content }} // Ensures AI response formatting
                />
              ) : (
                <span className="inline-block p-2 rounded-lg bg-blue-500 text-white">
                  {m.content}
                </span>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="text-left">
              <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                AI is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* General Questions Section */}
        <div className="p-4 bg-gray-100">
          <p className="text-sm font-bold mb-2">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {(activeTab === "finance" ? financeQuestions : legalQuestions).map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                className="text-sm px-3 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <CardFooter className="bg-gray-100">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${activeTab} matters...`}
              className="flex-grow"
            />
            <Button type="submit" disabled={isTyping} className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

